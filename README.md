# TradingBot

## Overview

TradingBot is a cryptocurrency trading bot designed to interact with the Luno exchange. It provides a frontend for analytics and model training, as well as a backend for executing trades based on trained models. The application is built using modern technologies like Next.js, Tailwind CSS, FastAPI, and WebSockets.

### Features

- **Analytics Dashboard:** Visualize crypto price data and label data points for model training.
- **Model Execution:** Run trained models from the backend library to make predictions.
- **Production Mode:** Execute buy/sell actions on Luno in real-time using live data.
- **Dark Theme:** Aesthetic and user-friendly dark-themed UI.

---

## Technologies Used

### Frontend
- **Framework:** Next.js (v14.2.7b)
- **Styling:** Tailwind CSS, shadcn/ui
- **Communication:** WebSockets
- **Package Manager:** Bun/Bunx

### Backend
- **Framework:** FastAPI
- **Communication:** WebSockets
- **Luno Integration:** luno-python library

---

## Setup Instructions

### Prerequisites
1. **Node.js** (v18 or higher) and **Bun** installed for the frontend.
2. **Python** (v3.9 or higher) installed for the backend.
3. **Luno API Key** for interacting with the Luno exchange.
4. **Environment Variables:** Create `.env.local` files for both frontend and backend with the necessary configurations.

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ./frontend/tradingbot
   ```
2. Install dependencies using Bun:
   ```bash
   bun install
   ```
3. Start the development server:
   ```bash
   bun dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd ./backend/app
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the API server:
   ```bash
   python /home/andrew/projects/TradingBot/start_server.py
   ```

---

## Usage

### Frontend
1. Access the frontend at `http://localhost:3000`.
2. Use the analytics section to visualize and label data points for model training.
3. Run models from the backend library to make predictions.

### Backend
1. The API server runs at `http://localhost:8000`.
2. Use the WebSocket connection to stream live data and execute trades.
3. Ensure the Luno API key is configured for live trading.

---

## Project Structure

```
/frontend/tradingbot   # Frontend application (Next.js, Tailwind CSS)
/backend/app           # Backend application (FastAPI, Python)
/start_server.py       # Script to start the backend server
```

---

## Contributing

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add feature description"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Open a pull request.

---

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.