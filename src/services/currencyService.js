/**
 * Currency Service
 * Supports multi-currency display, live conversion, and formatting.
 */

// Base rates anchored relative to JPY
export const EXCHANGE_RATES_FROM_JPY = {
  JPY: 1,
  USD: 0.0067,   // ~150 JPY = 1 USD
  EUR: 0.0062,   // ~162 JPY = 1 EUR
  GBP: 0.0053,   // ~188 JPY = 1 GBP
  AUD: 0.0102,   // ~98 JPY = 1 AUD
  CAD: 0.0091,   // ~110 JPY = 1 CAD
  SGD: 0.0090,   // ~111 JPY = 1 SGD
  CHF: 0.0059,   // ~170 JPY = 1 CHF
};

export const CURRENCY_SYMBOLS = {
  JPY: '¥',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  SGD: 'S$',
  CHF: 'CHF ',
};

export const SUPPORTED_CURRENCIES = [
  { code: 'JPY', name: 'Japanese Yen (¥)', symbol: '¥' },
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
  { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar (C$)', symbol: 'C$' },
  { code: 'SGD', name: 'Singapore Dollar (S$)', symbol: 'S$' },
];

/**
 * Converts an amount from one currency to another.
 */
export function convertCurrency(amount, from = 'JPY', to = 'JPY') {
  if (!amount || isNaN(amount)) return 0;
  if (from === to) return amount;

  // Convert to JPY base first
  const rateFrom = EXCHANGE_RATES_FROM_JPY[from] || 1;
  const inJPY = from === 'JPY' ? amount : amount / rateFrom;

  // Convert from JPY to target
  const rateTo = EXCHANGE_RATES_FROM_JPY[to] || 1;
  return to === 'JPY' ? Math.round(inJPY) : inJPY * rateTo;
}

/**
 * Formats an amount in the specified currency with symbol and decimal rounding.
 */
export function formatCurrency(amount, currency = 'JPY') {
  if (amount === undefined || amount === null || isNaN(amount)) return '—';
  const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
  
  if (currency === 'JPY') {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
