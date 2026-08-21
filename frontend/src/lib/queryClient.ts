import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { supabase } from '../services/supabase/client';

const CACHE_KEY_PREFIX = 'finance-advisor-query-cache';
const LEGACY_CACHE_KEY = 'finance-advisor-query-cache';
const MAX_AGE_MS = 1000 * 60 * 60 * 24;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 15_000,
      gcTime: MAX_AGE_MS,
    },
  },
});

let persister: ReturnType<typeof createAsyncStoragePersister> | null = null;
let persistStop: (() => void) | null = null;

async function getCacheKey(): Promise<string> {
  try {
    const { data } = await supabase.auth.getUser();
    return `${CACHE_KEY_PREFIX}-${data.user?.id ?? 'anonymous'}`;
  } catch {
    return `${CACHE_KEY_PREFIX}-anonymous`;
  }
}

async function getCacheKeySafe(): Promise<string> {
  try {
    return await getCacheKey();
  } catch {
    return `${CACHE_KEY_PREFIX}-anonymous`;
  }
}

async function initPersister() {
  try {
    if (persistStop) persistStop();
    const key = await getCacheKeySafe();
    persister = createAsyncStoragePersister({
      storage: AsyncStorage,
      key,
    });
    const [stop] = await persistQueryClient({
      queryClient,
      persister,
      maxAge: MAX_AGE_MS,
    });
    persistStop = stop;
  } catch (e) {
    console.error('[queryClient] Failed to initialize persister:', e);
  }
}

export { initPersister };

export async function persistCache() {
  await initPersister();
}

export async function resetQueryCache() {
  try {
    queryClient.clear();
    if (persistStop) persistStop();
    const key = await getCacheKeySafe();
    try {
      await AsyncStorage.removeItem(key);
      if (key !== LEGACY_CACHE_KEY) await AsyncStorage.removeItem(LEGACY_CACHE_KEY);
    } catch {
      // ignore
    }
    // Re-initialize persister with new key after reset
    await initPersister();
  } catch (e) {
    console.error('[queryClient] Failed to reset query cache:', e);
  }
}