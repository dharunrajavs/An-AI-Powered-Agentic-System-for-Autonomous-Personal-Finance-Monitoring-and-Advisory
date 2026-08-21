import { ParsedSmsTransaction, MonthlySummary, SmsPermissionStatus, SmsTrackingCategory } from '../../types';
import { delay } from './delay';

const MOCK_SMS_TRANSACTIONS: ParsedSmsTransaction[] = [
  { id: 'sms_001', amount: 1250, merchant: 'Swiggy', category: 'Food', date: '2026-07-23', type: 'debit', bankName: 'HDFC Bank' },
  { id: 'sms_002', amount: 450, merchant: 'Zomato', category: 'Food', date: '2026-07-22', type: 'debit', bankName: 'ICICI Bank' },
  { id: 'sms_003', amount: 3200, merchant: 'Amazon', category: 'Shopping', date: '2026-07-22', type: 'debit', bankName: 'HDFC Bank' },
  { id: 'sms_004', amount: 1800, merchant: 'Myntra', category: 'Shopping', date: '2026-07-21', type: 'debit', bankName: 'HDFC Bank' },
  { id: 'sms_005', amount: 5600, merchant: 'MakeMyTrip', category: 'Travel', date: '2026-07-20', type: 'debit', bankName: 'ICICI Bank' },
  { id: 'sms_006', amount: 2200, merchant: 'Uber', category: 'Travel', date: '2026-07-19', type: 'debit', bankName: 'HDFC Bank' },
  { id: 'sms_007', amount: 899, merchant: 'Electricity Board', category: 'Bills', date: '2026-07-18', type: 'debit', bankName: 'HDFC Bank' },
  { id: 'sms_008', amount: 1499, merchant: 'Jio Fiber', category: 'Bills', date: '2026-07-17', type: 'debit', bankName: 'ICICI Bank' },
  { id: 'sms_009', amount: 1200, merchant: 'Netflix', category: 'Entertainment', date: '2026-07-16', type: 'debit', bankName: 'HDFC Bank' },
  { id: 'sms_010', amount: 750, merchant: 'PVR Cinemas', category: 'Entertainment', date: '2026-07-15', type: 'debit', bankName: 'ICICI Bank' },
  { id: 'sms_011', amount: 2500, merchant: 'Apollo Pharmacy', category: 'Healthcare', date: '2026-07-14', type: 'debit', bankName: 'HDFC Bank' },
  { id: 'sms_012', amount: 850, merchant: 'MedPlus', category: 'Healthcare', date: '2026-07-13', type: 'debit', bankName: 'ICICI Bank' },
  { id: 'sms_014', amount: 650, merchant: 'Local Vendor', category: 'Others', date: '2026-07-12', type: 'debit', bankName: 'HDFC Bank' },
  { id: 'sms_015', amount: 85000, merchant: 'Salary Credit', category: 'Others', date: '2026-07-01', type: 'credit', bankName: 'HDFC Bank' },
  { id: 'sms_016', amount: 12000, merchant: 'Freelance Project', category: 'Others', date: '2026-07-05', type: 'credit', bankName: 'ICICI Bank' },
  { id: 'sms_017', amount: 1350, merchant: 'Dominos', category: 'Food', date: '2026-07-11', type: 'debit', bankName: 'HDFC Bank' },
  { id: 'sms_018', amount: 780, merchant: 'Starbucks', category: 'Food', date: '2026-07-10', type: 'debit', bankName: 'ICICI Bank' },
  { id: 'sms_019', amount: 4200, merchant: 'Flipkart', category: 'Shopping', date: '2026-07-09', type: 'debit', bankName: 'HDFC Bank' },
  { id: 'sms_020', amount: 3400, merchant: 'Ola', category: 'Travel', date: '2026-07-08', type: 'debit', bankName: 'ICICI Bank' },
  { id: 'sms_021', amount: 6500, merchant: 'Water Bill', category: 'Bills', date: '2026-07-07', type: 'debit', bankName: 'HDFC Bank' },
  { id: 'sms_022', amount: 999, merchant: 'Spotify', category: 'Entertainment', date: '2026-07-06', type: 'debit', bankName: 'ICICI Bank' },
  { id: 'sms_023', amount: 560, merchant: 'Dental Clinic', category: 'Healthcare', date: '2026-07-04', type: 'debit', bankName: 'HDFC Bank' },
  { id: 'sms_024', amount: 450, merchant: 'Petrol Pump', category: 'Others', date: '2026-07-03', type: 'debit', bankName: 'ICICI Bank' },
];

function calculateMonthlySummary(transactions: ParsedSmsTransaction[]): MonthlySummary {
  const debits = transactions.filter((t) => t.type === 'debit');
  const credits = transactions.filter((t) => t.type === 'credit');
  const totalIncome = credits.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = debits.reduce((s, t) => s + t.amount, 0);

  const categorySpending = {} as Record<SmsTrackingCategory, number>;
  (['Food', 'Shopping', 'Travel', 'Bills', 'Entertainment', 'Healthcare', 'Others'] as SmsTrackingCategory[]).forEach(
    (cat) => {
      categorySpending[cat] = debits
        .filter((t) => t.category === cat)
        .reduce((s, t) => s + t.amount, 0);
    },
  );

  const budgetScore = Math.max(0, Math.min(100, Math.round(100 - (totalExpenses / (totalIncome || 1)) * 50)));

  const savingsSuggestions = [
    'You spent ₹4,450 on dining this month — consider reducing by 20% to save ₹890.',
    'Shopping expenses are 35% higher than last month. Try a 30-day waitlist for non-essential purchases.',
    'Switch your Spotify plan to a family share to save ₹499/month.',
    'Setting up an auto-sweep to a savings account could earn you ~4.5% interest on your idle balance.',
    'Your travel spend is high — consider booking early to get 15-20% discounts.',
  ];

  return {
    totalIncome,
    totalExpenses,
    remainingBalance: totalIncome - totalExpenses,
    categorySpending,
    budgetScore,
    savingsSuggestions,
    recentTransactions: transactions.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
  };
}

export function requestSmsPermission(): Promise<SmsPermissionStatus> {
  return delay({ granted: true, canRequest: true }, 1000);
}

export function scanSmsTransactions(): Promise<{
  transactions: ParsedSmsTransaction[];
  summary: MonthlySummary;
}> {
  const summary = calculateMonthlySummary(MOCK_SMS_TRANSACTIONS);
  return delay({ transactions: [...MOCK_SMS_TRANSACTIONS], summary }, 3000);
}

export function getScanProgress(): Promise<{ step: 'scanning' | 'categorizing' | 'preparing'; progress: number }> {
  return delay(
    { step: 'scanning', progress: 0.3 },
    800,
  );
}