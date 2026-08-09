import { Transaction, UpiAccount, UpiProvider } from '../../types';
import { delay } from './delay';

let upiAccounts: UpiAccount[] = [
  {
    id: 'upi_001',
    upiId: 'alex@okhdfcbank',
    provider: 'googlepay',
    accountHolder: 'Alex Morgan',
    bankName: 'HDFC Bank',
    isPrimary: true,
    linkedAt: '2026-01-15T10:30:00Z',
    lastSyncedAt: new Date().toISOString(),
  },
  {
    id: 'upi_002',
    upiId: 'alex.m@paytm',
    provider: 'paytm',
    accountHolder: 'Alex Morgan',
    bankName: 'ICICI Bank',
    isPrimary: false,
    linkedAt: '2026-03-01T08:00:00Z',
    lastSyncedAt: new Date().toISOString(),
  },
];

const PROVIDERS: { id: UpiProvider; name: string }[] = [
  { id: 'googlepay', name: 'Google Pay' },
  { id: 'phonepe', name: 'PhonePe' },
  { id: 'paytm', name: 'Paytm' },
  { id: 'amazonpay', name: 'Amazon Pay' },
  { id: 'other', name: 'Other UPI App' },
];

export function getUpiProviders(): Promise<{ id: UpiProvider; name: string }[]> {
  return delay([...PROVIDERS]);
}

export function getUpiAccounts(): Promise<UpiAccount[]> {
  return delay([...upiAccounts]);
}

export function verifyUpiId(upiId: string): Promise<{ valid: boolean; accountHolder: string; bankName: string }> {
  const valid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId);
  if (!valid) return delay({ valid: false, accountHolder: '', bankName: '' }, 300);
  return delay({
    valid: true,
    accountHolder: 'Alex Morgan',
    bankName: ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'][Math.floor(Math.random() * 4)],
  }, 500);
}

export function linkUpiAccount(upiId: string, provider: UpiProvider): Promise<UpiAccount> {
  const created: UpiAccount = {
    id: `upi_${Date.now()}`,
    upiId,
    provider,
    accountHolder: 'Alex Morgan',
    bankName: ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'][Math.floor(Math.random() * 4)],
    isPrimary: upiAccounts.length === 0,
    linkedAt: new Date().toISOString(),
    lastSyncedAt: new Date().toISOString(),
  };
  upiAccounts = [...upiAccounts, created];
  return delay(created, 800);
}

export function unlinkUpiAccount(id: string): Promise<{ success: true }> {
  upiAccounts = upiAccounts.filter((a) => a.id !== id);
  return delay({ success: true }, 250);
}

export function setPrimaryUpiAccount(id: string): Promise<UpiAccount[]> {
  upiAccounts = upiAccounts.map((a) => ({ ...a, isPrimary: a.id === id }));
  return delay([...upiAccounts], 300);
}

export function syncUpiTransactions(): Promise<{ synced: number }> {
  upiAccounts = upiAccounts.map((a) => ({ ...a, lastSyncedAt: new Date().toISOString() }));
  return delay({ synced: 3 + Math.floor(Math.random() * 5) }, 1200);
}

let upiTransactions: Transaction[] = [
  { id: 'txn_upi_001', date: '2026-07-23', time: '19:45', amount: -450, category: 'Food & Drink', merchant: 'Swiggy', account: 'alex@okhdfcbank', paymentMethod: 'upi', notes: 'Dinner order', flagged: false },
  { id: 'txn_upi_002', date: '2026-07-23', time: '09:30', amount: -85, category: 'Transport', merchant: 'Uber', account: 'alex@okhdfcbank', paymentMethod: 'upi', notes: 'Morning commute', flagged: false },
  { id: 'txn_upi_003', date: '2026-07-22', time: '14:15', amount: 2500, category: 'Income', merchant: 'Freelance Payment', account: 'alex.m@paytm', paymentMethod: 'upi', notes: 'UI design project', flagged: false },
  { id: 'txn_upi_004', date: '2026-07-22', time: '11:00', amount: -1799, category: 'Shopping', merchant: 'Amazon Pay', account: 'alex@okhdfcbank', paymentMethod: 'upi', notes: 'Wireless earbuds', flagged: false },
  { id: 'txn_upi_005', date: '2026-07-21', time: '20:00', amount: -120, category: 'Entertainment', merchant: 'Netflix', account: 'alex.m@paytm', paymentMethod: 'upi', notes: 'Monthly subscription', flagged: false },
];

export function getUpiTransactions(): Promise<Transaction[]> {
  return delay([...upiTransactions]);
}

export { PROVIDERS };
