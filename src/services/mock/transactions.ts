import { Transaction } from '../../types';
import { delay } from './delay';

export const CATEGORIES = [
  'Food & Drink',
  'Groceries',
  'Transport',
  'Subscriptions',
  'Rent',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Health',
  'Travel',
  'Fitness',
  'Personal Care',
  'Income',
];

export const CASH_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Others',
];

export const ACCOUNTS = ['Chase Checking', 'Chase Sapphire Credit Card', 'Ally Savings'];

const transactions: Transaction[] = [
  { id: 'txn_001', date: '2026-07-06', amount: -6.75, category: 'Food & Drink', merchant: 'Starbucks', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_002', date: '2026-07-06', amount: -84.32, category: 'Groceries', merchant: 'Whole Foods Market', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_003', date: '2026-07-05', amount: -18.4, category: 'Transport', merchant: 'Uber', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_004', date: '2026-07-05', amount: -340.0, category: 'Shopping', merchant: 'Amazon', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi', flagged: true, notes: 'Larger than usual — review if this was you.' },
  { id: 'txn_005', date: '2026-07-04', amount: -15.99, category: 'Subscriptions', merchant: 'Netflix', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_006', date: '2026-07-04', amount: -52.1, category: 'Food & Drink', merchant: 'Chipotle Mexican Grill', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_007', date: '2026-07-03', amount: -9.99, category: 'Subscriptions', merchant: 'Spotify', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_008', date: '2026-07-03', amount: -64.21, category: 'Transport', merchant: 'Shell', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_009', date: '2026-07-02', amount: -128.5, category: 'Shopping', merchant: 'Target', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_010', date: '2026-07-02', amount: -22.0, category: 'Entertainment', merchant: 'AMC Theatres', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_011', date: '2026-07-01', amount: -2400.0, category: 'Rent', merchant: 'Parkview Rentals LLC', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_012', date: '2026-07-01', amount: 4200.0, category: 'Income', merchant: 'Acme Corp Payroll', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_013', date: '2026-06-30', amount: -76.43, category: 'Groceries', merchant: "Trader Joe's", account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_014', date: '2026-06-29', amount: -45.0, category: 'Fitness', merchant: 'Planet Fitness', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_015', date: '2026-06-28', amount: -112.87, category: 'Personal Care', merchant: 'Sephora', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_016', date: '2026-06-27', amount: -38.6, category: 'Food & Drink', merchant: 'Chipotle Mexican Grill', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_017', date: '2026-06-26', amount: -410.22, category: 'Travel', merchant: 'Delta Air Lines', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_018', date: '2026-06-25', amount: -18.99, category: 'Health', merchant: 'CVS Pharmacy', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_019', date: '2026-06-24', amount: -145.0, category: 'Utilities', merchant: 'Con Edison', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_020', date: '2026-06-23', amount: -85.0, category: 'Utilities', merchant: 'Verizon Wireless', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_021', date: '2026-06-22', amount: -63.14, category: 'Groceries', merchant: 'Whole Foods Market', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_022', date: '2026-06-21', amount: -29.5, category: 'Food & Drink', merchant: 'Starbucks', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi', flagged: true, notes: 'Four Starbucks charges this week — 2x your usual pace.' },
  { id: 'txn_023', date: '2026-06-20', amount: -220.0, category: 'Shopping', merchant: 'Amazon', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_024', date: '2026-06-19', amount: -14.4, category: 'Transport', merchant: 'Uber', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_025', date: '2026-06-18', amount: -98.0, category: 'Entertainment', merchant: 'Airbnb', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_026', date: '2026-06-17', amount: -12.99, category: 'Subscriptions', merchant: 'Apple', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_027', date: '2026-06-16', amount: -210.34, category: 'Groceries', merchant: 'Costco Wholesale', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_028', date: '2026-06-15', amount: -55.0, category: 'Food & Drink', merchant: 'Chipotle Mexican Grill', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_029', date: '2026-06-14', amount: -6.75, category: 'Food & Drink', merchant: 'Starbucks', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_030', date: '2026-06-01', amount: -2400.0, category: 'Rent', merchant: 'Parkview Rentals LLC', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_031', date: '2026-06-01', amount: 4200.0, category: 'Income', merchant: 'Acme Corp Payroll', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_032', date: '2026-07-06', time: '13:20', amount: -180.0, category: 'Food', merchant: 'Street food', account: 'Cash', paymentMethod: 'cash', notes: 'Lunch with colleagues' },
  { id: 'txn_033', date: '2026-07-04', time: '09:05', amount: -60.0, category: 'Transport', merchant: 'Auto rickshaw', account: 'Cash', paymentMethod: 'cash' },
  { id: 'txn_034', date: '2026-06-29', time: '18:45', amount: -450.0, category: 'Shopping', merchant: 'Local market', account: 'Cash', paymentMethod: 'cash' },
  { id: 'txn_035', date: '2026-06-24', time: '11:00', amount: -220.0, category: 'Healthcare', merchant: 'Pharmacy', account: 'Cash', paymentMethod: 'cash' },
];

export function getTransactions(): Promise<Transaction[]> {
  return delay([...transactions].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)));
}

export function getTransactionById(id: string): Promise<Transaction | undefined> {
  return delay(transactions.find((t) => t.id === id));
}

export function deleteTransaction(id: string): Promise<{ success: true }> {
  const idx = transactions.findIndex((t) => t.id === id);
  if (idx >= 0) transactions.splice(idx, 1);
  return delay({ success: true }, 250);
}

export function updateTransaction(id: string, patch: Partial<Transaction>): Promise<Transaction | undefined> {
  const idx = transactions.findIndex((t) => t.id === id);
  if (idx >= 0) transactions[idx] = { ...transactions[idx], ...patch };
  return delay(transactions[idx], 250);
}

export function addTransaction(input: Omit<Transaction, 'id'>): Promise<Transaction> {
  const created: Transaction = { ...input, id: `txn_${Date.now()}` };
  transactions.unshift(created);
  return delay(created, 250);
}
