import { ConnectedAccount } from '../../types';
import { delay } from './delay';

let accounts: ConnectedAccount[] = [
  { id: 'acct_001', institution: 'Chase', nickname: 'Chase Checking', mask: '4821', balance: 3240.55, syncStatus: 'synced' },
  { id: 'acct_002', institution: 'Chase', nickname: 'Chase Sapphire Credit Card', mask: '7710', balance: -1284.32, syncStatus: 'synced' },
  { id: 'acct_003', institution: 'Ally Bank', nickname: 'Ally Savings', mask: '0093', balance: 27300.0, syncStatus: 'synced' },
];

export function getConnectedAccounts(): Promise<ConnectedAccount[]> {
  return delay([...accounts]);
}

export function unlinkAccount(id: string): Promise<{ success: true }> {
  accounts = accounts.filter((a) => a.id !== id);
  return delay({ success: true }, 250);
}

export function linkAccount(input: Omit<ConnectedAccount, 'id' | 'syncStatus'>): Promise<ConnectedAccount> {
  const created: ConnectedAccount = { ...input, id: `acct_${Date.now()}`, syncStatus: 'synced' };
  accounts = [...accounts, created];
  return delay(created, 600);
}
