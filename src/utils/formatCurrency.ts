export function formatCurrency(amount: number, options?: { showSign?: boolean }): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (amount < 0) return `-${formatted}`;
  if (options?.showSign && amount > 0) return `+${formatted}`;
  return formatted;
}

export function formatCompactCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_00_00_000) return `${sign}₹${(abs / 1_00_00_000).toFixed(1)}Cr`;
  if (abs >= 1_00_000) return `${sign}₹${(abs / 1_00_000).toFixed(1)}L`;
  if (abs >= 1_000) return `${sign}₹${(abs / 1_000).toFixed(1)}K`;
  return formatCurrency(amount);
}
