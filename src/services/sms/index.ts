import { Platform } from 'react-native';
import type { SmsPermissionStatus, ParsedSmsTransaction, MonthlySummary } from '../../types';
import { isBankSms } from './parser';
import { calculateMonthlySummary } from './summary';
import { importFromRawText } from './manualImport';

export { parseSmsText, parseBatchSms, isBankSms } from './parser';
export { calculateMonthlySummary } from './summary';
export { importFromRawText } from './manualImport';

let nativeModule: typeof import('./native') | null = null;

async function ensureNative(): Promise<typeof import('./native')> {
  if (!nativeModule) {
    nativeModule = await import('./native');
  }
  return nativeModule;
}

export async function requestSmsPermission(): Promise<SmsPermissionStatus> {
  if (Platform.OS !== 'android') {
    return { granted: false, canRequest: false };
  }
  try {
    const native = await ensureNative();
    return await native.requestSmsPermission();
  } catch {
    return { granted: false, canRequest: false };
  }
}

export async function scanSmsTransactions(): Promise<{
  transactions: ParsedSmsTransaction[];
  summary: MonthlySummary;
}> {
  if (Platform.OS !== 'android') {
    throw new Error('SMS reading is only available on Android devices.');
  }
  try {
    const native = await ensureNative();
    return await native.scanSmsTransactions();
  } catch (err) {
    throw err;
  }
}

export async function getScanProgress(): Promise<{ step: 'scanning' | 'categorizing' | 'preparing'; progress: number }> {
  try {
    const native = await ensureNative();
    return await native.getScanProgress();
  } catch {
    return { step: 'preparing', progress: 1 };
  }
}
