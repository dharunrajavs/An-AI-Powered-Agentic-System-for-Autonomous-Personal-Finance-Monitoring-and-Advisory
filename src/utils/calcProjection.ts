export function calcMonthsToTarget(currentAmount: number, targetAmount: number, monthlyContribution: number): number | null {
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;
  if (monthlyContribution <= 0) return null;
  return Math.ceil(remaining / monthlyContribution);
}

export function calcProjectedDate(currentAmount: number, targetAmount: number, monthlyContribution: number): Date | null {
  const months = calcMonthsToTarget(currentAmount, targetAmount, monthlyContribution);
  if (months === null) return null;
  const projected = new Date();
  projected.setMonth(projected.getMonth() + months);
  return projected;
}

export function calcRequiredMonthlyContribution(currentAmount: number, targetAmount: number, targetDate: string): number {
  const remaining = targetAmount - currentAmount;
  if (remaining <= 0) return 0;
  const monthsLeft = Math.max(
    1,
    Math.ceil((Date.parse(targetDate) - Date.parse(new Date().toISOString())) / (1000 * 60 * 60 * 24 * 30))
  );
  return remaining / monthsLeft;
}
