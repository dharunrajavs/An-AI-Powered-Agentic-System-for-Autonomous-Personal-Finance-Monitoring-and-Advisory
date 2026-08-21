export interface CreditCardBill {
  id: string;
  bankName: string;
  cardLastFour: string;
  amount: number;
  dueDate: string;
  statementDate: string;
  status: 'paid' | 'upcoming' | 'overdue';
  minDue: number;
}

const MOCK_BILLS: CreditCardBill[] = [
  { id: 'cc_001', bankName: 'HDFC Bank', cardLastFour: '4521', amount: 28450, dueDate: '2026-08-05', statementDate: '2026-07-15', status: 'upcoming', minDue: 14225 },
  { id: 'cc_002', bankName: 'ICICI Bank', cardLastFour: '9876', amount: 12600, dueDate: '2026-08-12', statementDate: '2026-07-20', status: 'upcoming', minDue: 6300 },
  { id: 'cc_003', bankName: 'SBI Card', cardLastFour: '3344', amount: 8200, dueDate: '2026-07-28', statementDate: '2026-07-10', status: 'overdue', minDue: 4100 },
  { id: 'cc_004', bankName: 'Axis Bank', cardLastFour: '2211', amount: 55000, dueDate: '2026-08-20', statementDate: '2026-07-25', status: 'upcoming', minDue: 27500 },
];

const MOCK_SMS_MAPPING: Record<string, { amount: number; bankName: string; cardLastFour: string }> = {
  'Your HDFC Bank Credit Card statement for card ending 4521 is ready. Total due: Rs.28,450. Due date: 05 Aug 2026. Min due: Rs.14,225.':
    { amount: 28450, bankName: 'HDFC Bank', cardLastFour: '4521' },
  'ICICI Bank Credit Card: Your statement for card XX9876 is generated. Amount due: Rs.12,600. Pay by 12 Aug 2026.':
    { amount: 12600, bankName: 'ICICI Bank', cardLastFour: '9876' },
};

function hashId(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return `cc_${Math.abs(hash).toString(16).slice(0, 6)}`;
}

export function parseCreditCardSms(smsText: string): CreditCardBill | null {
  const mapping = MOCK_SMS_MAPPING[smsText];
  if (mapping) {
    const dueDateMatch = smsText.match(/(\d{1,2}\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4})/);
    const today = new Date();
    const dueDateStr = dueDateMatch ? dueDateMatch[1] : `${today.getDate() + 14} ${today.toLocaleString('default', { month: 'short' })} ${today.getFullYear()}`;

    return {
      id: hashId(smsText),
      bankName: mapping.bankName,
      cardLastFour: mapping.cardLastFour,
      amount: mapping.amount,
      dueDate: new Date(dueDateStr).toISOString().split('T')[0],
      statementDate: today.toISOString().split('T')[0],
      status: new Date(dueDateStr) < today ? 'overdue' : 'upcoming',
      minDue: Math.round(mapping.amount * 0.5),
    };
  }
  return null;
}

export function fetchCreditCardBills(): Promise<CreditCardBill[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const today = new Date();
      const bills = MOCK_BILLS.map((b) => ({
        ...b,
        status: (new Date(b.dueDate) < today ? 'overdue' : 'upcoming') as 'paid' | 'upcoming' | 'overdue',
      }));
      resolve(bills);
    }, 600);
  });
}

export function payCreditCardBill(billId: string): Promise<CreditCardBill> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const bill = MOCK_BILLS.find((b) => b.id === billId);
      if (bill) {
        resolve({ ...bill, status: 'paid' });
      } else {
        reject(new Error('Bill not found'));
      }
    }, 800);
  });
}

export function getTotalDue(bills: CreditCardBill[]): number {
  return bills.filter((b) => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);
}

export function getMinTotalDue(bills: CreditCardBill[]): number {
  return bills.filter((b) => b.status !== 'paid').reduce((s, b) => s + b.minDue, 0);
}
