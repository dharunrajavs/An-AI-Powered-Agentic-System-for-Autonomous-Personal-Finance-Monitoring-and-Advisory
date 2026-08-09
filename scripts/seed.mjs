// FinSense — Database Seed Script
// ================================
// Run: node scripts/seed.mjs
//
// Before running:
// 1. Go to https://supabase.com/dashboard/project/cbxxngwpiimyjurwtdhg/sql/new
// 2. Copy & paste the contents of supabase/migrations/001_initial_schema.sql
//    and supabase/migrations/002_upi_accounts.sql (both files, one after the other)
// 3. Click "Run" to create the tables
// 4. Go to Authentication → Settings → set "Confirm email" to OFF (dev only)
// 5. Then run this script

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cbxxngwpiimyjurwtdhg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_pDssi1XFEcsBw2EYelTenA_EAVuNMX1';

const TEST_EMAIL = 'test@finsense.app';
const TEST_PASSWORD = 'Test123!';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function seed() {
  console.log('=== FinSense Database Seed ===\n');

  // 1. Sign up / sign in
  let user;
  let session;

  console.log(`Attempting to sign in as ${TEST_EMAIL}...`);
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (signInData?.user) {
    user = signInData.user;
    session = signInData.session;
    console.log(`Signed in as ${user.email} (${user.id})\n`);
  } else {
    console.log('Sign in failed, trying sign up...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: { data: { name: 'Test User' } },
    });

    if (signUpError) {
      console.error('Sign up failed:', signUpError.message);
      console.log('\nTip: Go to Supabase Dashboard → Authentication → Settings');
      console.log('and set "Confirm email" to OFF for development.');
      process.exit(1);
    }

    user = signUpData.user;
    session = signUpData.session;

    if (!user) {
      console.error('No user returned — email confirmation may be required.');
      console.log('\nGo to https://supabase.com/dashboard/project/cbxxngwpiimyjurwtdhg/auth/users');
      console.log('to confirm the user manually, OR disable email confirmation in Authentication → Settings.');
      process.exit(1);
    }

    if (!session) {
      console.log('User created but email confirmation is required.');
      console.log('\nGo to Supabase Dashboard → Authentication → Settings → set "Confirm email" to OFF');
      console.log('Then run this script again OR manually confirm the user in Dashboard.');
      console.log(`User ID: ${user.id}`);
      process.exit(0);
    }

    console.log(`Signed up as ${user.email} (${user.id})`);
  }

  const userId = user.id;

  // 2. Verify tables exist
  console.log('\nChecking if tables exist...');
  const { error: tableCheck } = await supabase.from('transactions').select('id').limit(1);
  if (tableCheck && tableCheck.code === '42P01') {
    console.error('Tables do not exist! Run the migration SQL files in Supabase Dashboard first:');
    console.error('  https://supabase.com/dashboard/project/cbxxngwpiimyjurwtdhg/sql/new');
    console.error('  Files: supabase/migrations/001_initial_schema.sql');
    console.error('         supabase/migrations/002_upi_accounts.sql');
    process.exit(1);
  }
  console.log('Tables exist ✓\n');

  // 3. Seed data
  console.log('Seeding data...');

  const { error: profileUpsert } = await supabase.from('profiles').upsert({
    id: userId,
    name: 'Test User',
    email: TEST_EMAIL,
    avatar_initials: 'TU',
  }, { onConflict: 'id' });
  if (profileUpsert) console.error('  profile error:', profileUpsert.message);
  else console.log('  profile ✓');

  const { error: prefUpsert } = await supabase.from('agent_preferences').upsert({
    user_id: userId,
    autonomy_level: 3,
    notify_overspend: true,
    notify_bill_due: true,
    notify_unusual_transaction: true,
    notify_goal_milestone: true,
    notify_weekly_digest: false,
  }, { onConflict: 'user_id' });
  if (prefUpsert) console.error('  agent_preferences error:', prefUpsert.message);
  else console.log('  agent_preferences ✓');

  const { error: accountsErr } = await supabase.from('connected_accounts').insert([
    { user_id: userId, institution: 'Chase', nickname: 'Chase Checking', mask: '4821', balance: 3240.55 },
    { user_id: userId, institution: 'Chase', nickname: 'Chase Sapphire Credit Card', mask: '7710', balance: -1284.32 },
    { user_id: userId, institution: 'Ally Bank', nickname: 'Ally Savings', mask: '0093', balance: 27300.00 },
  ]);
  if (accountsErr) console.error('  connected_accounts error:', accountsErr.message);
  else console.log('  connected_accounts ✓');

  const { error: budgetsErr } = await supabase.from('budgets').insert([
    { user_id: userId, category: 'Food & Drink', limit: 500, spent: 412.75, period: 'monthly' },
    { user_id: userId, category: 'Groceries', limit: 450, spent: 380.10, period: 'monthly' },
    { user_id: userId, category: 'Transport', limit: 200, spent: 145.20, period: 'monthly' },
    { user_id: userId, category: 'Subscriptions', limit: 60, spent: 58.97, period: 'monthly' },
    { user_id: userId, category: 'Shopping', limit: 300, spent: 340.50, period: 'monthly' },
    { user_id: userId, category: 'Entertainment', limit: 150, spent: 90.00, period: 'monthly' },
    { user_id: userId, category: 'Utilities', limit: 250, spent: 230.00, period: 'monthly' },
    { user_id: userId, category: 'Fitness', limit: 60, spent: 45.00, period: 'monthly' },
  ]);
  if (budgetsErr) console.error('  budgets error:', budgetsErr.message);
  else console.log('  budgets ✓');

  const { error: goalsErr } = await supabase.from('goals').insert([
    { user_id: userId, name: 'Emergency Fund', target_amount: 10000, current_amount: 6200, target_date: '2026-12-31', linked_account: 'Ally Savings' },
    { user_id: userId, name: 'Hawaii Trip', target_amount: 4000, current_amount: 1200, target_date: '2026-11-01', linked_account: 'Ally Savings' },
    { user_id: userId, name: 'New Car Down Payment', target_amount: 8000, current_amount: 7800, target_date: '2026-08-01', linked_account: 'Chase Checking' },
    { user_id: userId, name: 'Home Down Payment', target_amount: 50000, current_amount: 12000, target_date: '2029-01-01', linked_account: 'Ally Savings' },
  ]);
  if (goalsErr) console.error('  goals error:', goalsErr.message);
  else console.log('  goals ✓');

  const { error: txnErr } = await supabase.from('transactions').insert([
    { user_id: userId, date: '2026-07-06', amount: -6.75, category: 'Food & Drink', merchant: 'Starbucks', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-07-06', amount: -84.32, category: 'Groceries', merchant: 'Whole Foods Market', account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-07-05', amount: -18.40, category: 'Transport', merchant: 'Uber', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-07-05', amount: -340.00, category: 'Shopping', merchant: 'Amazon', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: true, notes: 'Larger than usual — review if this was you.' },
    { user_id: userId, date: '2026-07-04', amount: -15.99, category: 'Subscriptions', merchant: 'Netflix', account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-07-04', amount: -52.10, category: 'Food & Drink', merchant: 'Chipotle Mexican Grill', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-07-03', amount: -9.99, category: 'Subscriptions', merchant: 'Spotify', account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-07-03', amount: -64.21, category: 'Transport', merchant: 'Shell', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-07-02', amount: -128.50, category: 'Shopping', merchant: 'Target', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-07-02', amount: -22.00, category: 'Entertainment', merchant: 'AMC Theatres', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-07-01', amount: -2400.00, category: 'Rent', merchant: 'Parkview Rentals LLC', account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-07-01', amount: 4200.00, category: 'Income', merchant: 'Acme Corp Payroll', account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-30', amount: -76.43, category: 'Groceries', merchant: "Trader Joe's", account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-29', amount: -45.00, category: 'Fitness', merchant: 'Planet Fitness', account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-28', amount: -112.87, category: 'Personal Care', merchant: 'Sephora', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-27', amount: -38.60, category: 'Food & Drink', merchant: 'Chipotle Mexican Grill', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-26', amount: -410.22, category: 'Travel', merchant: 'Delta Air Lines', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-25', amount: -18.99, category: 'Health', merchant: 'CVS Pharmacy', account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-24', amount: -145.00, category: 'Utilities', merchant: 'Con Edison', account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-23', amount: -85.00, category: 'Utilities', merchant: 'Verizon Wireless', account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-22', amount: -63.14, category: 'Groceries', merchant: 'Whole Foods Market', account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-21', amount: -29.50, category: 'Food & Drink', merchant: 'Starbucks', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: true, notes: 'Four Starbucks charges this week — 2x your usual pace.' },
    { user_id: userId, date: '2026-06-20', amount: -220.00, category: 'Shopping', merchant: 'Amazon', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-19', amount: -14.40, category: 'Transport', merchant: 'Uber', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-18', amount: -98.00, category: 'Entertainment', merchant: 'Airbnb', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-17', amount: -12.99, category: 'Subscriptions', merchant: 'Apple', account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-16', amount: -210.34, category: 'Groceries', merchant: 'Costco Wholesale', account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-15', amount: -55.00, category: 'Food & Drink', merchant: 'Chipotle Mexican Grill', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-14', amount: -6.75, category: 'Food & Drink', merchant: 'Starbucks', account: 'Chase Sapphire Credit Card', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-01', amount: -2400.00, category: 'Rent', merchant: 'Parkview Rentals LLC', account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-06-01', amount: 4200.00, category: 'Income', merchant: 'Acme Corp Payroll', account: 'Chase Checking', payment_method: 'upi', flagged: false },
    { user_id: userId, date: '2026-07-06', time: '13:20', amount: -180.00, category: 'Food', merchant: 'Street food', account: 'Cash', payment_method: 'cash', notes: 'Lunch with colleagues', flagged: false },
    { user_id: userId, date: '2026-07-04', time: '09:05', amount: -60.00, category: 'Transport', merchant: 'Auto rickshaw', account: 'Cash', payment_method: 'cash', flagged: false },
    { user_id: userId, date: '2026-06-29', time: '18:45', amount: -450.00, category: 'Shopping', merchant: 'Local market', account: 'Cash', payment_method: 'cash', flagged: false },
    { user_id: userId, date: '2026-06-24', time: '11:00', amount: -220.00, category: 'Healthcare', merchant: 'Pharmacy', account: 'Cash', payment_method: 'cash', flagged: false },
  ]);
  if (txnErr) console.error('  transactions error:', txnErr.message);
  else console.log('  transactions ✓');

  const { error: insightsErr } = await supabase.from('agent_insights').insert([
    { user_id: userId, type: 'alert', message: "Your dining spend is 34% above last month's average — consider reducing restaurant visits this week.", severity: 'medium', related_entity: 'Food & Drink' },
    { user_id: userId, type: 'alert', message: 'Unusual $340 Amazon charge detected on your Chase Sapphire card — much larger than your typical purchase.', severity: 'high', related_entity: 'txn_004' },
    { user_id: userId, type: 'suggestion', message: 'Increase your Hawaii Trip contribution by $50/mo to hit your target 2 months early.', severity: 'low', related_entity: 'goal_002' },
    { user_id: userId, type: 'summary', message: 'Weekly digest: you spent $1,842 across 18 transactions, 6% less than last week.', severity: 'low' },
    { user_id: userId, type: 'alert', message: "Shopping budget is 13% over its $300 monthly limit — mostly driven by two Amazon orders.", severity: 'medium', related_entity: 'bud_005' },
    { user_id: userId, type: 'suggestion', message: "You're on track to hit your New Car Down Payment goal in 3 weeks — want to set up the transfer now?", severity: 'low', related_entity: 'goal_003' },
  ]);
  if (insightsErr) console.error('  agent_insights error:', insightsErr.message);
  else console.log('  agent_insights ✓');

  const { error: actionsErr } = await supabase.from('agent_actions').insert([
    { user_id: userId, description: 'Flagged unusual $340 charge at Amazon for review', timestamp: '2026-07-05T09:05:00Z', status: 'proposed' },
    { user_id: userId, description: 'Flagged 4th Starbucks charge this week as a spending-pace outlier', timestamp: '2026-06-21T18:30:00Z', status: 'proposed' },
    { user_id: userId, description: 'Sent overspend alert for Shopping category', timestamp: '2026-06-29T16:40:00Z', status: 'executed' },
    { user_id: userId, description: 'Auto-categorized 6 new transactions from Chase Sapphire Credit Card', timestamp: '2026-06-28T07:00:00Z', status: 'executed' },
    { user_id: userId, description: 'Suggested increasing Hawaii Trip contribution by $50/mo', timestamp: '2026-07-04T11:00:00Z', status: 'proposed' },
    { user_id: userId, description: 'Muted duplicate bill-due reminder for Verizon Wireless', timestamp: '2026-06-23T09:00:00Z', status: 'undone' },
    { user_id: userId, description: 'Generated weekly spending digest', timestamp: '2026-07-01T08:00:00Z', status: 'executed' },
    { user_id: userId, description: 'Rebalanced budget rollover from Entertainment to Groceries', timestamp: '2026-06-18T12:00:00Z', status: 'executed' },
  ]);
  if (actionsErr) console.error('  agent_actions error:', actionsErr.message);
  else console.log('  agent_actions ✓');

  const { error: notifErr } = await supabase.from('notifications').insert([
    { user_id: userId, type: 'unusual_transaction', title: 'Unusual charge detected', message: 'A $340 charge at Amazon is much larger than your typical purchase.', created_at: '2026-07-05T09:05:00Z', read: false },
    { user_id: userId, type: 'overspend', title: 'Shopping budget exceeded', message: "You've spent $340.50 of your $300 Shopping budget this month.", created_at: '2026-06-29T16:40:00Z', read: false },
    { user_id: userId, type: 'bill_due', title: 'Rent due in 3 days', message: 'Your $2,400 rent payment to Parkview Rentals LLC is due Jul 1.', created_at: '2026-06-28T08:00:00Z', read: false },
    { user_id: userId, type: 'goal_milestone', title: 'Almost there!', message: 'New Car Down Payment is 97.5% funded — just $200 to go.', created_at: '2026-06-27T10:15:00Z', read: true },
    { user_id: userId, type: 'weekly_digest', title: 'Your weekly digest is ready', message: 'You spent $1,842 across 18 transactions, 6% less than last week.', created_at: '2026-07-01T08:00:00Z', read: true },
  ]);
  if (notifErr) console.error('  notifications error:', notifErr.message);
  else console.log('  notifications ✓');

  const { error: assetsErr } = await supabase.from('assets').insert([
    { user_id: userId, name: 'Apple Inc. (AAPL)', type: 'stock', value: 8420.50, return_pct: 12.4 },
    { user_id: userId, name: 'Vanguard S&P 500 ETF (VOO)', type: 'stock', value: 15230.00, return_pct: 9.1 },
    { user_id: userId, name: 'US Treasury Bond 10Y', type: 'bond', value: 5000.00, return_pct: 3.2 },
    { user_id: userId, name: 'Ally Savings (Cash)', type: 'cash', value: 6200.00, return_pct: 4.1 },
    { user_id: userId, name: 'Bitcoin (BTC)', type: 'crypto', value: 3120.75, return_pct: -6.8 },
    { user_id: userId, name: 'Ethereum (ETH)', type: 'crypto', value: 1840.20, return_pct: 4.5 },
  ]);
  if (assetsErr) console.error('  assets error:', assetsErr.message);
  else console.log('  assets ✓');

  console.log('\n=== Seed complete! ===');
  console.log(`Test user: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
  console.log(`User ID: ${userId}`);
}

seed().catch(console.error);
