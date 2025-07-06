#!/bin/bash

# TradingBot Backend Runner Script for Linux/macOS
# This script activates the virtual environment and runs the backend server

set -e  # Exit on any error

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Define paths
VENV_PATH="$PROJECT_ROOT/.venv"
BACKEND_PATH="$PROJECT_ROOT/backend"
PYTHON_SCRIPT="$BACKEND_PATH/run.py"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if virtual environment exists
if [ ! -d "$VENV_PATH" ]; then
    print_error "Virtual environment not found at: $VENV_PATH"
    print_info "Please run the init script first: python3 scripts/init.py"
    exit 1
fi

# Check if backend script exists
if [ ! -f "$PYTHON_SCRIPT" ]; then
    print_error "Backend script not found at: $PYTHON_SCRIPT"
    exit 1
fi

print_info "TradingBot Backend Server Launcher"
print_info "Project root: $PROJECT_ROOT"
print_info "Virtual environment: $VENV_PATH"
print_info "Backend script: $PYTHON_SCRIPT"

# Activate virtual environment
print_info "Activating virtual environment..."
source "$VENV_PATH/bin/activate"

# Verify activation
if [ "$VIRTUAL_ENV" != "$VENV_PATH" ]; then
    print_error "Failed to activate virtual environment"
    exit 1
fi

print_info "Virtual environment activated successfully"
print_info "Python executable: $(which python)"
print_info "Python version: $(python --version)"

# Change to backend directory
cd "$BACKEND_PATH"
print_info "Changed to backend directory: $(pwd)"

# Run the backend server
print_info "Starting TradingBot backend server..."
print_info "Server will be available at: http://localhost:8000"
print_info "API documentation will be available at: http://localhost:8000/docs"
print_info "Press Ctrl+C to stop the server"

# Execute the Python script
python run.py