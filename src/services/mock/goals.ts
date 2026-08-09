import { Goal } from '../../types';
import { delay } from './delay';

let goals: Goal[] = [
  {
    id: 'goal_001',
    name: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 6200,
    targetDate: '2026-12-31',
    linkedAccount: 'Ally Savings',
  },
  {
    id: 'goal_002',
    name: 'Hawaii Trip',
    targetAmount: 4000,
    currentAmount: 1200,
    targetDate: '2026-11-01',
    linkedAccount: 'Ally Savings',
  },
  {
    id: 'goal_003',
    name: 'New Car Down Payment',
    targetAmount: 8000,
    currentAmount: 7800,
    targetDate: '2026-08-01',
    linkedAccount: 'Chase Checking',
  },
  {
    id: 'goal_004',
    name: 'Home Down Payment',
    targetAmount: 50000,
    currentAmount: 12000,
    targetDate: '2029-01-01',
    linkedAccount: 'Ally Savings',
  },
];

export function getGoals(): Promise<Goal[]> {
  return delay([...goals]);
}

export function upsertGoal(input: Goal): Promise<Goal> {
  const idx = goals.findIndex((g) => g.id === input.id);
  if (idx >= 0) {
    goals[idx] = input;
  } else {
    goals = [...goals, input];
  }
  return delay(input, 250);
}

export function deleteGoal(id: string): Promise<{ success: true }> {
  goals = goals.filter((g) => g.id !== id);
  return delay({ success: true }, 250);
}
