export type PaymentProvider = 'stripe' | 'paystack';
export type CurrencyCode = 'USD' | 'NGN' | 'GBP';

// Countries where Paystack is the preferred provider
const PAYSTACK_COUNTRIES = new Set(['NG', 'GH', 'ZA', 'KE']);

export function getPaymentProvider(countryCode: string | null | undefined): PaymentProvider {
  if (!countryCode) return 'stripe';
  return PAYSTACK_COUNTRIES.has(countryCode.toUpperCase()) ? 'paystack' : 'stripe';
}

// ── Currency detection ──────────────────────────────────────────────────

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  /** Key suffix used to look up price fields in PLAN_FEATURES (e.g. 'NGN' → priceNGN) */
  priceSuffix: string;
}

const CURRENCY_MAP: Record<string, CurrencyConfig> = {
  NG: { code: 'NGN', symbol: '₦', locale: 'en-NG', priceSuffix: 'NGN' },
  GH: { code: 'NGN', symbol: '₦', locale: 'en-NG', priceSuffix: 'NGN' },
  ZA: { code: 'NGN', symbol: '₦', locale: 'en-NG', priceSuffix: 'NGN' },
  KE: { code: 'NGN', symbol: '₦', locale: 'en-NG', priceSuffix: 'NGN' },
  GB: { code: 'GBP', symbol: '£', locale: 'en-GB', priceSuffix: 'GBP' },
};

const DEFAULT_CURRENCY: CurrencyConfig = {
  code: 'USD',
  symbol: '$',
  locale: 'en-US',
  priceSuffix: 'USD',
};

export function getCurrencyForCountry(countryCode: string | null | undefined): CurrencyConfig {
  if (!countryCode) return DEFAULT_CURRENCY;
  return CURRENCY_MAP[countryCode.toUpperCase()] || DEFAULT_CURRENCY;
}

/**
 * Format a price with the correct currency symbol.
 * Keeps it clean — no decimals for NGN, two decimals for others if needed.
 */
export function formatPrice(amount: number, currency: CurrencyConfig): string {
  if (currency.code === 'NGN') {
    return `${currency.symbol}${amount.toLocaleString('en-NG')}`;
  }
  const formatted = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
  return `${currency.symbol}${formatted}`;
}

// ── Country detection ───────────────────────────────────────────────────

/**
 * Detect country from server-side request headers.
 * Works on Vercel (x-vercel-ip-country) and Cloudflare (cf-ipcountry).
 */
export function getCountryFromHeaders(headers: Headers): string | null {
  return (
    headers.get('x-vercel-ip-country') ||
    headers.get('cf-ipcountry') ||
    null
  );
}

/**
 * Map IANA timezones to ISO 3166-1 alpha-2 country codes.
 * Used as a client-side fallback when server headers aren't available (e.g. localhost).
 */
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'Africa/Lagos': 'NG',
  'Africa/Abuja': 'NG',
  'Africa/Accra': 'GH',
  'Africa/Johannesburg': 'ZA',
  'Africa/Nairobi': 'KE',
  'Europe/London': 'GB',
};

export function getCountryFromTimezone(timezone: string): string | null {
  return TIMEZONE_TO_COUNTRY[timezone] || null;
}

// ── Provider availability ───────────────────────────────────────────────

export function isStripeConfigured(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export function isPaystackConfigured(): boolean {
  return !!process.env.PAYSTACK_SECRET_KEY;
}
