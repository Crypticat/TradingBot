@echo off
REM TradingBot Backend Runner Script for Windows
REM This script activates the virtual environment and runs the backend server

setlocal enabledelayedexpansion

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."

REM Define paths
set "VENV_PATH=%PROJECT_ROOT%\venv"
set "BACKEND_PATH=%PROJECT_ROOT%\backend"
set "PYTHON_SCRIPT=%BACKEND_PATH%\run.py"

echo [INFO] TradingBot Backend Server Launcher
echo [INFO] Project root: %PROJECT_ROOT%
echo [INFO] Virtual environment: %VENV_PATH%
echo [INFO] Backend script: %PYTHON_SCRIPT%

REM Check if virtual environment exists
if not exist "%VENV_PATH%" (
    echo [ERROR] Virtual environment not found at: %VENV_PATH%
    echo [INFO] Please run the init script first: python scripts\init.py
    pause
    exit /b 1
)

REM Check if backend script exists
if not exist "%PYTHON_SCRIPT%" (
    echo [ERROR] Backend script not found at: %PYTHON_SCRIPT%
    pause
    exit /b 1
)

REM Activate virtual environment
echo [INFO] Activating virtual environment...
call "%VENV_PATH%\Scripts\activate.bat"

if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)

echo [INFO] Virtual environment activated successfully

REM Show Python info
python --version
echo [INFO] Python executable:
where python

REM Change to backend directory
cd /d "%BACKEND_PATH%"
echo [INFO] Changed to backend directory: %CD%

REM Run the backend server
echo [INFO] Starting TradingBot backend server...
echo [INFO] Server will be available at: http://localhost:8000
echo [INFO] API documentation will be available at: http://localhost:8000/docs
echo [INFO] Press Ctrl+C to stop the server

REM Execute the Python script
python run.py

pause