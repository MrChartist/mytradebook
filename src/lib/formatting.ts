/**
 * Formatting Utilities
 *
 * Helper functions for consistent formatting across the application.
 */

/**
 * Format currency value (Indian Rupees)
 *
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string with ₹ symbol
 *
 * @example
 * formatCurrency(1234.56) // "₹1,234.56"
 * formatCurrency(1234567) // "₹12,34,567.00"
 * formatCurrency(-500) // "-₹500.00"
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  // Format with Indian numbering system (lakhs, crores)
  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const formatted = formatter.format(absValue);
  return isNegative ? `-₹${formatted}` : `₹${formatted}`;
}

/**
 * Format percentage value
 *
 * @param value - The numeric value to format as percentage
 * @param decimals - Number of decimal places (default: 2)
 * @param showSign - Whether to show + sign for positive values (default: true)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercent(12.3456) // "+12.35%"
 * formatPercent(-5.67) // "-5.67%"
 * formatPercent(0.5, 1) // "+0.5%"
 */
export function formatPercent(
  value: number,
  decimals: number = 2,
  showSign: boolean = true
): string {
  const sign = value > 0 && showSign ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format quantity with K/L/Cr suffixes
 *
 * @param value - The numeric value to format
 * @returns Formatted string with appropriate suffix
 *
 * @example
 * formatQuantity(500) // "500"
 * formatQuantity(1500) // "1.5K"
 * formatQuantity(150000) // "1.5L"
 * formatQuantity(15000000) // "1.5Cr"
 */
export function formatQuantity(value: number): string {
  if (value >= 10000000) {
    return `${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toString();
}

/**
 * Format date to readable string
 *
 * @param date - Date string or Date object
 * @param includeTime - Whether to include time (default: false)
 * @returns Formatted date string
 *
 * @example
 * formatDate('2024-02-16') // "16 Feb 2024"
 * formatDate('2024-02-16T10:30:00Z', true) // "16 Feb 2024, 10:30 AM"
 */
export function formatDate(date: string | Date, includeTime: boolean = false): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.hour12 = true;
  }

  return new Intl.DateTimeFormat('en-IN', options).format(d);
}

/**
 * Format time duration in human-readable format
 *
 * @param milliseconds - Duration in milliseconds
 * @returns Human-readable duration string
 *
 * @example
 * formatDuration(5000) // "5 seconds"
 * formatDuration(300000) // "5 minutes"
 * formatDuration(7200000) // "2 hours"
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else {
    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }
}

/**
 * Format trade symbol for display
 * Handles futures and options symbols
 *
 * @param symbol - Raw symbol from database
 * @returns Formatted symbol for display
 *
 * @example
 * formatSymbol('RELIANCE') // "RELIANCE"
 * formatSymbol('NIFTY24FEB24000CE') // "NIFTY 24000 CE (Feb 24)"
 */
export function formatSymbol(symbol: string): string {
  // For options/futures with expiry and strike
  const optionMatch = symbol.match(/^([A-Z]+)(\d{2})([A-Z]{3})(\d+)(CE|PE)$/);
  if (optionMatch) {
    const [, underlying, day, month, strike, type] = optionMatch;
    const monthNames: Record<string, string> = {
      JAN: 'Jan', FEB: 'Feb', MAR: 'Mar', APR: 'Apr',
      MAY: 'May', JUN: 'Jun', JUL: 'Jul', AUG: 'Aug',
      SEP: 'Sep', OCT: 'Oct', NOV: 'Nov', DEC: 'Dec'
    };
    return `${underlying} ${strike} ${type} (${monthNames[month]} ${day})`;
  }

  return symbol;
}

/**
 * Truncate text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 *
 * @example
 * truncateText('Very long text here', 10) // "Very long..."
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Get color class for P&L value
 *
 * @param value - P&L value
 * @returns Tailwind color class
 *
 * @example
 * getPnLColor(100) // "text-green-600"
 * getPnLColor(-50) // "text-red-600"
 * getPnLColor(0) // "text-gray-600"
 */
export function getPnLColor(value: number): string {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
}

/**
 * Get background color class for P&L value
 *
 * @param value - P&L value
 * @returns Tailwind background color class
 */
export function getPnLBgColor(value: number): string {
  if (value > 0) return 'bg-green-50';
  if (value < 0) return 'bg-red-50';
  return 'bg-gray-50';
}
