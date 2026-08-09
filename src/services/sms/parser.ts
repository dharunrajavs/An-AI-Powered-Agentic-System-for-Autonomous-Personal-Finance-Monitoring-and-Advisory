const BANK_KEYWORDS = [
  'hdfc', 'icici', 'sbi', 'axis', 'kotak', 'yesbank', 'indusind',
  'pnb', 'bob', 'canara', 'union', 'idbi', 'federal', 'rbl',
  'au bank', 'dbs', 'standard chartered', 'citi', 'hsbc',
];

const DEBIT_PATTERNS = [
  /(?:Rs\.?\s*|INR\s*|₹)\s*([\d,]+)\s*(?:debited|spent|paid|withdrawn)/i,
  /(?:debited|spent|paid|withdrawn)\s*(?:by|for|of)?\s*(?:Rs\.?\s*|INR\s*|₹)\s*([\d,]+)/i,
  /(?:A\/c|account|card).*?(?:debited|spent|paid)\s*(?:for|by)?\s*(?:Rs\.?\s*|INR\s*|₹)\s*([\d,]+)/i,
  /(?:Rs\.?\s*|INR\s*|₹)\s*([\d,]+)\s*(?:transaction|payment|purchase)/i,
];

const CREDIT_PATTERNS = [
  /(?:Rs\.?\s*|INR\s*|₹)\s*([\d,]+)\s*(?:credited|deposited|received|cashback)/i,
  /(?:credited|deposited|received)\s*(?:with|of)?\s*(?:Rs\.?\s*|INR\s*|₹)\s*([\d,]+)/i,
  /(?:salary|credit)\s*(?:of|:)?\s*(?:Rs\.?\s*|INR\s*|₹)\s*([\d,]+)/i,
];

const MERCHANT_PATTERNS = [
  /at\s+([A-Za-z0-9\s&.-]+?)(?:\s+(?:on|from|via|ref|avl|available|bal|txn))[\s\S]*$/i,
  /at\s+([A-Za-z0-9\s&.-]+?)$/i,
  /(?:to|for)\s+([A-Za-z0-9\s&.-]+?)(?:\s+(?:on|from|via|ref|by))[\s\S]*$/i,
  /(?:merchant|vendor|payee)\s*[:]\s*([A-Za-z0-9\s&.-]+)/i,
  /from\s+([A-Za-z0-9\s&.-]+?)(?:\s+(?:on|via|ref))[\s\S]*$/i,
];

const DATE_PATTERNS = [
  /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
  /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s?\d{2,4})/i,
  /(?:on|dated?)\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
  /(?:on|dated?)\s+(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s?\d{2,4})/i,
];

const AMOUNT_CLEAN = /[^0-9.]/g;

import type { ParsedSmsTransaction, SmsTrackingCategory } from '../../types';

let idCounter = 0;

function extractAmount(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const cleaned = match[1].replace(/,/g, '').replace(AMOUNT_CLEAN, '');
      const amount = parseFloat(cleaned);
      if (!isNaN(amount) && amount > 0) return amount;
    }
  }
  return null;
}

function extractMerchant(text: string): string {
  for (const pattern of MERCHANT_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      let merchant = match[1].trim().replace(/\s+/g, ' ');
      merchant = merchant.replace(/(?:on|from|via|ref|avl|available|bal|balance|txn|id|no).*/i, '').trim();
      if (merchant.length > 0 && merchant.length < 60) return merchant;
    }
  }
  return 'Unknown Merchant';
}

function extractDate(text: string): string {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      let dateStr = match[1];
      if (dateStr.includes('-') || dateStr.includes('/')) {
        const parts = dateStr.split(/[/-]/);
        if (parts.length === 3) {
          let d = parts[0].padStart(2, '0');
          let m = parts[1].padStart(2, '0');
          let y = parts[2];
          if (y.length === 2) y = '20' + y;
          dateStr = `${y}-${m}-${d}`;
        }
      } else {
        const parsed = new Date(dateStr);
        if (!isNaN(parsed.getTime())) {
          dateStr = parsed.toISOString().split('T')[0];
        }
      }
      return dateStr;
    }
  }
  return new Date().toISOString().split('T')[0];
}

function extractBank(text: string): string {
  const lower = text.toLowerCase();
  for (const bank of BANK_KEYWORDS) {
    if (lower.includes(bank)) {
      return bank.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Bank';
    }
  }
  return 'Unknown Bank';
}

