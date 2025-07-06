"""
Task management API endpoints.

This module provides REST API endpoints for managing tasks,
including creation, execution, monitoring, and shared memory access.
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel

from app.models.tasks import (
    Task, TaskCreate, TaskUpdate, TaskLog, TaskStatus,
    TaskType, TaskExecutionResult, TaskManagerStatus
)
from app.services.task_manager import get_task_manager
from app.services.shared_memory import get_shared_memory

router = APIRouter()


class TaskResponse(BaseModel):
    """Response model for task operations."""
    success: bool
    message: str
    data: Optional[Task] = None


class TaskListResponse(BaseModel):
    """Response model for task list operations."""
    success: bool
    message: str
    data: List[Task]


class SharedMemoryResponse(BaseModel):
    """Response model for shared memory operations."""
    success: bool
    message: str
    data: Optional[dict] = None


@router.get("/", response_model=TaskListResponse)
async def list_tasks(status: Optional[TaskStatus] = None):
    """List all tasks, optionally filtered by status."""
    try:
        task_manager = get_task_manager()
        tasks = task_manager.list_tasks(status)

        return TaskListResponse(
            success=True,
            message=f"Retrieved {len(tasks)} tasks",
            data=tasks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list tasks: {str(e)}")


@router.post("/", response_model=TaskResponse)
async def create_task(task_data: TaskCreate):
    """Create a new task."""
    try:
        task_manager = get_task_manager()
        task = task_manager.create_task(task_data)

        if not task:
            raise HTTPException(status_code=400, detail="Failed to create task")

        return TaskResponse(
            success=True,
            message=f"Task '{task.name}' created successfully",
            data=task
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create task: {str(e)}")


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(task_id: int):
    """Get a specific task by ID."""
    try:
        task_manager = get_task_manager()
        task = task_manager.get_task(task_id)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found")

        return TaskResponse(
            success=True,
            message="Task retrieved successfully",
            data=task
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get task: {str(e)}")


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, updates: TaskUpdate):
    """Update a task."""
    try:
        task_manager = get_task_manager()
        task = task_manager.update_task(task_id, updates)

        if not task:
            raise HTTPException(status_code=404, detail="Task not found or update failed")

        return TaskResponse(
            success=True,
            message="Task updated successfully",
            data=task
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update task: {str(e)}")


@router.delete("/{task_id}")
async def delete_task(task_id: int):
    """Delete a task."""
    try:
        task_manager = get_task_manager()
        success = task_manager.delete_task(task_id)

        if not success:
            raise HTTPException(status_code=404, detail="Task not found or delete failed")

        return {"success": True, "message": "Task deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete task: {str(e)}")


@router.post("/{task_id}/start")
async def start_task(task_id: int, background_tasks: BackgroundTasks):
    """Start a task."""
    try:
        task_manager = get_task_manager()

        # Add task start to background tasks
        background_tasks.add_task(task_manager.start_task, task_id)

        return {"success": True, "message": "Task start initiated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start task: {str(e)}")


@router.post("/{task_id}/stop")
async def stop_task(task_id: int, background_tasks: BackgroundTasks):
    """Stop a task."""
    try:
        task_manager = get_task_manager()

        # Add task stop to background tasks
        background_tasks.add_task(task_manager.stop_task, task_id)

        return {"success": True, "message": "Task stop initiated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to stop task: {str(e)}")


@router.get("/{task_id}/logs")
async def get_task_logs(task_id: int, limit: int = 50):
    """Get execution logs for a task."""
    try:
        task_manager = get_task_manager()
        logs = task_manager.get_task_logs(task_id, limit)

        return {
            "success": True,
            "message": f"Retrieved {len(logs)} log entries",
            "data": logs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get task logs: {str(e)}")


@router.get("/logs/all")
async def get_all_logs(limit: int = 100):
    """Get execution logs for all tasks."""
    try:
        task_manager = get_task_manager()
        logs = task_manager.get_task_logs(limit=limit)

        return {
            "success": True,
            "message": f"Retrieved {len(logs)} log entries",
            "data": logs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get logs: {str(e)}")


@router.get("/status/manager")
async def get_manager_status():
    """Get task manager status."""
    try:
        task_manager = get_task_manager()
        status = task_manager.get_status()

        return {
            "success": True,
            "message": "Task manager status retrieved",
            "data": status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get status: {str(e)}")


# Shared Memory endpoints
@router.get("/shared-memory/keys", response_model=SharedMemoryResponse)
async def list_shared_memory_keys(pattern: Optional[str] = None):
    """List all keys in shared memory."""
    try:
        shared_memory = get_shared_memory()
        keys = shared_memory.list_keys(pattern)

        return SharedMemoryResponse(
            success=True,
            message=f"Retrieved {len(keys)} keys",
            data={"keys": keys}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list keys: {str(e)}")


@router.get("/shared-memory/{key}", response_model=SharedMemoryResponse)
async def get_shared_memory_data(key: str):
    """Get data from shared memory."""
    try:
        shared_memory = get_shared_memory()
        data = shared_memory.get(key)

        if data is None:
            raise HTTPException(status_code=404, detail="Key not found or expired")

        return SharedMemoryResponse(
            success=True,
            message="Data retrieved successfully",
            data={"key": key, "value": data}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get data: {str(e)}")


@router.post("/shared-memory/{key}")
async def set_shared_memory_data(key: str, request_data: dict):
    """Set data in shared memory."""
    try:
        shared_memory = get_shared_memory()
        value = request_data.get("value")
        expires_at = request_data.get("expires_at")

        if value is None:
            raise HTTPException(status_code=400, detail="Value is required")

        success = shared_memory.set(key, value, expires_at)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to set data")

        return {"success": True, "message": "Data stored successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to set data: {str(e)}")


@router.delete("/shared-memory/{key}")
async def delete_shared_memory_data(key: str):
    """Delete data from shared memory."""
    try:
        shared_memory = get_shared_memory()
        success = shared_memory.delete(key)

        if not success:
            raise HTTPException(status_code=404, detail="Key not found")

        return {"success": True, "message": "Data deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete data: {str(e)}")


@router.get("/shared-memory/stats/all")
async def get_shared_memory_stats():
    """Get shared memory statistics."""
    try:
        shared_memory = get_shared_memory()
        stats = shared_memory.get_stats()

        return {
            "success": True,
            "message": "Statistics retrieved successfully",
            "data": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get stats: {str(e)}")


@router.post("/shared-memory/cleanup")
async def cleanup_expired_data():
    """Cleanup expired data from shared memory."""
    try:
        shared_memory = get_shared_memory()
        cleaned_count = shared_memory.cleanup_expired()

        return {
            "success": True,
            "message": f"Cleaned up {cleaned_count} expired records"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to cleanup: {str(e)}")


# Initial task creation endpoints
@router.post("/init/ticker-fetcher")
async def create_ticker_fetcher_task():
    """Create the initial ticker fetcher task."""
    try:
        task_data = TaskCreate(
            name="ticker_fetcher",
            description="Fetches current ticker data from Luno API at regular intervals",
            task_type=TaskType.TICKER_FETCHER,
            auto_start=True,
            interval_seconds=30,  # Every 30 seconds
            config={
                "symbols": ["XBTZAR", "ETHZAR", "XBTUSD", "ETHUSD"]
            }
        )

        task_manager = get_task_manager()
        task = task_manager.create_task(task_data)

        if not task:
            raise HTTPException(status_code=400, detail="Failed to create ticker fetcher task")

        return TaskResponse(
            success=True,
            message="Ticker fetcher task created successfully",
            data=task
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create ticker fetcher: {str(e)}")
