import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function fetchCryptoData(symbol: string, interval: string) {
  // This would be replaced with your actual API call to FastAPI backend
  try {
    const response = await fetch(`/api/crypto-data?symbol=${symbol}&interval=${interval}`);
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    throw error;
  }
}
