import {
  AgentAction,
  AgentInsight,
  AgentPreferences,
  Asset,
  Budget,
  ChatMessage,
  ConnectedAccount,
  Goal,
  AppNotification,
  Transaction,
  UpiAccount,
  UpiProvider,
  UserProfile,
} from '../../types';
import { supabase } from '../supabase/client';

export const CATEGORIES = [
  'Food & Drink',
  'Groceries',
  'Transport',
  'Subscriptions',
  'Rent',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Health',
  'Travel',
  'Fitness',
  'Personal Care',
  'Income',
];

export const CASH_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Others',
];

export const ACCOUNTS = ['Chase Checking', 'Chase Sapphire Credit Card', 'Ally Savings'];

function getUserId(): Promise<string> {
  return supabase.auth.getUser().then(({ data, error }) => {
    if (error || !data.user) throw new Error('Not authenticated');
    return data.user.id;
  });
}

// ─── helpers ────────────────────────────────────────────────────

function mapTransaction(row: any): Transaction {
  return {
    id: row.id,
    date: row.date,
    time: row.time ?? undefined,
    amount: Number(row.amount),
    category: row.category,
    merchant: row.merchant,
    account: row.account,
    paymentMethod: row.payment_method,
    notes: row.notes ?? undefined,
    flagged: row.flagged ?? undefined,
  };
}

function mapBudget(row: any): Budget {
  return {
    id: row.id,
    category: row.category,
    limit: Number(row.limit),
    spent: Number(row.spent),
    period: row.period,
  };
}

function mapGoal(row: any): Goal {
  return {
    id: row.id,
    name: row.name,
    targetAmount: Number(row.target_amount),
    currentAmount: Number(row.current_amount),
    targetDate: row.target_date,
    linkedAccount: row.linked_account ?? undefined,
  };
}

function mapInsight(row: any): AgentInsight {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    severity: row.severity,
    createdAt: row.created_at,
    relatedEntity: row.related_entity ?? undefined,
  };
}

function mapAction(row: any): AgentAction {
  return {
    id: row.id,
    description: row.description,
    timestamp: row.timestamp,
    status: row.status,
  };
}

function mapAsset(row: any): Asset {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    value: Number(row.value),
    returnPct: Number(row.return_pct),
    history: row.history ?? [],
  };
}

function mapNotification(row: any): AppNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    createdAt: row.created_at,
    read: row.read,
  };
}

function mapAccount(row: any): ConnectedAccount {
  return {
    id: row.id,
    institution: row.institution,
    nickname: row.nickname,
    mask: row.mask,
    balance: Number(row.balance),
    syncStatus: row.sync_status,
  };
}

function mapChatMessage(row: any): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    text: row.text,
    createdAt: row.created_at,
  };
}

function mapProfile(row: any): UserProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatarInitials: row.avatar_initials,
  };
}

function mapPreferences(row: any): AgentPreferences {
  return {
    autonomyLevel: row.autonomy_level,
    notifyOverspend: row.notify_overspend,
    notifyBillDue: row.notify_bill_due,
    notifyUnusualTransaction: row.notify_unusual_transaction,
    notifyGoalMilestone: row.notify_goal_milestone,
    notifyWeeklyDigest: row.notify_weekly_digest,
  };
}

// ─── transactions ───────────────────────────────────────────────

export async function getTransactions(): Promise<Transaction[]> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', uid)
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTransaction);
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', uid)
    .maybeSingle();
  if (error) throw error;
  return data ? mapTransaction(data) : undefined;
}

export async function deleteTransaction(id: string): Promise<{ success: true }> {
  const uid = await getUserId();
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', uid);
  if (error) throw error;
  return { success: true };
}

export async function updateTransaction(
  id: string,
  patch: Partial<Transaction>,
): Promise<Transaction | undefined> {
  const uid = await getUserId();
  const dbPatch: Record<string, any> = {};
  if (patch.date !== undefined) dbPatch.date = patch.date;
  if (patch.time !== undefined) dbPatch.time = patch.time;
  if (patch.amount !== undefined) dbPatch.amount = patch.amount;
  if (patch.category !== undefined) dbPatch.category = patch.category;
  if (patch.merchant !== undefined) dbPatch.merchant = patch.merchant;
  if (patch.account !== undefined) dbPatch.account = patch.account;
  if (patch.paymentMethod !== undefined) dbPatch.payment_method = patch.paymentMethod;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  if (patch.flagged !== undefined) dbPatch.flagged = patch.flagged;

  const { data, error } = await supabase
    .from('transactions')
    .update(dbPatch)
    .eq('id', id)
    .eq('user_id', uid)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? mapTransaction(data) : undefined;
}

