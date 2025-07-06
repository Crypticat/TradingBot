"""
Database configuration and setup for the TradingBot.

This module provides database initialization and connection management
using SQLite for storing task information and other persistent data.
"""

import sqlite3
import logging
from pathlib import Path
from contextlib import contextmanager

# Configure logging
logger = logging.getLogger(__name__)

# Database file path
DB_DIR = Path(__file__).parent
DB_PATH = DB_DIR / "app.db"

# Ensure directory exists
DB_DIR.mkdir(exist_ok=True)


class DatabaseManager:
    """
    Database manager for SQLite operations.

    Provides connection management and database initialization.
    """

    def __init__(self, db_path: str = str(DB_PATH)):
        """
        Initialize database manager.

        Args:
            db_path: Path to the SQLite database file
        """
        self.db_path = db_path
        self.init_database()

    @contextmanager
    def get_connection(self):
        """
        Context manager for database connections.

        Yields:
            sqlite3.Connection: Database connection
        """
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Enable dict-like access to rows
        try:
            yield conn
        except Exception as e:
            conn.rollback()
            logger.error("Database error: %s", e)
            raise
        finally:
            conn.close()

    def init_database(self) -> None:
        """Initialize database with required tables."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Create tasks table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    description TEXT,
                    task_type TEXT NOT NULL,
                    status TEXT DEFAULT 'inactive',
                    auto_start BOOLEAN DEFAULT FALSE,
                    interval_seconds INTEGER,
                    last_run TIMESTAMP,
                    next_run TIMESTAMP,
                    config TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')

            # Create task_logs table for tracking task execution
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS task_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id INTEGER NOT NULL,
                    status TEXT NOT NULL,
                    message TEXT,
                    started_at TIMESTAMP NOT NULL,
                    completed_at TIMESTAMP,
                    duration_ms INTEGER,
                    error_details TEXT,
                    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
                )
            ''')

            # Create shared_data table for inter-task communication
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS shared_data (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    data_type TEXT DEFAULT 'json',
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP
                )
            ''')

            # Create indexes for better performance
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_tasks_status
                ON tasks (status)
            ''')

            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_tasks_auto_start
                ON tasks (auto_start)
            ''')

            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_task_logs_task_id
                ON task_logs (task_id)
            ''')

            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_shared_data_expires
                ON shared_data (expires_at)
            ''')

            conn.commit()
            logger.info("Database initialized successfully")

    def execute_query(self, query: str, params: tuple = ()) -> list:
        """
        Execute a SELECT query and return results.

        Args:
            query: SQL query string
            params: Query parameters

        Returns:
            list: Query results as list of dict-like objects
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            return cursor.fetchall()

    def execute_update(self, query: str, params: tuple = ()) -> int:
        """
        Execute an INSERT/UPDATE/DELETE query.

        Args:
            query: SQL query string
            params: Query parameters

        Returns:
            int: Number of affected rows or last row ID for INSERT
        """
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            conn.commit()
            last_id = cursor.lastrowid
            return last_id if (last_id is not None and
                              query.strip().upper().startswith('INSERT')) else cursor.rowcount


# Global database manager instance
db_manager = DatabaseManager()


def get_db_manager() -> DatabaseManager:
    """
    Get the global database manager instance.

    Returns:
        DatabaseManager: Database manager instance
    """
    return db_manager
