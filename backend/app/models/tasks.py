"""
Task-related Pydantic models and schemas for the TradingBot.

This module defines the data models for task management, including
task definitions, execution logs, and shared data structures.
"""

from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class TaskType(str, Enum):
    """Enumeration of available task types."""
    TICKER_FETCHER = "ticker_fetcher"
    PRICE_MONITOR = "price_monitor"
    TRADING_SIGNAL = "trading_signal"
    DATA_CLEANUP = "data_cleanup"
    MODEL_TRAINER = "model_trainer"
    CUSTOM = "custom"


class TaskStatus(str, Enum):
    """Enumeration of task statuses."""
    INACTIVE = "inactive"
    ACTIVE = "active"
    RUNNING = "running"
    PAUSED = "paused"
    ERROR = "error"
    STOPPED = "stopped"


class LogStatus(str, Enum):
    """Enumeration of task log statuses."""
    STARTED = "started"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"


class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    task_type: TaskType
    auto_start: bool = False
    interval_seconds: Optional[int] = Field(None, ge=1)
    config: Optional[Dict[str, Any]] = None

    class Config:
        """Pydantic configuration."""
        use_enum_values = True


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    task_type: Optional[TaskType] = None
    status: Optional[TaskStatus] = None
    auto_start: Optional[bool] = None
    interval_seconds: Optional[int] = Field(None, ge=1)
    config: Optional[Dict[str, Any]] = None

    class Config:
        """Pydantic configuration."""
        use_enum_values = True


class Task(BaseModel):
    """Schema for a complete task object."""
    id: int
    name: str
    description: Optional[str] = None
    task_type: TaskType
    status: TaskStatus
    auto_start: bool
    interval_seconds: Optional[int] = None
    last_run: Optional[datetime] = None
    next_run: Optional[datetime] = None
    config: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic configuration."""
        use_enum_values = True
        from_attributes = True


class TaskLogCreate(BaseModel):
    """Schema for creating a task log entry."""
    task_id: int
    status: LogStatus
    message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    error_details: Optional[str] = None

    class Config:
        """Pydantic configuration."""
        use_enum_values = True


class TaskLog(BaseModel):
    """Schema for a complete task log object."""
    id: int
    task_id: int
    status: LogStatus
    message: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    error_details: Optional[str] = None

    class Config:
        """Pydantic configuration."""
        use_enum_values = True
        from_attributes = True


class SharedDataCreate(BaseModel):
    """Schema for creating shared data."""
    key: str = Field(..., min_length=1, max_length=100)
    value: Any
    data_type: str = "json"
    expires_at: Optional[datetime] = None


class SharedDataUpdate(BaseModel):
    """Schema for updating shared data."""
    value: Any
    expires_at: Optional[datetime] = None


class SharedData(BaseModel):
    """Schema for shared data object."""
    key: str
    value: Any
    data_type: str
    updated_at: datetime
    expires_at: Optional[datetime] = None

    class Config:
        """Pydantic configuration."""
        from_attributes = True


class TaskExecutionResult(BaseModel):
    """Schema for task execution results."""
    success: bool
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    duration_ms: Optional[int] = None
    error_details: Optional[str] = None


class TickerData(BaseModel):
    """Schema for ticker data shared between tasks."""
    symbol: str
    last_trade: float
    bid: float
    ask: float
    change_24h: float
    volume_24h: float
    timestamp: datetime

    class Config:
        """Pydantic configuration."""
        from_attributes = True


class TaskManagerStatus(BaseModel):
    """Schema for task manager status."""
    total_tasks: int
    active_tasks: int
    running_tasks: int
    failed_tasks: int
    last_execution_time: Optional[datetime] = None
    uptime_seconds: int
