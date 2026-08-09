export type PaymentMethod = 'upi' | 'cash';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'SGD' | 'AED';

export interface Transaction {
  id: string;
  date: string;
  time?: string;
  amount: number;
  category: string;
  merchant: string;
  account: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  flagged?: boolean;
  currency?: CurrencyCode;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  period: 'monthly' | 'weekly';
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  linkedAccount?: string;
}

export interface AgentInsight {
  id: string;
  type: 'alert' | 'suggestion' | 'summary';
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  relatedEntity?: string;
}

export interface AgentAction {
  id: string;
  description: string;
  timestamp: string;
  status: 'proposed' | 'executed' | 'undone';
}

export interface Asset {
  id: string;
  name: string;
  type: 'stock' | 'bond' | 'cash' | 'crypto';
  value: number;
  returnPct: number;
  history: number[];
}

export type AlertType =
  | 'overspend'
  | 'bill_due'
  | 'unusual_transaction'
  | 'goal_milestone'
  | 'weekly_digest';

export interface AppNotification {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  text: string;
  createdAt: string;
  streaming?: boolean;
}

export type SyncStatus = 'synced' | 'syncing' | 'error';

export type UpiProvider = 'googlepay' | 'phonepe' | 'paytm' | 'amazonpay' | 'other';

export interface UpiAccount {
  id: string;
  upiId: string;
  provider: UpiProvider;
  accountHolder: string;
  bankName: string;
  isPrimary: boolean;
  linkedAt: string;
  lastSyncedAt: string;
}

export interface ConnectedAccount {
  id: string;
  institution: string;
  nickname: string;
  mask: string;
  balance: number;
  syncStatus: SyncStatus;
}

export type AgentAutonomyLevel = 1 | 2 | 3 | 4 | 5;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
}

export interface AgentPreferences {
  autonomyLevel: AgentAutonomyLevel;
  notifyOverspend: boolean;
  notifyBillDue: boolean;
  notifyUnusualTransaction: boolean;
  notifyGoalMilestone: boolean;
  notifyWeeklyDigest: boolean;
}

export type AgentStatus = 'idle' | 'monitoring' | 'analyzing' | 'alert';

// ─── SMS Tracking Flow ─────────────────────────────────────────

export type SmsTrackingCategory =
  | 'Food'
  | 'Shopping'
  | 'Travel'
  | 'Bills'
  | 'Entertainment'
  | 'Healthcare'
  | 'Others';

export interface ParsedSmsTransaction {
  id: string;
  amount: number;
  merchant: string;
  category: SmsTrackingCategory;
  date: string;
  type: 'debit' | 'credit';
  bankName: string;
}

export interface SmsScanProgress {
  step: 'scanning' | 'categorizing' | 'preparing';
  progress: number;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  remainingBalance: number;
  categorySpending: Record<SmsTrackingCategory, number>;
  budgetScore: number;
  savingsSuggestions: string[];
  recentTransactions: ParsedSmsTransaction[];
}

export interface SmsPermissionStatus {
  granted: boolean;
  canRequest: boolean;
}
