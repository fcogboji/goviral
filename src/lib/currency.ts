// Currency formatting utilities

/**
 * Format amount in USD currency
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format amount with decimal places
 */
export function formatCurrency(amount: number, currency: string = 'USD', decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

/**
 * Convert dollars to cents (for Stripe)
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}
