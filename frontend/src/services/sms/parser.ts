import type { ParsedSmsTransaction, PaymentMethod, SmsTrackingCategory } from '../../types';
import { categorizeMerchant } from './categorize';

// ─── static keyword tables ──────────────────────────────────────

const BANK_KEYWORDS = [
  'hdfc', 'icici', 'sbi', 'state bank', 'axis', 'kotak', 'yes bank', 'yesbank', 'indusind',
  'pnb', 'punjab national', 'bank of baroda', 'bob ', 'canara', 'union bank', 'idbi',
  'federal', 'rbl', 'au bank', 'dbs', 'standard chartered', 'citi', 'hsbc', 'bandhan',
  'jupiter', 'equitas', 'sbm', 'south indian', 'karnataka', 'iob', 'indian overseas',
];

const DEBIT_PATTERNS: RegExp[] = [
  // ₹500 debited / Rs.500 debited / INR 500 debited
  /(?:rs\.?\s*|inr\s*|₹)\s*([\d,.]+)\s*(?:debited|debit|spent|paid|purchase|withdrawn|sent|transferred|deducted|swiped|used)/i,
  // debited by Rs.450 / debited with Rs 450 / spent Rs 300 at
  /(?:debited|debit|spent|paid|withdrawn|sent|transferred|deducted)\s*(?:by|with|of|for)?\s*(?:rs\.?\s*|inr\s*|₹)\s*([\d,.]+)/i,
  // A/c XXXX1234 is debited by Rs.450 at SWIGGY
  /(?:a\/c|account|card).*?(?:debited|debit|spent|paid|withdrawn)\s*(?:for|by|with)?\s*(?:rs\.?\s*|inr\s*|₹)\s*([\d,.]+)/i,
  // amount: ₹500 / amt: Rs 450
  /(?:amount|amt)\s*(?:is|of|:)?\s*(?:rs\.?\s*|inr\s*|₹)\s*([\d,.]+)/i,
];

const CREDIT_PATTERNS: RegExp[] = [
  // ₹500 credited / Rs.500 deposited / INR 500 received
  /(?:rs\.?\s*|inr\s*|₹)\s*([\d,.]+)\s*(?:credited\b|credit(?!\s*card)|deposited|received|added|cashback|refund)/i,
  // Rs 2000 has been credited into your account
  /(?:rs\.?\s*|inr\s*|₹)\s*([\d,.]+)[\s\S]{0,30}?(?:credited\b|credit(?!\s*card)|deposited|received|added|cashback|refund)/i,
  // credited with Rs 450 / deposited Rs 500
  /(?:credited|credit|deposited|received|added)\s*(?:with|of)?\s*(?:rs\.?\s*|inr\s*|₹)\s*([\d,.]+)/i,
  // salary credited Rs 50000 / salary of Rs 50000
  /(?:salary|credit|income)\s*(?:of|:)?\s*(?:rs\.?\s*|inr\s*|₹)\s*([\d,.]+)/i,
  // Credit to A/C XX1234 Rs 50000 / credited into your account Rs 50000 / deposited in account no 1234 Rs 500
  /(?:credit(?:ed)?|deposited|received)\s*(?:into|to|in|towards)?\s*(?:your\s+)?(?:account|a\/c|wallet)[\s\S]{0,40}?(?:rs\.?\s*|inr\s*|₹)\s*([\d,.]+)/i,
  // Credit Rs 50000 / credited Rs 50000 / credit: Rs 50000
  /(?:^|\s)credit(?:ed)?\s*(?:is|amount|of|:)?\s*(?:rs\.?\s*|inr\s*|₹)\s*([\d,.]+)/i,
];

const AMOUNT_STRIP = /[^\d.]/g;

const MERCHANT_STOP =
  '(?:on|from|via|ref|ref no|utr|upi|avl|available|bal|balance|txn|id|no\\.?|date|time|is|to|for|by)\\b';

