import AsyncStorage from '@react-native-async-storage/async-storage';
import { Budget } from '../types';
import { supabase } from './supabase/client';

const OVERRIDES_KEY_PREFIX = 'finance-advisor-budget-limits';

async function getUserId(): Promise<string> {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? 'anonymous';
  } catch {
    return 'anonymous';
  }
}

async function getOverridesKey(): Promise<string> {
  const uid = await getUserId();
  return `${OVERRIDES_KEY_PREFIX}-${uid}`;
}

export async function getBudgetLimitOverrides(): Promise<Record<string, number>> {
  try {
    const raw = await AsyncStorage.getItem(await getOverridesKey());
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

export async function saveBudgetLimit(category: string, limit: number): Promise<void> {
  const key = await getOverridesKey();
  const overrides = await getBudgetLimitOverrides();
  overrides[category] = limit;
  await AsyncStorage.setItem(key, JSON.stringify(overrides));
}

export async function applyBudgetLimitOverrides(budgets: Budget[]): Promise<Budget[]> {
  const overrides = await getBudgetLimitOverrides();
  if (Object.keys(overrides).length === 0) return budgets;
  return budgets.map((budget) => {
    const limit = overrides[budget.category];
    return limit !== undefined && limit > 0 ? { ...budget, limit } : budget;
  });
}