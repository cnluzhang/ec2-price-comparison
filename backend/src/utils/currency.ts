import { config } from '../config/environment';

/**
 * Currency conversion utilities
 */

/**
 * Convert CNY to USD
 * @param cnyAmount Amount in CNY
 * @returns Equivalent amount in USD
 */
export const cnyToUsd = (cnyAmount: number): number => {
  return cnyAmount / config.currency.cnyToUsdRate;
};

/**
 * Convert USD to CNY
 * @param usdAmount Amount in USD
 * @returns Equivalent amount in CNY
 */
export const usdToCny = (usdAmount: number): number => {
  return usdAmount * config.currency.cnyToUsdRate;
};

/**
 * Format currency value for display
 * @param amount Amount to format
 * @param currency Currency code (USD, CNY)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  if (currency === 'USD') {
    return `$${amount.toFixed(4)}`;
  } else if (currency === 'CNY') {
    return `¥${amount.toFixed(4)}`;
  }
  return `${amount.toFixed(4)} ${currency}`;
};