/**
 * Formats a number as currency (USD)
 * @param value Number to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted currency string
 */
export const formatCurrency = (value: number, decimals = 2): string => {
  return `$${value.toFixed(decimals)}`;
};

/**
 * Formats a number with thousands separators
 * @param value Number to format
 * @returns Formatted number string
 */
export const formatVolume = (value: number): string => {
  return value.toLocaleString();
};