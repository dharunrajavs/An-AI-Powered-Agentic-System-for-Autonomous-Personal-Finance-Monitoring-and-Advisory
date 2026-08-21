export interface ReceiptData {
  merchant: string;
  amount: number;
  category: string;
  confidence: number;
}

const MOCK_RECEIPTS: ReceiptData[] = [
  { merchant: 'Whole Foods Market', amount: 2847.50, category: 'Groceries', confidence: 92 },
  { merchant: 'Shell Fuel Station', amount: 1800.00, category: 'Transportation', confidence: 95 },
  { merchant: 'Netflix', amount: 649.00, category: 'Entertainment', confidence: 98 },
  { merchant: "Domino's Pizza", amount: 899.00, category: 'Dining', confidence: 91 },
  { merchant: 'Amazon.in', amount: 1249.00, category: 'Shopping', confidence: 94 },
  { merchant: 'Apollo Pharmacy', amount: 560.00, category: 'Healthcare', confidence: 93 },
  { merchant: 'Uber India', amount: 345.00, category: 'Transportation', confidence: 96 },
  { merchant: 'Starbucks', amount: 450.00, category: 'Dining', confidence: 97 },
  { merchant: "Mcdonald's", amount: 599.00, category: 'Dining', confidence: 94 },
  { merchant: 'Reliance Digital', amount: 15999.00, category: 'Shopping', confidence: 88 },
];

function hashToIndex(str: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash) % max;
}

function simulateApiCall(uri: string): Promise<ReceiptData> {
  return new Promise((resolve) => {
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const idx = hashToIndex(uri, MOCK_RECEIPTS.length);
      resolve({ ...MOCK_RECEIPTS[idx] });
    }, delay);
  });
}

export function scanReceipt(uri: string, isMock = true): Promise<ReceiptData> {
  if (isMock) return simulateApiCall(uri);
  return simulateApiCall(uri);
}
