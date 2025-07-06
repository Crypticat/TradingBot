"""
Shared memory manager for inter-task communication.

This module provides a shared memory system that allows tasks to store
and retrieve data that can be accessed by other tasks.
"""

import json
import logging
import sqlite3
from datetime import datetime, timezone
from typing import Any, Optional, Dict

logger = logging.getLogger(__name__)


class SharedMemoryManager:
    """Manager for shared data between tasks."""

    def __init__(self, db_manager=None):
        """Initialize the shared memory manager."""
        self.db_manager = db_manager

    def set_db_manager(self, db_manager):
        """Set the database manager."""
        self.db_manager = db_manager

    def set(self, key: str, value: Any, expires_at: Optional[datetime] = None) -> bool:
        """Store data in shared memory."""
        if not self.db_manager:
            logger.error("Database manager not initialized")
            return False

        try:
            json_value = json.dumps(value, default=str)

            # Try to update first, then insert if not found
            update_query = '''
                UPDATE shared_data
                SET value = ?, updated_at = CURRENT_TIMESTAMP, expires_at = ?
                WHERE key = ?
            '''
            rows_affected = self.db_manager.execute_update(update_query, (json_value, expires_at, key))

            if rows_affected == 0:
                # Insert new record
                insert_query = '''
                    INSERT INTO shared_data (key, value, data_type, expires_at)
                    VALUES (?, ?, 'json', ?)
                '''
                self.db_manager.execute_update(insert_query, (key, json_value, expires_at))

            logger.info("Stored data in shared memory: %s", key)
            return True

        except (sqlite3.Error, json.JSONDecodeError, ValueError, TypeError) as e:
            logger.error("Failed to store data in shared memory: %s", e)
            return False

    def get(self, key: str, default: Any = None) -> Any:
        """Retrieve data from shared memory."""
        if not self.db_manager:
            logger.error("Database manager not initialized")
            return default

        try:
            query = 'SELECT * FROM shared_data WHERE key = ?'
            results = self.db_manager.execute_query(query, (key,))

            if not results:
                return default

            data = dict(results[0])

            # Check if data has expired
            if data.get('expires_at'):
                expires_at = datetime.fromisoformat(data['expires_at'].replace('Z', '+00:00'))
                if expires_at < datetime.now(timezone.utc):
                    self.delete(key)
                    return default

            return json.loads(data['value'])

        except (sqlite3.Error, json.JSONDecodeError, ValueError) as e:
            logger.error("Failed to retrieve data from shared memory: %s", e)
            return default

    def delete(self, key: str) -> bool:
        """Delete data from shared memory."""
        if not self.db_manager:
            return False

        try:
            query = 'DELETE FROM shared_data WHERE key = ?'
            rows_affected = self.db_manager.execute_update(query, (key,))
            return rows_affected > 0
        except sqlite3.Error as e:
            logger.error("Failed to delete data from shared memory: %s", e)
            return False

    def exists(self, key: str) -> bool:
        """Check if a key exists in shared memory."""
        return self.get(key) is not None

    def list_keys(self, pattern: Optional[str] = None) -> list:
        """List all keys in shared memory."""
        if not self.db_manager:
            return []

        try:
            if pattern:
                query = '''SELECT key FROM shared_data
                          WHERE key LIKE ? AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)'''
                results = self.db_manager.execute_query(query, (pattern,))
            else:
                query = '''SELECT key FROM shared_data
                          WHERE expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP'''
                results = self.db_manager.execute_query(query, ())

            return [row['key'] for row in results]
        except sqlite3.Error as e:
            logger.error("Failed to list keys: %s", e)
            return []

    def cleanup_expired(self) -> int:
        """Remove expired data from shared memory."""
        if not self.db_manager:
            return 0

        try:
            query = '''DELETE FROM shared_data
                      WHERE expires_at IS NOT NULL AND expires_at <= CURRENT_TIMESTAMP'''
            return self.db_manager.execute_update(query, ())
        except sqlite3.Error as e:
            logger.error("Failed to cleanup expired data: %s", e)
            return 0

    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about shared memory usage."""
        if not self.db_manager:
            return {}

        try:
            total_result = self.db_manager.execute_query('SELECT COUNT(*) as count FROM shared_data', ())
            total_count = total_result[0]['count'] if total_result else 0

            expired_query = '''SELECT COUNT(*) as count FROM shared_data
                              WHERE expires_at IS NOT NULL AND expires_at <= CURRENT_TIMESTAMP'''
            expired_result = self.db_manager.execute_query(expired_query, ())
            expired_count = expired_result[0]['count'] if expired_result else 0

            recent_result = self.db_manager.execute_query('SELECT MAX(updated_at) as latest FROM shared_data', ())
            latest_update = recent_result[0]['latest'] if recent_result and recent_result[0]['latest'] else None

            return {
                'total_records': total_count,
                'expired_records': expired_count,
                'active_records': total_count - expired_count,
                'latest_update': latest_update
            }
        except sqlite3.Error as e:
            logger.error("Failed to get stats: %s", e)
            return {}


# Module-level instance
_shared_memory = SharedMemoryManager()


def get_shared_memory() -> SharedMemoryManager:
    """Get the shared memory manager instance."""
    return _shared_memory


def initialize_shared_memory(db_manager):
    """Initialize shared memory with database manager."""
    _shared_memory.set_db_manager(db_manager)