export async function addTransaction(
  input: Omit<Transaction, 'id'>,
): Promise<Transaction> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: uid,
      date: input.date,
      time: input.time ?? null,
      amount: input.amount,
      category: input.category,
      merchant: input.merchant,
      account: input.account,
      payment_method: input.paymentMethod,
      notes: input.notes ?? null,
      flagged: input.flagged ?? false,
    })
    .select()
    .single();
  if (error) throw error;
  return mapTransaction(data);
}

// ─── budgets ────────────────────────────────────────────────────

export async function getBudgets(): Promise<Budget[]> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', uid);
  if (error) throw error;
  return (data ?? []).map(mapBudget);
}

export async function upsertBudget(input: Budget): Promise<Budget> {
  const uid = await getUserId();
  const existing = input.id
    ? await supabase
        .from('budgets')
        .select('id')
        .eq('id', input.id)
        .eq('user_id', uid)
        .maybeSingle()
    : null;

  if (existing?.data) {
    const { data, error } = await supabase
      .from('budgets')
      .update({
        category: input.category,
        limit: input.limit,
        spent: input.spent,
        period: input.period,
      })
      .eq('id', input.id)
      .eq('user_id', uid)
      .select()
      .single();
    if (error) throw error;
    return mapBudget(data);
  } else {
    const { data, error } = await supabase
      .from('budgets')
      .insert({
        user_id: uid,
        category: input.category,
        limit: input.limit,
        spent: input.spent,
        period: input.period,
      })
      .select()
      .single();
    if (error) throw error;
    return mapBudget(data);
  }
}

export async function deleteBudget(id: string): Promise<{ success: true }> {
  const uid = await getUserId();
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', uid);
  if (error) throw error;
  return { success: true };
}

// ─── goals ──────────────────────────────────────────────────────

export async function getGoals(): Promise<Goal[]> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', uid);
  if (error) throw error;
  return (data ?? []).map(mapGoal);
}

export async function upsertGoal(input: Goal): Promise<Goal> {
  const uid = await getUserId();
  const existing = input.id
    ? await supabase
        .from('goals')
        .select('id')
        .eq('id', input.id)
        .eq('user_id', uid)
        .maybeSingle()
    : null;

  if (existing?.data) {
    const { data, error } = await supabase
      .from('goals')
      .update({
        name: input.name,
        target_amount: input.targetAmount,
        current_amount: input.currentAmount,
        target_date: input.targetDate,
        linked_account: input.linkedAccount ?? null,
      })
      .eq('id', input.id)
      .eq('user_id', uid)
      .select()
      .single();
    if (error) throw error;
    return mapGoal(data);
  } else {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: uid,
        name: input.name,
        target_amount: input.targetAmount,
        current_amount: input.currentAmount,
        target_date: input.targetDate,
        linked_account: input.linkedAccount ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return mapGoal(data);
  }
}

export async function deleteGoal(id: string): Promise<{ success: true }> {
  const uid = await getUserId();
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_id', uid);
  if (error) throw error;
  return { success: true };
}

// ─── agent insights ─────────────────────────────────────────────

export async function getAgentInsights(): Promise<AgentInsight[]> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('agent_insights')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapInsight);
}

export async function dismissInsight(id: string): Promise<{ success: true }> {
  const uid = await getUserId();
  const { error } = await supabase
    .from('agent_insights')
    .delete()
    .eq('id', id)
    .eq('user_id', uid);
  if (error) throw error;
  return { success: true };
}

// ─── agent actions ──────────────────────────────────────────────

export async function getAgentActions(): Promise<AgentAction[]> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('agent_actions')
    .select('*')
    .eq('user_id', uid)
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapAction);
}

export async function updateAgentActionStatus(
  id: string,
  status: AgentAction['status'],
): Promise<AgentAction | undefined> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('agent_actions')
    .update({ status })
    .eq('id', id)
    .eq('user_id', uid)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? mapAction(data) : undefined;
}

// ─── assets ─────────────────────────────────────────────────────

export async function getAssets(): Promise<Asset[]> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('user_id', uid);
  if (error) throw error;
  return (data ?? []).map(mapAsset);
}

