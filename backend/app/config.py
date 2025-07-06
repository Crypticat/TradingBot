"""
Configuration module for the TradingBot backend.

This module handles environment variables and provides centralized configuration
for the entire application, including logging configuration.
"""
import os
import logging


class Config:
    """Configuration class for the TradingBot backend."""

    def __init__(self):
        self.log_level = self._get_log_level()
        self.host = os.getenv("TRADINGBOT_HOST", "0.0.0.0")
        self.port = int(os.getenv("TRADINGBOT_PORT", "8000"))
        self.reload = os.getenv("TRADINGBOT_RELOAD", "True").lower() == "true"
        self.cors_origins = os.getenv(
            "TRADINGBOT_CORS_ORIGINS", "http://localhost:3000"
        ).split(",")

        # Database configuration
        self.db_path = os.getenv(
            "TRADINGBOT_DB_PATH", "backend/app/db/app.db"
        )

        # Task manager configuration
        self.task_manager_enabled = os.getenv(
            "TRADINGBOT_TASK_MANAGER_ENABLED", "True"
        ).lower() == "true"

    def _get_log_level(self) -> int:
        """
        Get the log level from environment variable.

        Returns:
            int: The logging level constant
        """
        log_level_str = os.getenv("TRADINGBOT_LOG_LEVEL", "INFO").upper()

        # Map string log levels to logging constants
        level_mapping = {
            "DEBUG": logging.DEBUG,
            "INFO": logging.INFO,
            "WARNING": logging.WARNING,
            "WARN": logging.WARNING,  # Alternative for WARNING
            "ERROR": logging.ERROR,
            "CRITICAL": logging.CRITICAL,
            "FATAL": logging.CRITICAL,  # Alternative for CRITICAL
        }

        return level_mapping.get(log_level_str, logging.INFO)

    def configure_logging(self) -> None:
        """
        Configure logging for the entire application.

        This should be called once at application startup to set up
        consistent logging across all modules.
        """
        # Configure root logger
        logging.basicConfig(
            level=self.log_level,
            format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            force=True  # Override any existing configuration
        )

        # Set specific logger levels if needed
        # For example, you might want to reduce noise from third-party libraries
        if self.log_level > logging.DEBUG:
            # Reduce noise from uvicorn and other libraries when not in debug mode
            logging.getLogger("uvicorn").setLevel(logging.WARNING)
            logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
            logging.getLogger("uvicorn.error").setLevel(logging.WARNING)

    def get_log_level_name(self) -> str:
        """
        Get the current log level as a string.

        Returns:
            str: The log level name (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        """
        return logging.getLevelName(self.log_level)


# Global configuration instance
config = Config()


def get_config() -> Config:
    """
    Get the global configuration instance.

    Returns:
        Config: The global configuration instance
    """
    return config


def configure_logging() -> None:
    """
    Configure logging for the application.

    This is a convenience function that calls the config's configure_logging method.
    """
    config.configure_logging()
