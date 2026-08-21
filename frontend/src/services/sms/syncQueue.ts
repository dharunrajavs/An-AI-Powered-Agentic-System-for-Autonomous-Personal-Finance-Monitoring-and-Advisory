import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ParsedSmsTransaction } from '../../types';

const SYNC_QUEUE_KEY = 'finance-advisor-sms-sync-queue';
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY_MS = 5000;

export interface QueuedSmsTransaction extends ParsedSmsTransaction {
  queuedAt: string;
  retryCount: number;
  lastError?: string;
}

export async function getSyncQueue(): Promise<QueuedSmsTransaction[]> {
  try {
    const raw = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveSyncQueue(queue: QueuedSmsTransaction[]): Promise<void> {
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export async function enqueueTransaction(transaction: ParsedSmsTransaction): Promise<void> {
  const queue = await getSyncQueue();
  const queued: QueuedSmsTransaction = {
    ...transaction,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
  };
  queue.push(queued);
  await saveSyncQueue(queue);
}

export async function removeFromQueue(messageHash: string): Promise<void> {
  const queue = await getSyncQueue();
  const filtered = queue.filter((t) => t.messageHash !== messageHash);
  await saveSyncQueue(filtered);
}

export async function incrementRetryCount(messageHash: string, error?: string): Promise<void> {
  const queue = await getSyncQueue();
  const index = queue.findIndex((t) => t.messageHash === messageHash);
  if (index >= 0) {
    queue[index].retryCount += 1;
    queue[index].lastError = error;
    await saveSyncQueue(queue);
  }
}

export async function getPendingTransactions(): Promise<QueuedSmsTransaction[]> {
  const queue = await getSyncQueue();
  return queue.filter((t) => t.retryCount < MAX_RETRIES);
}

export async function getFailedTransactions(): Promise<QueuedSmsTransaction[]> {
  const queue = await getSyncQueue();
  return queue.filter((t) => t.retryCount >= MAX_RETRIES);
}

export async function clearFailedTransactions(): Promise<void> {
  const queue = await getSyncQueue();
  const filtered = queue.filter((t) => t.retryCount < MAX_RETRIES);
  await saveSyncQueue(filtered);
}

export async function retryTransaction(
  transaction: QueuedSmsTransaction,
  saveFn: (tx: ParsedSmsTransaction) => Promise<{ created: number; skipped: number }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await saveFn(transaction);
    if (result.created > 0) {
      await removeFromQueue(transaction.messageHash!);
      return { success: true };
    }
    if (result.skipped > 0) {
      await removeFromQueue(transaction.messageHash!);
      return { success: true };
    }
    return { success: false, error: 'Unknown save result' };
  } catch (err) {
    const error = err instanceof Error ? err.message : 'Unknown error';
    await incrementRetryCount(transaction.messageHash!, error);
    return { success: false, error };
  }
}

export async function processSyncQueue(
  saveFn: (tx: ParsedSmsTransaction) => Promise<{ created: number; skipped: number }>
): Promise<{ processed: number; succeeded: number; failed: number }> {
  const pending = await getPendingTransactions();
  let succeeded = 0;
  let failed = 0;

  for (const transaction of pending) {
    const result = await retryTransaction(transaction, saveFn);
    if (result.success) {
      succeeded++;
    } else {
      failed++;
    }
  }

  return { processed: pending.length, succeeded, failed };
}

export async function getQueueStats(): Promise<{ pending: number; failed: number; total: number }> {
  const queue = await getSyncQueue();
  const pending = queue.filter((t) => t.retryCount < MAX_RETRIES).length;
  const failed = queue.filter((t) => t.retryCount >= MAX_RETRIES).length;
  return { pending, failed, total: queue.length };
}