const MERCHANT_PATTERNS: RegExp[] = [
  new RegExp(`\\bat\\s+([A-Za-z0-9\\s&.\\-@']{2,60}?)(?:\\s+${MERCHANT_STOP})[\\s\\S]*$`, 'i'),
  new RegExp(`\\bat\\s+([A-Za-z0-9\\s&.\\-@']{2,60}?)$`, 'i'),
  new RegExp(`(?:to|for|towards)\\s+([A-Za-z0-9\\s&.\\-@']{2,60}?)(?:\\s+${MERCHANT_STOP})[\\s\\S]*$`, 'i'),
  new RegExp(`(?:via)\\s+([A-Za-z0-9\\s&.\\-@']{2,60}?)(?:\\s+${MERCHANT_STOP})[\\s\\S]*$`, 'i'),
  new RegExp(`(?:merchant|vendor|payee|beneficiary)\\s*[:]\\s*([A-Za-z0-9\\s&.\\-@']{2,60})`, 'i'),
  new RegExp(`(?:from)\\s+([A-Za-z0-9\\s&.\\-@']{2,60}?)(?:\\s+${MERCHANT_STOP})[\\s\\S]*$`, 'i'),
];

const MERCHANT_STRIP =
  /\b(?:on|from|via|ref|ref no|utr|upi|avl|available|bal|balance|txn|id|no\.?|date|time|is|to|for|by|at|a\/c|card)\b.*/i;

const DATE_PATTERNS: RegExp[] = [
  /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
  /(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s-]?\d{2,4})/i,
  /(?:on|dated?)\s+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
  /(?:on|dated?)\s+(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\s-]?\d{2,4})/i,
];

const TIME_PATTERNS: RegExp[] = [
  /(\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)/i,
  /(?:at|time)\s+(\d{1,2}:\d{2})/i,
];

const OTP_PATTERNS: RegExp[] = [
  /otp|one[- ]?time password|verification code|is your (login|transaction) (code|otp)/i,
  /use [a-z0-9]{4,8} (?:as|to)/i,
];

// ─── hashing for duplicate prevention ──────────────────────────

export function hashMessage(text: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

// ─── extractors ─────────────────────────────────────────────────

function extractAmount(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleaned = match[1].replace(/,/g, '').replace(AMOUNT_STRIP, '');
      const amount = parseFloat(cleaned);
      if (!isNaN(amount) && amount > 0) return amount;
    }
  }
  return null;
}

function extractMerchant(text: string): string {
  for (const pattern of MERCHANT_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let merchant = match[1].trim().replace(/\s+/g, ' ');
      merchant = merchant.replace(MERCHANT_STRIP, '').trim().replace(/[.\s]+$/, '');
      if (merchant.length > 1 && merchant.length < 60) return merchant;
    }
  }
  return 'Unknown Merchant';
}

function extractDate(text: string): string {
  for (const pattern of DATE_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
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
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    }
  }
  return new Date().toISOString().split('T')[0];
}

function extractTime(text: string): string | undefined {
  for (const pattern of TIME_PATTERNS) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let t = match[1].trim();
      const isPm = /pm/i.test(t);
      const isAm = /am/i.test(t);
      const bare = t.replace(/\s*(?:am|pm)/i, '');
      const [h, m] = bare.split(':').map((n) => parseInt(n, 10));
      if (isNaN(h) || isNaN(m)) continue;
      let hour = h;
      if (isPm && hour < 12) hour += 12;
      if (isAm && hour === 12) hour = 0;
      const hh = String(hour).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      return `${hh}:${mm}`;
    }
  }
  return undefined;
}

function extractBank(text: string): string {
  const lower = text.toLowerCase();
  for (const bank of BANK_KEYWORDS) {
    if (lower.includes(bank)) {
      const label = bank
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      if (label.endsWith('Bank') || label.includes('Bank')) return label;
      return label + ' Bank';
    }
  }
  return 'Unknown Bank';
}

function extractAccountLast4(text: string): string | undefined {
  const match = text.match(/x{2,4}(\d{4})|\*\*(\d{4})|a\/c[^\d]*(\d{4})/i);
  if (match) {
    const last4 = match[1] ?? match[2] ?? match[3];
    if (last4 && /^\d{4}$/.test(last4)) return last4;
  }
  return undefined;
}

function extractReferenceId(text: string): string | undefined {
  const patterns: RegExp[] = [
    /(?:ref(?:erence)?(?: no)?\.?|utr|txn(?: id)?|transaction id|upi ref(?: no)?\.?|trxn)\s*[:#]?\s*([A-Za-z0-9]{6,24})/i,
    /(?:^|\s)(\d{12,16})(?:\s|$)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1];
  }
  return undefined;
}

