#!/usr/bin/env python3
"""
Initialize the TradingBot task system.

This script sets up the database, creates initial tasks,
and provides a way to start the task management system.
"""

import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))

from app.db.database import get_db_manager
from app.services.shared_memory import get_shared_memory, initialize_shared_memory
from app.services.task_manager import get_task_manager
from app.models.tasks import TaskCreate, TaskType


def initialize_system():
    """Initialize the task management system."""
    print("Initializing TradingBot Task System...")

    # Initialize database
    print("Setting up database...")
    db_manager = get_db_manager()
    print("✓ Database initialized")

    # Initialize shared memory
    print("Setting up shared memory...")
    initialize_shared_memory(db_manager)
    shared_memory = get_shared_memory()
    print("✓ Shared memory initialized")

    # Initialize task manager
    print("Setting up task manager...")
    task_manager = get_task_manager()
    print("✓ Task manager initialized")

    return db_manager, shared_memory, task_manager


def create_initial_tasks(task_manager):
    """Create initial tasks for the system."""
    print("\nCreating initial tasks...")

    # Check if ticker fetcher already exists
    existing_tasks = task_manager.list_tasks()
    ticker_exists = any(task.name == "ticker_fetcher" for task in existing_tasks)

    if not ticker_exists:
        # Create ticker fetcher task
        ticker_task = TaskCreate(
            name="ticker_fetcher",
            description="Fetches current ticker data from Luno API at regular intervals",
            task_type=TaskType.TICKER_FETCHER,
            auto_start=True,
            interval_seconds=30,  # Every 30 seconds
            config={
                "symbols": ["XBTZAR", "ETHZAR", "XBTUSD", "ETHUSD"]
            }
        )

        task = task_manager.create_task(ticker_task)
        if task:
            print(f"✓ Created ticker fetcher task (ID: {task.id})")
        else:
            print("✗ Failed to create ticker fetcher task")
    else:
        print("✓ Ticker fetcher task already exists")

    # Show all tasks
    tasks = task_manager.list_tasks()
    print(f"\nTotal tasks: {len(tasks)}")
    for task in tasks:
        status_icon = "🔄" if task.status.value == "active" else "⏸️"
        auto_icon = "🚀" if task.auto_start else "🔧"
        print(f"  {status_icon} {auto_icon} {task.name} ({task.task_type.value}) - {task.status.value}")


def main():
    """Main initialization function."""
    try:
        # Initialize system
        db_manager, shared_memory, task_manager = initialize_system()

        # Create initial tasks
        create_initial_tasks(task_manager)

        print("\n" + "="*60)
        print("TRADINGBOT TASK SYSTEM READY!")
        print("="*60)
        print("Database initialized with task tables")
        print("Shared memory system ready")
        print("Task manager initialized")
        print("\nTo start the API server with tasks:")
        print("  cd backend && python run.py")
        print("\nTo view tasks via API:")
        print("  GET http://localhost:8000/api/tasks/")
        print("  GET http://localhost:8000/api/tasks/shared-memory/keys")
        print("="*60)

        return True

    except Exception as e:
        print(f"❌ Initialization failed: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
