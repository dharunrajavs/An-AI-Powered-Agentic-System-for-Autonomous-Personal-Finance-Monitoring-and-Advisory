import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import type { ParsedSmsTransaction } from '../../types';
import { saveDetectedSmsTransactions } from '../api';
import { isBankSms, parseSmsText, validateParsed } from './parser';
import { requestSmsPermission } from './native';
import { enqueueTransaction, getSyncQueue } from './syncQueue';

const SmsReader = NativeModules.SmsReader;

const MONITOR_EVENT = 'onSmsReceived';

let emitter: NativeEventEmitter | null = null;
let subscription: { remove: () => void } | null = null;
let isProcessingQueue = false;

interface DetectedSms {
  body: string;
  sender: string;
  timestamp: number;
}

export type SmsDetectionResult =
  | { saved: true; created: number; skipped: number; transaction: ParsedSmsTransaction }
  | { saved: false; reason: 'ignored' | 'invalid' | 'unsupported' | 'duplicate' | 'error' | 'queued'; message?: string };

function getEmitter(): NativeEventEmitter | null {
  if (Platform.OS !== 'android' || !SmsReader) return null;
  if (!emitter) emitter = new NativeEventEmitter(SmsReader);
  return emitter;
}

export function isSmsMonitorSupported(): boolean {
  return Platform.OS === 'android' && !!(SmsReader?.startMonitoring && SmsReader?.stopMonitoring);
}

export async function processIncomingSms(body: string, sender: string): Promise<SmsDetectionResult> {
  try {
    if (!body || !isBankSms(body, sender)) {
      return { saved: false, reason: 'ignored' };
    }

    const parsed = parseSmsText(body, sender);
    if (!validateParsed(parsed)) {
      return { saved: false, reason: 'invalid' };
    }

    const result = await saveDetectedSmsTransactions([parsed]);
    if (result.created > 0) {
      return { saved: true, created: result.created, skipped: result.skipped, transaction: parsed };
    }
    if (result.skipped > 0) {
      return { saved: false, reason: 'duplicate' };
    }
    return { saved: false, reason: 'error', message: 'Unknown save result' };
  } catch (err) {
    const parsed = parseSmsText(body, sender);
    if (validateParsed(parsed)) {
      await enqueueTransaction(parsed);
      return { saved: false, reason: 'queued', message: 'Transaction queued for sync when online' };
    }
    return {
      saved: false,
      reason: 'error',
      message: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

export async function startSmsMonitoring(): Promise<boolean> {
  if (Platform.OS !== 'android' || !SmsReader?.startMonitoring) return false;
  try {
    const started = await SmsReader.startMonitoring();
    return started === true;
  } catch {
    return false;
  }
}

export async function stopSmsMonitoring(): Promise<boolean> {
  if (Platform.OS !== 'android' || !SmsReader?.stopMonitoring) return false;
  try {
    const stopped = await SmsReader.stopMonitoring();
    return stopped !== false;
  } catch {
    return false;
  }
}

export async function isSmsMonitoringActive(): Promise<boolean> {
  if (Platform.OS !== 'android' || !SmsReader?.isMonitoring) return false;
  try {
    return (await SmsReader.isMonitoring()) === true;
  } catch {
    return false;
  }
}

export function subscribeToIncomingSms(onSms: (sms: DetectedSms) => void): () => void {
  const eventEmitter = getEmitter();
  if (!eventEmitter) return () => undefined;

  if (subscription) subscription.remove();
  subscription = eventEmitter.addListener(MONITOR_EVENT, (payload: any) => {
    const body = payload?.body ?? '';
    const sender = payload?.sender ?? '';
    const timestamp = payload?.timestamp ?? Date.now();
    if (!body) return;
    onSms({ body, sender, timestamp });
  });

  return () => {
    subscription?.remove();
    subscription = null;
  };
}

export async function ensureSmsMonitoring(onSms: (sms: DetectedSms) => void): Promise<boolean> {
  const eventEmitter = getEmitter();
  if (!eventEmitter) return false;

  subscribeToIncomingSms(onSms);

  const permission = await requestSmsPermission();
  if (!permission.granted) return false;

  return startSmsMonitoring();
}

export async function processSyncQueue(): Promise<{ processed: number; succeeded: number; failed: number }> {
  if (isProcessingQueue) return { processed: 0, succeeded: 0, failed: 0 };
  isProcessingQueue = true;

  try {
    const { getSyncQueue, removeFromQueue, incrementRetryCount } = await import('./syncQueue');
    const { saveDetectedSmsTransactions } = await import('../api');

    const queue = await getSyncQueue();
    const pending = queue.filter((t) => t.retryCount < 5);
    let succeeded = 0;
    let failed = 0;

    for (const transaction of pending) {
      try {
        const result = await saveDetectedSmsTransactions([transaction]);
        if (result.created > 0 || result.skipped > 0) {
          await removeFromQueue(transaction.messageHash!);
          succeeded++;
        } else {
          failed++;
        }
      } catch (err) {
        const { incrementRetryCount } = await import('./syncQueue');
        await incrementRetryCount(transaction.messageHash!, err instanceof Error ? err.message : 'Unknown error');
        failed++;
      }
    }

    return { processed: pending.length, succeeded, failed };
  } finally {
    isProcessingQueue = false;
  }
}

export async function getQueuedTransactionsCount(): Promise<number> {
  const { getSyncQueue } = await import('./syncQueue');
  const queue = await getSyncQueue();
  return queue.filter((t) => t.retryCount < 5).length;
}

export async function getFailedQueueCount(): Promise<number> {
  const { getSyncQueue } = await import('./syncQueue');
  const queue = await getSyncQueue();
  return queue.filter((t) => t.retryCount >= 5).length;
}

export async function retryFailedTransactions(): Promise<{ processed: number; succeeded: number; failed: number }> {
  const { getSyncQueue, removeFromQueue } = await import('./syncQueue');
  const { saveDetectedSmsTransactions } = await import('../api');

  const queue = await getSyncQueue();
  const failed = queue.filter((t) => t.retryCount >= 5);
  let succeeded = 0;

  for (const transaction of failed) {
    try {
      const result = await saveDetectedSmsTransactions([transaction]);
      if (result.created > 0 || result.skipped > 0) {
        await removeFromQueue(transaction.messageHash!);
        succeeded++;
      }
    } catch {
      // Keep in failed state
    }
  }

  return { processed: failed.length, succeeded, failed: failed.length - succeeded };
}