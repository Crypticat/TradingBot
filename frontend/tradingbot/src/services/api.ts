/**
 * API service for interacting with the FastAPI backend
 */

export interface CryptoPrice {
  time: string;
  price: number;
  volume?: number;
}

export interface Model {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  lastRun: string;
  status: "active" | "inactive";
}

export interface TradeSignal {
  type: "buy" | "sell";
  price: number;
  confidence: number;
  timestamp: string;
}

export interface Trade {
  id: number;
  type: "buy" | "sell";
  price: number;
  amount: number;
  time: string;
  status: "pending" | "completed" | "failed";
}

// Base API URL should be configured based on environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch historical crypto price data
 * @deprecated Use fetchCandleData and fetchTradeData instead
 */
export async function fetchHistoricalPrices(
  symbol: string,
  interval: string,
  from?: string,
  to?: string
): Promise<CryptoPrice[]> {
  console.warn('fetchHistoricalPrices is deprecated. Use fetchCandleData instead.');
  return fetchCandleData(symbol, interval, from, to);
}

/**
 * Fetch live crypto price data
 */
export async function fetchLivePrice(symbol: string): Promise<CryptoPrice> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/prices/live?symbol=${symbol}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching live price:', error);
    throw error;
  }
}

/**
 * Create a new model with labeled data points
 */
export async function createModel(
  name: string,
  description: string,
  symbol: string,
  labeledPoints: Array<{x: string, y: number, label: string}>
): Promise<Model> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/models`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        symbol,
        labeledPoints,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating model:', error);
    throw error;
  }
}

/**
 * Get all available models
 */
export async function getModels(): Promise<Model[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/models`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching models:', error);
    throw error;
  }
}

/**
 * Run a model to get predictions
 */
export async function runModel(
  modelId: string,
  symbol: string,
  live: boolean = false
): Promise<TradeSignal[]> {
  try {
    const params = new URLSearchParams({
      modelId,
      symbol,
      live: String(live),
    });

    const response = await fetch(`${API_BASE_URL}/api/models/run?${params}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error running model:', error);
    throw error;
  }
}

/**
 * Start automated trading with a specific model
 */
export async function startTrading(modelId: string, symbol: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/trading/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        modelId,
        symbol,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error starting trading:', error);
    throw error;
  }
}

/**
 * Stop automated trading
 */
export async function stopTrading(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/trading/stop`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error stopping trading:', error);
    throw error;
  }
}

/**
 * Get trading history
 */
export async function getTradingHistory(): Promise<Trade[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/trading/history`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching trading history:', error);
    throw error;
  }
}

/**
 * Get account balance
 */
export async function getAccountBalance(): Promise<{ fiat: number; crypto: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/account/balance`);

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching account balance:', error);
    throw error;
  }
}

/**
 * Fetch candle (OHLC) data for a cryptocurrency pair
 */
export async function fetchCandleData(
  symbol: string,
  interval: string,
  from?: string,
  to?: string
): Promise<CryptoPrice[]> {
  try {
    const params = new URLSearchParams({
      symbol,
      interval,
      ...(from && { from }),
      ...(to && { to }),
    });
    const response = await fetch(`${API_BASE_URL}/api/prices/candles?${params}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching candle data:', error);
    throw error;
  }
}

/**
 * Fetch recent trades for a cryptocurrency pair
 */
export interface TradeResponse {
  trades: {
    timestamp: string;
    price: string;
    volume: string;
    is_buy: boolean;
  }[];
}

/**
 * Fetch recent trades for a cryptocurrency pair
 * @param symbol The trading pair symbol (e.g., XBTZAR)
 * @param params Optional parameters (since timestamp as ISO string or Date object)
 * @returns Trade data response
 */
export async function fetchTradeData(
  symbol: string,
  params: { since?: string | Date } = {}
): Promise<TradeResponse> {
  try {
    const queryParams = new URLSearchParams({
      symbol,
    });

    // Add since parameter if provided (ensure it's a string)
    if (params.since) {
      // If it's a Date object, convert to ISO string
      if (params.since instanceof Date) {
        queryParams.append('since', params.since.toISOString());
      } else {
        // Assume it's already an ISO string
        queryParams.append('since', params.since);
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/prices/trades?${queryParams}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching trade data:', error);
    throw error;
  }
}
