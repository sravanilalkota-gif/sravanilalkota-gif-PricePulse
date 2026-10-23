/**
 * PricePulse Currency Utilities
 * Formats and converts USD prices to Indian Rupees (INR - ₹)
 */

export const DEFAULT_USD_TO_INR_RATE = 83.50;

let cachedRate = DEFAULT_USD_TO_INR_RATE;

// Fetch the latest conversion rate from the backend
export async function fetchExchangeRate(): Promise<number> {
  try {
    const response = await fetch('/api/currency/rate');
    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.rate === 'number') {
        cachedRate = data.rate;
        return data.rate;
      }
    }
  } catch (err) {
    console.warn("Failed to fetch exchange rate, using cached value:", err);
  }
  return cachedRate;
}

/**
 * Returns the current cached exchange rate
 */
export function getExchangeRate(): number {
  return cachedRate;
}

/**
 * Converts a USD value to INR using the given rate
 */
export function convertUSDToINR(usdAmount: number, rate: number = cachedRate): number {
  return Math.round(usdAmount * rate * 100) / 100;
}

/**
 * Formats a USD amount directly into an Indian Rupee string (₹)
 */
export function formatINR(usdAmount: number, rate: number = cachedRate): string {
  const inrAmount = usdAmount * rate;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(inrAmount);
}

/**
 * Formats an already converted INR amount into a Rupee string (₹)
 */
export function formatDirectINR(inrAmount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(inrAmount);
}
