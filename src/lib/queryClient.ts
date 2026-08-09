import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

const CACHE_KEY = 'finance-advisor-query-cache';
const MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24 hours

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 15_000,
      gcTime: MAX_AGE_MS,
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: CACHE_KEY,
});

export function persistCache() {
  persistQueryClient({
    queryClient,
    persister: asyncStoragePersister,
    maxAge: MAX_AGE_MS,
  });
}