export async function getAssetById(id: string): Promise<Asset | undefined> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .eq('id', id)
    .eq('user_id', uid)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAsset(data) : undefined;
}

// ─── notifications ──────────────────────────────────────────────

export async function getNotifications(): Promise<AppNotification[]> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapNotification);
}

export async function markNotificationRead(id: string): Promise<{ success: true }> {
  const uid = await getUserId();
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .eq('user_id', uid);
  if (error) throw error;
  return { success: true };
}

export async function markAllNotificationsRead(): Promise<{ success: true }> {
  const uid = await getUserId();
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', uid)
    .eq('read', false);
  if (error) throw error;
  return { success: true };
}

export async function clearAllNotifications(): Promise<{ success: true }> {
  const uid = await getUserId();
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', uid);
  if (error) throw error;
  return { success: true };
}

// ─── connected accounts ─────────────────────────────────────────

export async function getConnectedAccounts(): Promise<ConnectedAccount[]> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('user_id', uid);
  if (error) throw error;
  return (data ?? []).map(mapAccount);
}

export async function unlinkAccount(id: string): Promise<{ success: true }> {
  const uid = await getUserId();
  const { error } = await supabase
    .from('connected_accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', uid);
  if (error) throw error;
  return { success: true };
}

export async function linkAccount(
  input: Omit<ConnectedAccount, 'id' | 'syncStatus'>,
): Promise<ConnectedAccount> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('connected_accounts')
    .insert({
      user_id: uid,
      institution: input.institution,
      nickname: input.nickname,
      mask: input.mask,
      balance: input.balance,
    })
    .select()
    .single();
  if (error) throw error;
  return mapAccount(data);
}

// ─── chat ───────────────────────────────────────────────────────

import { chatCompletion, buildSystemPrompt, buildContextPrompt } from '../ai';

let msgCounter = 0;
let localMessages: ChatMessage[] = [
  { id: 'welcome', role: 'agent', text: "Hi, I'm your finance advisor. Ask me anything about your spending, budgets, or goals.", createdAt: new Date().toISOString() },
];

async function getChatUserId(): Promise<string | null> {
  try {
    return await getUserId();
  } catch {
    return null;
  }
}

const conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [];

function buildContextualResponse(query: string, transactions: Transaction[], budgets: Budget[], goals: Goal[]): string {
  const q = query.toLowerCase();

  if (q.includes('spending spike') || q.includes('why did my') || q.includes('spend')) {
    const spending = transactions
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);
    const sorted = Object.entries(spending).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const [topCat, topAmt] = sorted[0];
      const topMerchants = transactions
        .filter((t) => t.category === topCat && t.amount < 0)
        .slice(0, 3)
        .map((t) => t.merchant);
      return `Your ${topCat} spend is highest at ₹${topAmt.toLocaleString()}, driven mostly by ${topMerchants.join(', ')}. Consider reviewing this category if it feels higher than usual.`;
    }
    return `I don't see unusual spending patterns. Your ${budgets.length} budgets are mostly on track.`;
  }

  if (q.includes('retirement') || q.includes('save') || q.includes('on track')) {
    const totalAssets = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const goalNames = goals.map((g) => g.name).join(', ');
    const msg = goalNames ? `You're contributing toward: ${goalNames}. ` : '';
    return `${msg}Your total income tracked this period is ₹${totalAssets.toLocaleString()}. I'd recommend setting up a dedicated retirement account — you don't have one connected yet.`;
  }

  if (q.includes('summarize') || q.includes('summary') || q.includes('overview') || q.includes('last month')) {
    const totalSpent = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
    const totalIncome = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const topCats = [...new Set(transactions.filter((t) => t.amount < 0).map((t) => t.category))].slice(0, 3);
    return `Here's your summary: Income ₹${totalIncome.toLocaleString()}, Spending ₹${totalSpent.toLocaleString()} across ${transactions.length} transactions. Top categories: ${topCats.join(', ') || 'none yet'}.`;
  }

  if (q.includes('budget') || q.includes('overspend') || q.includes('over budget')) {
    const over = budgets.filter((b) => b.spent > b.limit);
    if (over.length > 0) {
      return `${over.length} budget${over.length > 1 ? 's' : ''} over limit: ${over.map((b) => `${b.category} (₹${b.spent.toLocaleString()}/${b.limit.toLocaleString()})`).join(', ')}.`;
    }
    return `All ${budgets.length} budgets are within their limits. Great job!`;
  }

  if (q.includes('goal') || q.includes('progress') || q.includes('target')) {
    if (goals.length === 0) return "You haven't set any goals yet. Go to the Plans tab to create one.";
    return goals.map((g) => `${g.name}: ${Math.round((g.currentAmount / g.targetAmount) * 100)}% funded (₹${g.currentAmount.toLocaleString()}/₹${g.targetAmount.toLocaleString()})`).join('. ');
  }

  if (q.includes('spend on') || q.includes('how much') || q.includes('category')) {
    const catMap = transactions
      .filter((t) => t.amount < 0)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);
    const lines = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: ₹${amt.toLocaleString()}`);
    return `Top spending categories:\n${lines.join('\n')}`;
  }

  return `I've noted your question about "${query}". Based on your recent data, your finances are broadly on track. Is there a specific category, budget, or goal you'd like to discuss?`;
}

async function generateAiReply(
  text: string,
  transactions: Transaction[],
  budgets: Budget[],
  goals: Goal[],
  accounts: { nickname: string; balance: number }[],
): Promise<string | null> {
  try {
    const contextPrompt = buildContextPrompt({
      transactions,
      budgets,
      goals,
      accounts,
      recentMessages: conversationHistory.slice(-4).map((m) => ({ role: m.role, text: m.content })),
    });

    const messages = [
      { role: 'system' as const, content: buildSystemPrompt() },
      { role: 'system' as const, content: `Here is the user's current financial data:\n${contextPrompt}` },
      ...conversationHistory.slice(-8),
      { role: 'user' as const, content: text },
    ];

    const reply = await chatCompletion(messages, { temperature: 0.7, max_tokens: 500 });

    conversationHistory.push({ role: 'user', content: text });
    conversationHistory.push({ role: 'assistant', content: reply });

    return reply;
  } catch {
    return null;
  }
}

