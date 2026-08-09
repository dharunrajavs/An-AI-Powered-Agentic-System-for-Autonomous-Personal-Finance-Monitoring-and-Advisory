import type { ParsedSmsTransaction, MonthlySummary } from '../../types';
import { parseSmsText, isBankSms } from './parser';
import { calculateMonthlySummary } from './summary';

export function importFromRawText(rawText: string): { transactions: ParsedSmsTransaction[]; summary: MonthlySummary } {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 10);

  const transactions: ParsedSmsTransaction[] = [];

  for (const line of lines) {
    try {
      if (isBankSms(line)) {
        const parsed = parseSmsText(line);
        transactions.push(parsed);
      }
    } catch {
      // skip unparseable lines
    }
  }

  if (transactions.length === 0) {
    const lines = rawText.split(/\n|(?<=\.)\s*/).filter((l) => l.trim().length > 10);
    for (const line of lines) {
      try {
        if (isBankSms(line)) {
          const parsed = parseSmsText(line);
          transactions.push(parsed);
        }
      } catch { }
    }
  }

  const summary = calculateMonthlySummary(transactions);
  return { transactions, summary };
}
