export function buildSystemPrompt(): string {
  return `You are FinSense, an expert AI financial advisor integrated into a personal finance app. Your role is to help users understand their spending, budgets, savings goals, and overall financial health.

Guidelines:
- Be concise and direct — users are on mobile and want quick answers.
- Use Indian Rupee (₹) for all monetary values.
- Reference specific numbers from the user's data when available.
- If you don't have enough data to answer confidently, say so and suggest what would help.
- Never give stock picks, specific investment advice, or tax advice.
- Keep responses under 150 words unless the user asks for details.
- Use a friendly but professional tone.
- Always consider the user's financial wellness — encourage saving and mindful spending.`;
}

export function buildContextPrompt(params: {
  transactions: { merchant: string; amount: number; category: string; date: string; flagged?: boolean }[];
  budgets: { category: string; spent: number; limit: number; period: string }[];
  goals: { name: string; currentAmount: number; targetAmount: number; targetDate: string }[];
  accounts: { nickname: string; balance: number }[];
  recentMessages: { role: string; text: string }[];
}): string {
  const parts: string[] = [];

  if (params.accounts.length > 0) {
    const total = params.accounts.reduce((s, a) => s + a.balance, 0);
    parts.push(`Total account balance: ₹${total.toLocaleString('en-IN')}`);
    params.accounts.slice(0, 3).forEach((a) => {
      parts.push(`  - ${a.nickname}: ₹${a.balance.toLocaleString('en-IN')}`);
    });
  }

  if (params.transactions.length > 0) {
    const totalSpent = params.transactions
      .filter((t) => t.amount < 0)
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    const totalIncome = params.transactions
      .filter((t) => t.amount > 0)
      .reduce((s, t) => s + t.amount, 0);
    parts.push(`Recent spending: ₹${totalSpent.toLocaleString('en-IN')} spent, ₹${totalIncome.toLocaleString('en-IN')} income across ${params.transactions.length} transactions.`);
  }

  if (params.budgets.length > 0) {
    params.budgets.forEach((b) => {
      const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
      parts.push(`Budget: ${b.category} — ₹${b.spent.toLocaleString('en-IN')} / ₹${b.limit.toLocaleString('en-IN')} (${pct}% used)`);
    });
  }

  if (params.goals.length > 0) {
    params.goals.forEach((g) => {
      const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
      parts.push(`Goal: ${g.name} — ₹${g.currentAmount.toLocaleString('en-IN')} / ₹${g.targetAmount.toLocaleString('en-IN')} (${pct}%)`);
    });
  }

  if (params.recentMessages.length > 0) {
    const recent = params.recentMessages.slice(-4);
    parts.push('Recent conversation:');
    recent.forEach((m) => parts.push(`  ${m.role}: ${m.text}`));
  }

  return parts.join('\n');
}
