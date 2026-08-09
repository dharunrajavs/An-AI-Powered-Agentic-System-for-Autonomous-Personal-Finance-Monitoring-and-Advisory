import { CurrencyCode } from '../types';

export type ExchangeRates = Record<CurrencyCode, number>;

const RATES: ExchangeRates = {
  INR: 1,
  USD: 83.5,
  EUR: 91.2,
  GBP: 106.8,
  SGD: 62.4,
  AED: 22.75,
};

export const CURRENCIES: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', label: 'US Dollar', symbol: '$' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'British Pound', symbol: '£' },
  { code: 'SGD', label: 'Singapore Dollar', symbol: 'S$' },
  { code: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
];

export function convertToInr(amount: number, from: CurrencyCode): number {
  return amount * RATES[from];
}

export function formatMultiCurrency(
  amount: number,
  currency?: CurrencyCode,
  options?: { showSign?: boolean; showOriginal?: boolean },
): string {
  const { showSign = false, showOriginal = true } = options ?? {};

  const inrAmount = currency && currency !== 'INR' ? convertToInr(Math.abs(amount), currency) : Math.abs(amount);
  const sign = showSign ? (amount >= 0 ? '+' : '-') : amount < 0 ? '-' : '';
  const symbol = currency ? CURRENCIES.find((c) => c.code === currency)?.symbol ?? '₹' : '₹';
  const inrFormatted = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(inrAmount);

  if (currency && currency !== 'INR' && showOriginal) {
    const origFormatted = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Math.abs(amount));
    return `${sign}${inrFormatted} (${origFormatted})`;
  }

  if (currency && currency !== 'INR') {
    return `${sign}${inrFormatted}`;
  }

  return `${sign}${symbol}${new Intl.NumberFormat('en-IN').format(Math.abs(amount))}`;
}
