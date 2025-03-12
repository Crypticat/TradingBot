#!/usr/bin/env bash

echo "Starting TradingBot UI..."

# Navigate to the frontend directory
cd ./frontend/tradingbot || { echo "Frontend directory not found!"; exit 1; }

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies with bun..."
  bun install
fi

# Start the development server
echo "Starting Next.js development server..."
bun run dev