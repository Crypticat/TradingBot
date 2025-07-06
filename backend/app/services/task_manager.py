"""
Task management service for the TradingBot.

This module provides task scheduling and execution capabilities,
including automatic task startup and interval-based execution.
"""

import asyncio
import json
import logging
import threading
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from concurrent.futures import ThreadPoolExecutor

from app.db.database import get_db_manager
from app.models.tasks import (
    Task, TaskCreate, TaskUpdate, TaskStatus, TaskType,
    TaskLog, TaskLogCreate, LogStatus, TaskExecutionResult
)
from app.services.shared_memory import get_shared_memory, initialize_shared_memory

logger = logging.getLogger(__name__)


class TaskExecutor:
    """Base class for task executors."""

    def __init__(self, task: Task):
        """Initialize task executor."""
        self.task = task
        self.shared_memory = get_shared_memory()

    async def execute(self) -> TaskExecutionResult:
        """Execute the task. Override in subclasses."""
        raise NotImplementedError("Subclasses must implement execute method")


class TickerFetcherExecutor(TaskExecutor):
    """Executor for ticker fetching tasks."""

    async def execute(self) -> TaskExecutionResult:
        """Fetch current ticker data and store in shared memory."""
        try:
            # Import here to avoid circular imports
            from app.services.luno_api import LunoAPI

            start_time = time.time()

            # Get configuration
            config = self.task.config or {}
            symbols = config.get('symbols', ['XBTZAR', 'ETHZAR'])

            # Initialize Luno API
            luno_api = LunoAPI()

            # Fetch ticker data for each symbol
            ticker_data = {}
            for symbol in symbols:
                try:
                    ticker = luno_api.get_ticker(symbol)
                    if ticker:
                        ticker_data[symbol] = {
                            'symbol': symbol,
                            'last_trade': float(ticker.get('last_trade', 0)),
                            'bid': float(ticker.get('bid', 0)),
                            'ask': float(ticker.get('ask', 0)),
                            'change_24h': float(ticker.get('rolling_24_hour_volume', 0)),
                            'volume_24h': float(ticker.get('rolling_24_hour_volume', 0)),
                            'timestamp': datetime.now().isoformat()
                        }
                        logger.info("Fetched ticker data for %s: %s", symbol, ticker_data[symbol]['last_trade'])
                except Exception as e:
                    logger.error("Failed to fetch ticker for %s: %s", symbol, e)
                    continue

            # Store in shared memory
            if ticker_data:
                self.shared_memory.set('current_tickers', ticker_data)
                self.shared_memory.set('ticker_last_update', datetime.now().isoformat())

            duration_ms = int((time.time() - start_time) * 1000)

            return TaskExecutionResult(
                success=True,
                message=f"Successfully fetched {len(ticker_data)} tickers",
                data={'tickers_count': len(ticker_data), 'symbols': list(ticker_data.keys())},
                duration_ms=duration_ms
            )

        except Exception as e:
            logger.error("Ticker fetcher task failed: %s", e)
            return TaskExecutionResult(
                success=False,
                message="Failed to fetch ticker data",
                error_details=str(e),
                duration_ms=int((time.time() - start_time) * 1000) if 'start_time' in locals() else None
            )