function categorizeMerchant(merchant: string): SmsTrackingCategory {
  const lower = merchant.toLowerCase();

  const foodKeywords = ['swiggy', 'zomato', 'domino', 'pizza', 'starbucks', 'kfc', 'mcdonald', 'restaurant', 'dining', 'cafe', 'food', 'eat', 'dhaba', 'hotel'];
  for (const kw of foodKeywords) {
    if (lower.includes(kw)) return 'Food';
  }

  const shoppingKeywords = ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa', 'shopping', 'mall', 'store', 'retail', 'lifestyle', 'trends', 'max', 'pantaloons', 'zara', 'hm', 'walmart'];
  for (const kw of shoppingKeywords) {
    if (lower.includes(kw)) return 'Shopping';
  }

  const travelKeywords = ['uber', 'ola', 'makemytrip', 'goibibo', 'irctc', 'redbus', 'flight', 'railway', 'metro', 'taxi', 'cab', 'petrol', 'fuel', 'indian oil', 'bharat petroleum', 'hp petrol', 'car wash'];
  for (const kw of travelKeywords) {
    if (lower.includes(kw)) return 'Travel';
  }

  const billKeywords = ['electricity', 'bill', 'water', 'gas', 'broadband', 'jio', 'airtel', 'vi', 'vodafone', 'idea', 'bsnl', 'tata sky', 'dish tv', 'rent', 'maintenance', 'society', 'property tax', 'insurance'];
  for (const kw of billKeywords) {
    if (lower.includes(kw)) return 'Bills';
  }

  const entertainmentKeywords = ['netflix', 'prime', 'hotstar', 'zee5', 'sony liv', 'spotify', 'youtube', 'pvr', 'cinema', 'movie', 'theatre', 'game', 'gaming', 'bookmyshow'];
  for (const kw of entertainmentKeywords) {
    if (lower.includes(kw)) return 'Entertainment';
  }

  const healthKeywords = ['apollo', 'medplus', 'pharmacy', 'medical', 'hospital', 'clinic', 'doctor', 'dentist', 'medicine', 'health', 'wellness', 'diagnostic', 'pathology', 'dr.', 'ayurveda'];
  for (const kw of healthKeywords) {
    if (lower.includes(kw)) return 'Healthcare';
  }

  if (lower.includes('salary') || lower.includes('freelance')) return 'Others';

  return 'Others';
}

export function parseSmsText(smsText: string, sender: string = ''): ParsedSmsTransaction {
  idCounter += 1;

  const debitAmount = extractAmount(smsText, DEBIT_PATTERNS);
  const creditAmount = extractAmount(smsText, CREDIT_PATTERNS);

  const type: 'debit' | 'credit' = creditAmount !== null && debitAmount === null ? 'credit' : 'debit';
  const amount = type === 'credit' ? (creditAmount ?? 0) : (debitAmount ?? 0);

  let merchant = extractMerchant(smsText);
  if (type === 'credit' && merchant === 'Unknown Merchant') {
    const lower = smsText.toLowerCase();
    if (lower.includes('salary')) merchant = 'Salary Credit';
    else if (lower.includes('freelance') || lower.includes('payment received')) merchant = 'Payment Received';
    else if (lower.includes('refund') || lower.includes('cashback')) merchant = 'Refund';
    else merchant = 'Credit Transaction';
  }

  return {
    id: `sms_${Date.now()}_${idCounter}`,
    amount,
    merchant,
    category: categorizeMerchant(merchant),
    date: extractDate(smsText),
    type,
    bankName: extractBank(smsText),
  };
}

export function isBankSms(smsText: string, sender: string = ''): boolean {
  const lower = smsText.toLowerCase();
  const lowerSender = sender.toLowerCase();

  const hasBank = BANK_KEYWORDS.some((bank) => lower.includes(bank) || lowerSender.includes(bank));
  const hasAmount = /(?:rs\.?\s*|inr\s*|₹)\s*[\d,]/.test(lower);
  const hasTransactionWord = /(?:debited|credited|spent|paid|transaction|purchase|payment|withdrawn|deposited|received)/i.test(lower);

  return (hasBank || hasTransactionWord) && hasAmount;
}

export function parseBatchSms(smsList: { body: string; sender?: string }[]): ParsedSmsTransaction[] {
  const transactions: ParsedSmsTransaction[] = [];
  for (const sms of smsList) {
    if (isBankSms(sms.body, sms.sender ?? '')) {
      transactions.push(parseSmsText(sms.body, sms.sender ?? ''));
    }
  }
  return transactions;
}
