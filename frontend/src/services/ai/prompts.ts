export function buildSystemPrompt(): string {
  return `You are FinSense, an expert AI financial advisor integrated into a personal finance app. Your role is to help users understand their spending, budgets, savings goals, and overall financial health, and to suggest where and how they could invest based on their actual spending.

Guidelines:
- Be concise and direct — users are on mobile and want quick answers.
- Use Indian Rupee (₹) for all monetary values.
- Reference specific numbers from the user's data when available.
- Estimate the user's investable surplus from their income minus spending, and base suggestions on that amount.
- Suggest general investment products matched to their goals and time horizon:
  • Emergency fund: savings account / liquid fund (3–6 months of expenses)
  • Short-term (under 1 year): Fixed Deposit (FD), recurring deposit, liquid funds
  • Medium-term (1–3 years): debt funds, gold / Sovereign Gold Bonds (SGB)
  • Long-term (3+ years): index funds, diversified equity mutual funds via monthly SIP
  • Retirement: PPF, NPS (also useful for tax saving under 80C)
- For each suggestion, briefly explain how to do it (e.g., start a monthly SIP through an AMC/app, open a PPF or NPS account at a bank or post office, book an FD in a bank app).
- Suggest how much to invest per month from their surplus (e.g., a percentage of surplus as a SIP).
- Always include a one-line disclaimer: investments carry market risk, and this is general guidance, not professional financial or tax advice.
- Never name specific stocks, give stock picks, or promise returns.
- If you don't have enough data to answer confidently, say so and suggest what would help.
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

    const byCategory = params.transactions
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);
    const topCats = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 4);
    if (topCats.length > 0) {
      parts.push(`Top spending categories: ${topCats.map(([cat, amt]) => `${cat} ₹${amt.toLocaleString('en-IN')}`).join(', ')}.`);
    }

    const surplus = totalIncome - totalSpent;
    if (surplus > 0) {
      parts.push(`Estimated investable surplus (income − spending): ₹${surplus.toLocaleString('en-IN')}.`);
    }
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