export async function getChatMessages(): Promise<ChatMessage[]> {
  const uid = await getChatUserId();
  if (uid) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true });
    if (!error && data) {
      localMessages = data.map(mapChatMessage);
      return [...localMessages];
    }
  }
  return [...localMessages];
}

export async function sendChatMessage(text: string): Promise<ChatMessage[]> {
  const uid = await getChatUserId();
  const now = new Date().toISOString();

  msgCounter += 1;
  const c = msgCounter;

  const userMsg: ChatMessage = { id: `msg_${Date.now()}_${c}_u`, role: 'user', text, createdAt: now };
  localMessages = [...localMessages, userMsg];

  const transactions = await getCurrentUserTransactions();
  const budgets = await getCurrentUserBudgets();
  const goals = await getCurrentUserGoals();
  const accounts = await getConnectedAccounts().catch(() => []);

  const aiReply = await generateAiReply(text, transactions, budgets, goals, accounts);
  const replyText = aiReply ?? buildContextualResponse(text, transactions, budgets, goals);

  const agentMsg: ChatMessage = { id: `msg_${Date.now()}_${c}_a`, role: 'agent', text: replyText, createdAt: new Date().toISOString() };
  localMessages = [...localMessages, agentMsg];

  if (uid) {
    const { error: userErr } = await supabase.from('chat_messages').insert({
      user_id: uid, role: 'user', text, created_at: now,
    });
    if (!userErr) {
      await supabase.from('chat_messages').insert({
        user_id: uid, role: 'agent', text: replyText, created_at: agentMsg.createdAt,
      });
    }
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: true });
    if (!error && data) {
      localMessages = data.map(mapChatMessage);
    }
  }

  return [...localMessages];
}

async function getCurrentUserTransactions(): Promise<Transaction[]> {
  try {
    return await getTransactions();
  } catch {
    return [];
  }
}

async function getCurrentUserBudgets(): Promise<Budget[]> {
  try {
    return await getBudgets();
  } catch {
    return [];
  }
}

async function getCurrentUserGoals(): Promise<Goal[]> {
  try {
    return await getGoals();
  } catch {
    return [];
  }
}

// ─── profile ────────────────────────────────────────────────────

export async function getProfile(): Promise<UserProfile> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', uid)
    .single();
  if (error) throw error;
  return mapProfile(data);
}

export async function updateProfile(
  patch: Partial<UserProfile>,
): Promise<UserProfile> {
  const uid = await getUserId();
  const dbPatch: Record<string, any> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.email !== undefined) dbPatch.email = patch.email;
  if (patch.avatarInitials !== undefined) dbPatch.avatar_initials = patch.avatarInitials;

  const { data, error } = await supabase
    .from('profiles')
    .update(dbPatch)
    .eq('id', uid)
    .select()
    .single();
  if (error) throw error;
  return mapProfile(data);
}

