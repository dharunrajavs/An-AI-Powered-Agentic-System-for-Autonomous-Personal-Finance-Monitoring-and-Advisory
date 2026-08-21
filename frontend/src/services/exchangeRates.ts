import { CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatCurrency';

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
  options?: { showSign?: boolean },
): string {
  const inrAmount = currency && currency !== 'INR' ? convertToInr(amount, currency) : amount;
  return formatCurrency(inrAmount, options);
}
