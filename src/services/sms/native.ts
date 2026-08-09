import { Platform, NativeModules } from 'react-native';
import type { SmsPermissionStatus, ParsedSmsTransaction, MonthlySummary } from '../../types';
import { parseBatchSms, isBankSms } from './parser';
import { calculateMonthlySummary } from './summary';

const SmsReader = NativeModules.SmsReader;

function isModuleAvailable(): boolean {
  return !!(SmsReader?.requestPermission && SmsReader?.readSms);
}

export async function requestSmsPermission(): Promise<SmsPermissionStatus> {
  if (Platform.OS !== 'android') {
    return { granted: false, canRequest: false };
  }
  if (!isModuleAvailable()) {
    return { granted: false, canRequest: false };
  }
  try {
    const result = await SmsReader.requestPermission();
    return { granted: result === true || result === 'granted', canRequest: true };
  } catch {
    return { granted: false, canRequest: false };
  }
}

export async function scanSmsTransactions(): Promise<{
  transactions: ParsedSmsTransaction[];
  summary: MonthlySummary;
}> {
  if (Platform.OS !== 'android' || !isModuleAvailable()) {
    throw new Error('SMS reading is only available on Android with the SmsReader module installed.');
  }
  try {
    const rawSmsList = await SmsReader.readSms({
      maxCount: 200,
      filter: ['bank', 'account', 'transaction', 'payment', 'credited', 'debited', 'spent', 'upi'],
    });
    const items: { body: string; sender: string }[] = (rawSmsList ?? []).map((item: any) => ({
      body: item.body ?? item.message ?? '',
      sender: item.sender ?? item.address ?? '',
    }));
    const transactions = parseBatchSms(items);
    const summary = calculateMonthlySummary(transactions);
    return { transactions, summary };
  } catch (err) {
    throw new Error(`Failed to read SMS: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export async function getScanProgress(): Promise<{ step: 'scanning' | 'categorizing' | 'preparing'; progress: number }> {
  if (!isModuleAvailable()) {
    return { step: 'preparing', progress: 1 };
  }
  try {
    const progress = await SmsReader.getScanProgress();
    return progress ?? { step: 'preparing', progress: 1 };
  } catch {
    return { step: 'preparing', progress: 1 };
  }
}
