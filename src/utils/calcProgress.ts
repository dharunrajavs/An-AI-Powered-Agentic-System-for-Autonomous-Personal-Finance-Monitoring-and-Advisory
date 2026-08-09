export function calcProgress(current: number, target: number): number {
  if (target <= 0) return 0;
  return Math.min(100, Math.max(0, (current / target) * 100));
}

export type OnTrackStatus = 'on-track' | 'slightly-behind' | 'off-track';

export function calcGoalStatus(currentAmount: number, targetAmount: number, targetDate: string, createdDate: string): OnTrackStatus {
  const totalSpan = Date.parse(targetDate) - Date.parse(createdDate);
  const elapsed = Date.parse(new Date().toISOString()) - Date.parse(createdDate);
  if (totalSpan <= 0) return calcProgress(currentAmount, targetAmount) >= 100 ? 'on-track' : 'off-track';

  const expectedProgress = Math.min(100, Math.max(0, (elapsed / totalSpan) * 100));
  const actualProgress = calcProgress(currentAmount, targetAmount);
  const delta = actualProgress - expectedProgress;

  if (delta >= -5) return 'on-track';
  if (delta >= -20) return 'slightly-behind';
  return 'off-track';
}

export function calcBudgetPercent(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return (spent / limit) * 100;
}