function extractPaymentMethod(text: string): PaymentMethod {
  const lower = text.toLowerCase();
  if (lower.includes('atm')) return 'atm';
  if (lower.includes('withdrawn from') || lower.includes('withdrawn at')) return 'atm';
  if (lower.includes('upi') || lower.includes('vpa')) return 'upi';
  if (lower.includes('pos') || lower.includes('card') || lower.includes('debit card') || lower.includes('credit card') || lower.includes('swiped')) return 'card';
  if (lower.includes('neft') || lower.includes('imps') || lower.includes('rtgs') || lower.includes('transfer')) return 'bank';
  if (lower.includes('net banking')) return 'netbanking';
  return 'unknown';
}

// ─── main parse entry ───────────────────────────────────────────

let idCounter = 0;

export function parseSmsText(smsText: string, sender: string = ''): ParsedSmsTransaction {
  idCounter += 1;

  const debitAmount = extractAmount(smsText, DEBIT_PATTERNS);
  const creditAmount = extractAmount(smsText, CREDIT_PATTERNS);

  const type: 'debit' | 'credit' = creditAmount !== null && debitAmount === null ? 'credit' : 'debit';
  const amount = type === 'credit' ? (creditAmount ?? 0) : (debitAmount ?? 0);

  let merchant = extractMerchant(smsText);
  if (type === 'credit') {
    const lower = smsText.toLowerCase();
    if (lower.includes('salary')) merchant = 'Salary Credit';
    else if (lower.includes('refund')) merchant = 'Refund';
    else if (lower.includes('cashback')) merchant = 'Cashback';
    else if (merchant === 'Unknown Merchant') merchant = lower.includes('upi') ? 'UPI Credit' : 'Credit Transaction';
  }

  const bankName = extractBank(smsText);

  return {
    id: `sms_${Date.now()}_${idCounter}`,
    amount,
    merchant,
    category: categorizeMerchant(merchant),
    date: extractDate(smsText),
    time: extractTime(smsText),
    type,
    bankName,
    accountLast4: extractAccountLast4(smsText),
    referenceId: extractReferenceId(smsText),
    paymentMethod: extractPaymentMethod(smsText),
    messageHash: hashMessage(smsText),
  };
}

// ─── validation / classification ───────────────────────────────

export function isOtpOrPromotional(text: string): boolean {
  const lower = text.toLowerCase();
  for (const pattern of OTP_PATTERNS) {
    if (pattern.test(lower)) return true;
  }
  if (/unsubscribe|promotional|offer|discount %|win (?:a )?prize|congratulations.*won/i.test(lower)) return true;
  return false;
}

export function isBankSms(smsText: string, sender: string = ''): boolean {
  if (!smsText || smsText.trim().length < 10) return false;
  if (isOtpOrPromotional(smsText)) return false;

  const lower = smsText.toLowerCase();
  const lowerSender = sender.toLowerCase();

  const hasBank = BANK_KEYWORDS.some((bank) => lower.includes(bank) || lowerSender.includes(bank));
  const hasAmount = /(?:rs\.?\s*|inr\s*|₹)\s*[\d,]/.test(lower);
  const hasTransactionWord = /(?:debited|debit|credited|credit|spent|paid|purchase|payment|withdrawn|deposited|received|sent|transferred|deducted|added)/i.test(lower);
  const hasUpiWord = /upi|vpa/i.test(lower);

  return (hasBank || hasTransactionWord || hasUpiWord) && hasAmount;
}

export function validateParsed(parsed: ParsedSmsTransaction): boolean {
  if (!parsed || parsed.amount <= 0) return false;
  if (parsed.merchant === 'Unknown Merchant') return false;
  return true;
}

export function parseBatchSms(smsList: { body: string; sender?: string }[]): ParsedSmsTransaction[] {
  const transactions: ParsedSmsTransaction[] = [];
  for (const sms of smsList) {
    if (isBankSms(sms.body, sms.sender ?? '')) {
      const parsed = parseSmsText(sms.body, sms.sender ?? '');
      if (validateParsed(parsed)) transactions.push(parsed);
    }
  }
  return transactions;
}