// ─── agent preferences ──────────────────────────────────────────

export async function getAgentPreferences(): Promise<AgentPreferences> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('agent_preferences')
    .select('*')
    .eq('user_id', uid)
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    const { data: inserted, error: insertErr } = await supabase
      .from('agent_preferences')
      .insert({ user_id: uid })
      .select()
      .single();
    if (insertErr) throw insertErr;
    return mapPreferences(inserted);
  }
  return mapPreferences(data);
}

export async function updateAgentPreferences(
  patch: Partial<AgentPreferences>,
): Promise<AgentPreferences> {
  const uid = await getUserId();
  const dbPatch: Record<string, any> = {};
  if (patch.autonomyLevel !== undefined) dbPatch.autonomy_level = patch.autonomyLevel;
  if (patch.notifyOverspend !== undefined) dbPatch.notify_overspend = patch.notifyOverspend;
  if (patch.notifyBillDue !== undefined) dbPatch.notify_bill_due = patch.notifyBillDue;
  if (patch.notifyUnusualTransaction !== undefined)
    dbPatch.notify_unusual_transaction = patch.notifyUnusualTransaction;
  if (patch.notifyGoalMilestone !== undefined)
    dbPatch.notify_goal_milestone = patch.notifyGoalMilestone;
  if (patch.notifyWeeklyDigest !== undefined)
    dbPatch.notify_weekly_digest = patch.notifyWeeklyDigest;

  const { data, error } = await supabase
    .from('agent_preferences')
    .update(dbPatch)
    .eq('user_id', uid)
    .select()
    .single();
  if (error) throw error;
  return mapPreferences(data);
}

// ─── UPI accounts ────────────────────────────────────────────────

function mapUpiAccount(row: any): UpiAccount {
  return {
    id: row.id,
    upiId: row.upi_id,
    provider: row.provider,
    accountHolder: row.account_holder,
    bankName: row.bank_name,
    isPrimary: row.is_primary,
    linkedAt: row.linked_at,
    lastSyncedAt: row.last_synced_at,
  };
}

export async function getUpiAccounts(): Promise<UpiAccount[]> {
  const uid = await getUserId();
  const { data, error } = await supabase
    .from('upi_accounts')
    .select('*')
    .eq('user_id', uid);
  if (error) throw error;
  return (data ?? []).map(mapUpiAccount);
}

export async function linkUpiAccount(upiId: string, provider: UpiProvider): Promise<UpiAccount> {
  const uid = await getUserId();
  const verified = await verifyUpiId(upiId);
  const { data, error } = await supabase
    .from('upi_accounts')
    .insert({
      user_id: uid,
      upi_id: upiId,
      provider,
      account_holder: verified.accountHolder,
      bank_name: verified.bankName,
      is_primary: false,
      linked_at: new Date().toISOString(),
      last_synced_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return mapUpiAccount(data);
}

export async function unlinkUpiAccount(id: string): Promise<{ success: true }> {
  const uid = await getUserId();
  const { error } = await supabase
    .from('upi_accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', uid);
  if (error) throw error;
  return { success: true };
}

export async function setPrimaryUpiAccount(id: string): Promise<UpiAccount[]> {
  const uid = await getUserId();
  await supabase
    .from('upi_accounts')
    .update({ is_primary: false })
    .eq('user_id', uid)
    .neq('id', id);
  const { data, error } = await supabase
    .from('upi_accounts')
    .update({ is_primary: true })
    .eq('id', id)
    .eq('user_id', uid)
    .select();
  if (error) throw error;
  return (data ?? []).map(mapUpiAccount);
}

export async function getUpiProviders(): Promise<{ id: string; name: string }[]> {
  return [
    { id: 'googlepay', name: 'Google Pay' },
    { id: 'phonepe', name: 'PhonePe' },
    { id: 'paytm', name: 'Paytm' },
    { id: 'amazonpay', name: 'Amazon Pay' },
    { id: 'other', name: 'Other UPI App' },
  ];
}

export async function verifyUpiId(upiId: string): Promise<{ valid: boolean; accountHolder: string; bankName: string }> {
  const valid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId);
  return { valid, accountHolder: '', bankName: '' };
}

export async function syncUpiTransactions(): Promise<{ synced: number }> {
  return { synced: 0 };
}
