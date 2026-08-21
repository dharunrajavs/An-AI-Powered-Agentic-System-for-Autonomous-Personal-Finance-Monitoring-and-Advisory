import { Budget } from '../../types';
import { applyBudgetLimitOverrides } from '../budgetLimits';
import { USE_MOCK } from '../config';
import {
  deleteBudget as apiDeleteBudget,
  getBudgets as apiGetBudgets,
  upsertBudget as apiUpsertBudget,
} from '../api';
import { delay } from './delay';

let budgets: Budget[] = [
  { id: 'bud_001', category: 'Food & Drink', limit: 500, spent: 412.75, period: 'monthly' },
  { id: 'bud_002', category: 'Groceries', limit: 450, spent: 380.1, period: 'monthly' },
  { id: 'bud_003', category: 'Transport', limit: 200, spent: 145.2, period: 'monthly' },
  { id: 'bud_004', category: 'Subscriptions', limit: 60, spent: 58.97, period: 'monthly' },
  { id: 'bud_005', category: 'Shopping', limit: 300, spent: 340.5, period: 'monthly' },
  { id: 'bud_006', category: 'Entertainment', limit: 150, spent: 90.0, period: 'monthly' },
  { id: 'bud_007', category: 'Utilities', limit: 250, spent: 230.0, period: 'monthly' },
  { id: 'bud_008', category: 'Fitness', limit: 60, spent: 45.0, period: 'monthly' },
];

export async function getBudgets(): Promise<Budget[]> {
  if (!USE_MOCK) return apiGetBudgets();
  const merged = await applyBudgetLimitOverrides([...budgets]);
  return delay(merged);
}

export function upsertBudget(input: Budget): Promise<Budget> {
  if (!USE_MOCK) return apiUpsertBudget(input);
  const idx = budgets.findIndex((b) => b.id === input.id);
  if (idx >= 0) {
    budgets[idx] = input;
  } else {
    budgets = [...budgets, input];
  }
  return delay(input, 250);
}

export function deleteBudget(id: string): Promise<{ success: true }> {
  if (!USE_MOCK) return apiDeleteBudget(id);
  budgets = budgets.filter((b) => b.id !== id);
  return delay({ success: true }, 250);
}