class TaskManager:
    """Main task management system."""

    def __init__(self):
        """Initialize task manager."""
        self.db_manager = get_db_manager()
        initialize_shared_memory(self.db_manager)
        self.shared_memory = get_shared_memory()

        # Task execution
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.running_tasks: Dict[int, asyncio.Task] = {}
        self.is_running = False
        self.scheduler_task: Optional[asyncio.Task] = None

        # Task executors registry
        self.task_executors: Dict[TaskType, type] = {
            TaskType.TICKER_FETCHER: TickerFetcherExecutor,
        }

        # Statistics
        self.start_time = datetime.now()

    def start(self) -> None:
        """Start the task manager."""
        if self.is_running:
            logger.warning("Task manager is already running")
            return

        self.is_running = True
        logger.info("Starting task manager...")

        # Start auto-start tasks
        self._start_auto_start_tasks()

        # Start scheduler loop
        loop = asyncio.get_event_loop()
        self.scheduler_task = loop.create_task(self._scheduler_loop())

        logger.info("Task manager started successfully")

    def stop(self) -> None:
        """Stop the task manager."""
        if not self.is_running:
            return

        logger.info("Stopping task manager...")
        self.is_running = False

        # Cancel all running tasks
        for task_id, task in self.running_tasks.items():
            if not task.done():
                task.cancel()
                logger.info("Cancelled running task: %d", task_id)

        # Cancel scheduler
        if self.scheduler_task and not self.scheduler_task.done():
            self.scheduler_task.cancel()

        self.executor.shutdown(wait=True)
        logger.info("Task manager stopped")

    def create_task(self, task_data: TaskCreate) -> Optional[Task]:
        """Create a new task."""
        try:
            # Convert config to JSON string
            config_json = json.dumps(task_data.config) if task_data.config else None

            query = '''
                INSERT INTO tasks (name, description, task_type, auto_start, interval_seconds, config)
                VALUES (?, ?, ?, ?, ?, ?)
            '''
            params = (
                task_data.name,
                task_data.description,
                task_data.task_type.value,
                task_data.auto_start,
                task_data.interval_seconds,
                config_json
            )

            task_id = self.db_manager.execute_update(query, params)

            if task_id:
                logger.info("Created task: %s (ID: %d)", task_data.name, task_id)
                return self.get_task(task_id)

        except Exception as e:
            logger.error("Failed to create task: %s", e)

        return None

    def get_task(self, task_id: int) -> Optional[Task]:
        """Get a task by ID."""
        try:
            query = 'SELECT * FROM tasks WHERE id = ?'
            results = self.db_manager.execute_query(query, (task_id,))

            if results:
                row = dict(results[0])
                # Parse config JSON
                if row['config']:
                    row['config'] = json.loads(row['config'])
                return Task(**row)

        except Exception as e:
            logger.error("Failed to get task %d: %s", task_id, e)

        return None

    def list_tasks(self, status: Optional[TaskStatus] = None) -> List[Task]:
        """List all tasks, optionally filtered by status."""
        try:
            if status:
                query = 'SELECT * FROM tasks WHERE status = ? ORDER BY created_at DESC'
                params = (status.value,)
            else:
                query = 'SELECT * FROM tasks ORDER BY created_at DESC'
                params = ()

            results = self.db_manager.execute_query(query, params)
            tasks = []

            for row in results:
                row_dict = dict(row)
                if row_dict['config']:
                    row_dict['config'] = json.loads(row_dict['config'])
                tasks.append(Task(**row_dict))

            return tasks

        except Exception as e:
            logger.error("Failed to list tasks: %s", e)
            return []

    def update_task(self, task_id: int, updates: TaskUpdate) -> Optional[Task]:
        """Update a task."""
        try:
            # Build update query dynamically
            update_fields = []
            params = []

            for field, value in updates.dict(exclude_unset=True).items():
                if field == 'config' and value is not None:
                    update_fields.append(f"{field} = ?")
                    params.append(json.dumps(value))
                else:
                    update_fields.append(f"{field} = ?")
                    params.append(value)

            if not update_fields:
                return self.get_task(task_id)

            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(task_id)

            query = f"UPDATE tasks SET {', '.join(update_fields)} WHERE id = ?"
            self.db_manager.execute_update(query, tuple(params))

            logger.info("Updated task: %d", task_id)
            return self.get_task(task_id)

        except Exception as e:
            logger.error("Failed to update task %d: %s", task_id, e)
            return None

    def delete_task(self, task_id: int) -> bool:
        """Delete a task."""
        try:
            # Stop task if running
            if task_id in self.running_tasks:
                # Create a task to stop it asynchronously
                loop = asyncio.get_event_loop()
                loop.create_task(self.stop_task(task_id))

            query = 'DELETE FROM tasks WHERE id = ?'
            rows_affected = self.db_manager.execute_update(query, (task_id,))

            if rows_affected > 0:
                logger.info("Deleted task: %d", task_id)
                return True

        except Exception as e:
            logger.error("Failed to delete task %d: %s", task_id, e)

        return False

    async def start_task(self, task_id: int) -> bool:
        """Start a task."""
        if task_id in self.running_tasks:
            logger.warning("Task %d is already running", task_id)
            return False

        task = self.get_task(task_id)
        if not task:
            logger.error("Task %d not found", task_id)
            return False

        try:
            # Update task status
            self.update_task(task_id, TaskUpdate(status=TaskStatus.ACTIVE))

            # Create and start task execution
            if task.interval_seconds:
                # Recurring task
                task_coroutine = self._run_recurring_task(task)
            else:
                # One-time task
                task_coroutine = self._run_single_task(task)

            loop = asyncio.get_event_loop()
            self.running_tasks[task_id] = loop.create_task(task_coroutine)

            logger.info("Started task: %d (%s)", task_id, task.name)
            return True

        except Exception as e:
            logger.error("Failed to start task %d: %s", task_id, e)
            return False

    async def stop_task(self, task_id: int) -> bool:
        """Stop a running task."""
        if task_id not in self.running_tasks:
            logger.warning("Task %d is not running", task_id)
            return False

        try:
            task = self.running_tasks[task_id]
            if not task.done():
                task.cancel()
                await task

            del self.running_tasks[task_id]

            # Update task status
            self.update_task(task_id, TaskUpdate(status=TaskStatus.STOPPED))

            logger.info("Stopped task: %d", task_id)
            return True

        except Exception as e:
            logger.error("Failed to stop task %d: %s", task_id, e)
            return False

    def _start_auto_start_tasks(self) -> None:
        """Start all tasks marked for auto-start."""
        auto_start_tasks = self.list_tasks()

        for task in auto_start_tasks:
            if task.auto_start and task.status != TaskStatus.RUNNING:
                asyncio.create_task(self.start_task(task.id))

    async def _scheduler_loop(self) -> None:
        """Main scheduler loop for managing task execution."""
        while self.is_running:
            try:
                # Check for tasks that need to run
                active_tasks = self.list_tasks(TaskStatus.ACTIVE)

                for task in active_tasks:
                    if (task.interval_seconds and
                        task.id not in self.running_tasks and
                        self._should_run_task(task)):
                        await self.start_task(task.id)

                # Clean up completed tasks
                completed_task_ids = []
                for task_id, task_ref in self.running_tasks.items():
                    if task_ref.done():
                        completed_task_ids.append(task_id)

                for task_id in completed_task_ids:
                    del self.running_tasks[task_id]
                    # Update task status if it was a one-time task
                    task = self.get_task(task_id)
                    if task and not task.interval_seconds:
                        self.update_task(task_id, TaskUpdate(status=TaskStatus.INACTIVE))

                # Cleanup expired shared memory
                self.shared_memory.cleanup_expired()

                await asyncio.sleep(5)  # Check every 5 seconds

            except Exception as e:
                logger.error("Error in scheduler loop: %s", e)
                await asyncio.sleep(10)

    def _should_run_task(self, task: Task) -> bool:
        """Check if a task should run based on its schedule."""
        if not task.interval_seconds:
            return True

        if not task.last_run:
            return True

        try:
            last_run = datetime.fromisoformat(task.last_run.replace('Z', ''))
            next_run = last_run + timedelta(seconds=task.interval_seconds)
            return datetime.now() >= next_run
        except (ValueError, AttributeError):
            return True

    async def _run_single_task(self, task: Task) -> None:
        """Run a single execution of a task."""
        await self._execute_task(task)

    async def _run_recurring_task(self, task: Task) -> None:
        """Run a task at regular intervals."""
        while task.id in self.running_tasks and self.is_running:
            try:
                await self._execute_task(task)

                if task.interval_seconds:
                    await asyncio.sleep(task.interval_seconds)
                else:
                    break

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error("Error in recurring task %d: %s", task.id, e)
                await asyncio.sleep(10)  # Wait before retrying

    async def _execute_task(self, task: Task) -> None:
        """Execute a single task."""
        log_id = None
        start_time = datetime.now()

        try:
            # Create task log entry
            log_data = TaskLogCreate(
                task_id=task.id,
                status=LogStatus.STARTED,
                message=f"Starting task execution",
                started_at=start_time
            )
            log_id = self._create_task_log(log_data)

            # Update task status
            self.update_task(task.id, TaskUpdate(
                status=TaskStatus.RUNNING,
                last_run=start_time
            ))

            # Get executor for task type
            executor_class = self.task_executors.get(task.task_type)
            if not executor_class:
                raise ValueError(f"No executor found for task type: {task.task_type}")

            # Execute task
            executor = executor_class(task)
            result = await executor.execute()

            # Update task log
            end_time = datetime.now()
            if log_id:
                self._update_task_log(log_id, {
                    'status': LogStatus.COMPLETED if result.success else LogStatus.FAILED,
                    'message': result.message,
                    'completed_at': end_time,
                    'duration_ms': result.duration_ms,
                    'error_details': result.error_details
                })

            # Update task status
            if task.interval_seconds:
                # Keep active for recurring tasks
                status = TaskStatus.ACTIVE
            else:
                # Mark as inactive for one-time tasks
                status = TaskStatus.INACTIVE

            self.update_task(task.id, TaskUpdate(
                status=status,
                next_run=datetime.now() + timedelta(seconds=task.interval_seconds) if task.interval_seconds else None
            ))

            logger.info("Task %d completed: %s", task.id, result.message)

        except Exception as e:
            logger.error("Task %d execution failed: %s", task.id, e)

            # Update task log
            end_time = datetime.now()
            if log_id:
                self._update_task_log(log_id, {
                    'status': LogStatus.FAILED,
                    'message': f"Task execution failed: {str(e)}",
                    'completed_at': end_time,
                    'error_details': str(e)
                })

            # Update task status
            self.update_task(task.id, TaskUpdate(status=TaskStatus.ERROR))

    def _create_task_log(self, log_data: TaskLogCreate) -> Optional[int]:
        """Create a task log entry."""
        try:
            query = '''
                INSERT INTO task_logs (task_id, status, message, started_at, completed_at, duration_ms, error_details)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            '''
            params = (
                log_data.task_id,
                log_data.status.value,
                log_data.message,
                log_data.started_at,
                log_data.completed_at,
                log_data.duration_ms,
                log_data.error_details
            )

            return self.db_manager.execute_update(query, params)

        except Exception as e:
            logger.error("Failed to create task log: %s", e)
            return None

    def _update_task_log(self, log_id: int, updates: dict) -> bool:
        """Update a task log entry."""
        try:
            update_fields = []
            params = []

            for field, value in updates.items():
                if field == 'status' and hasattr(value, 'value'):
                    update_fields.append(f"{field} = ?")
                    params.append(value.value)
                else:
                    update_fields.append(f"{field} = ?")
                    params.append(value)

            if not update_fields:
                return True

            params.append(log_id)
            query = f"UPDATE task_logs SET {', '.join(update_fields)} WHERE id = ?"

            self.db_manager.execute_update(query, tuple(params))
            return True

        except Exception as e:
            logger.error("Failed to update task log %d: %s", log_id, e)
            return False

    def get_task_logs(self, task_id: Optional[int] = None, limit: int = 100) -> List[TaskLog]:
        """Get task execution logs."""
        try:
            if task_id:
                query = '''SELECT * FROM task_logs WHERE task_id = ?
                          ORDER BY started_at DESC LIMIT ?'''
                params = (task_id, limit)
            else:
                query = 'SELECT * FROM task_logs ORDER BY started_at DESC LIMIT ?'
                params = (limit,)

            results = self.db_manager.execute_query(query, params)
            return [TaskLog(**dict(row)) for row in results]

        except Exception as e:
            logger.error("Failed to get task logs: %s", e)
            return []

    def get_status(self) -> dict:
        """Get task manager status."""
        tasks = self.list_tasks()

        return {
            'total_tasks': len(tasks),
            'active_tasks': len([t for t in tasks if t.status == TaskStatus.ACTIVE]),
            'running_tasks': len(self.running_tasks),
            'failed_tasks': len([t for t in tasks if t.status == TaskStatus.ERROR]),
            'last_execution_time': max([t.last_run for t in tasks if t.last_run], default=None),
            'uptime_seconds': int((datetime.now() - self.start_time).total_seconds()),
            'is_running': self.is_running
        }


# Global task manager instance
_task_manager = None


def get_task_manager() -> TaskManager:
    """Get the global task manager instance."""
    global _task_manager
    if _task_manager is None:
        _task_manager = TaskManager()
    return _task_manager
