import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction } from '../../types';
import { USE_MOCK } from '../config';
import { adjustMockAccountBalance } from './accounts';
import { parseFlexibleDate } from '../../utils/formatDate';
import {
  addTransaction as apiAddTransaction,
  deleteTransaction as apiDeleteTransaction,
  getTransactionById as apiGetTransactionById,
  getTransactions as apiGetTransactions,
  saveDetectedSmsTransactions as apiSaveDetectedSmsTransactions,
  updateTransaction as apiUpdateTransaction,
} from '../api';
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

const STORAGE_KEY = 'finance-advisor-transactions';

const SEED_TRANSACTIONS: Transaction[] = [
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
  { id: 'txn_036', date: '2026-08-18', amount: -32.5, category: 'Food & Drink', merchant: 'Starbucks', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_037', date: '2026-08-16', amount: -118.99, category: 'Shopping', merchant: 'Amazon', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_038', date: '2026-08-14', amount: -19.4, category: 'Transport', merchant: 'Uber', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
  { id: 'txn_039', date: '2026-08-12', amount: -14.99, category: 'Entertainment', merchant: 'Netflix', account: 'Chase Checking', paymentMethod: 'upi' },
  { id: 'txn_040', date: '2026-08-10', amount: -58.75, category: 'Food & Drink', merchant: 'Chipotle Mexican Grill', account: 'Chase Sapphire Credit Card', paymentMethod: 'upi' },
];

async function readAll(): Promise<Transaction[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Transaction[];
    } catch {
      // Corrupt payload — fall through and re-seed.
    }
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TRANSACTIONS));
  return [...SEED_TRANSACTIONS];
}

async function writeAll(list: Transaction[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export async function getTransactions(): Promise<Transaction[]> {
  if (!USE_MOCK) return apiGetTransactions();
  const list = await readAll();
  return delay(
    [...list].sort((a, b) => (parseFlexibleDate(b.date).getTime() || 0) - (parseFlexibleDate(a.date).getTime() || 0))
  );
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  if (!USE_MOCK) return apiGetTransactionById(id);
  const list = await readAll();
  return delay(list.find((t) => t.id === id));
}

export async function deleteTransaction(id: string): Promise<{ success: true }> {
  if (!USE_MOCK) return apiDeleteTransaction(id);
  const list = await readAll();
  const idx = list.findIndex((t) => t.id === id);
  if (idx >= 0) {
    const [removed] = list.splice(idx, 1);
    await writeAll(list);
    adjustMockAccountBalance(removed.account, -(removed.amount || 0));
  }
  return delay({ success: true }, 250);
}

export async function updateTransaction(id: string, patch: Partial<Transaction>): Promise<Transaction | undefined> {
  if (!USE_MOCK) return apiUpdateTransaction(id, patch);
  const list = await readAll();
  const idx = list.findIndex((t) => t.id === id);
  if (idx >= 0) {
    const prev = list[idx];
    if (patch.amount !== undefined && patch.amount !== prev.amount) {
      adjustMockAccountBalance(prev.account, patch.amount - prev.amount);
    } else if (patch.account !== undefined && patch.account !== prev.account) {
      adjustMockAccountBalance(prev.account, -(prev.amount || 0));
      adjustMockAccountBalance(patch.account, prev.amount || 0);
    }
    list[idx] = { ...prev, ...patch };
    await writeAll(list);
  }
  return delay(list[idx], 250);
}

export async function addTransaction(input: Omit<Transaction, 'id'>): Promise<Transaction> {
  if (!USE_MOCK) return apiAddTransaction(input);
  const list = await readAll();
  const created: Transaction = { ...input, id: `txn_${Date.now()}` };
  list.unshift(created);
  await writeAll(list);
  adjustMockAccountBalance(created.account, created.amount || 0);
  return delay(created, 250);
}

export async function saveDetectedSmsTransactions(
  parsed: import('../../types').ParsedSmsTransaction[],
): Promise<{ created: number; skipped: number }> {
  if (!USE_MOCK) return apiSaveDetectedSmsTransactions(parsed);
  const list = await readAll();
  let created = 0;
  let skipped = 0;
  for (const item of parsed) {
    if (!item || item.amount <= 0 || !item.messageHash) {
      skipped += 1;
      continue;
    }
    const duplicate = list.some((t) => t.messageHash === item.messageHash);
    if (duplicate) {
      skipped += 1;
      continue;
    }
    const signedAmount = item.type === 'credit' ? Math.abs(item.amount) : -Math.abs(item.amount);
    list.unshift({
      id: `txn_${Date.now()}_${created}`,
      date: item.date,
      time: item.time,
      amount: signedAmount,
      category: item.category,
      merchant: item.merchant,
      account: item.bankName !== 'Unknown Bank' ? item.bankName : 'SMS',
      paymentMethod: item.paymentMethod ?? 'unknown',
      source: 'sms',
      referenceId: item.referenceId,
      bankName: item.bankName,
      accountLast4: item.accountLast4,
      messageHash: item.messageHash,
    });
    created += 1;
  }
  await writeAll(list);
  return delay({ created, skipped }, 250);
}
