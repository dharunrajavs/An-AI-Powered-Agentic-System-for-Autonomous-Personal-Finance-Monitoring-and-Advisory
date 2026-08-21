-- ============================================================
-- FinSense — Seed Data
-- Run AFTER 001_initial_schema.sql and AFTER creating a test
-- user via Supabase Auth (sign up in the app)
-- 
-- Replace 'YOUR_USER_UUID' with the actual user ID from
-- auth.users after signing up.
-- ============================================================

-- Transactions
insert into public.transactions (user_id, date, amount, category, merchant, account, payment_method, flagged, notes) values
('YOUR_USER_UUID', '2026-07-06', -6.75,   'Food & Drink',  'Starbucks',            'Chase Sapphire Credit Card', 'upi', false, null),
('YOUR_USER_UUID', '2026-07-06', -84.32,  'Groceries',     'Whole Foods Market',    'Chase Checking',             'upi', false, null),
('YOUR_USER_UUID', '2026-07-05', -18.40,  'Transport',     'Uber',                  'Chase Sapphire Credit Card', 'upi', false, null),
('YOUR_USER_UUID', '2026-07-05', -340.00, 'Shopping',      'Amazon',                'Chase Sapphire Credit Card', 'upi', true,  'Larger than usual — review if this was you.'),
('YOUR_USER_UUID', '2026-07-04', -15.99,  'Subscriptions', 'Netflix',               'Chase Checking',             'upi', false, null),
('YOUR_USER_UUID', '2026-07-04', -52.10,  'Food & Drink',  'Chipotle Mexican Grill','Chase Sapphire Credit Card', 'upi', false, null),
('YOUR_USER_UUID', '2026-07-03', -9.99,   'Subscriptions', 'Spotify',               'Chase Checking',             'upi', false, null),
('YOUR_USER_UUID', '2026-07-03', -64.21,  'Transport',     'Shell',                 'Chase Sapphire Credit Card', 'upi', false, null),
('YOUR_USER_UUID', '2026-07-02', -128.50, 'Shopping',      'Target',                'Chase Sapphire Credit Card', 'upi', false, null),
('YOUR_USER_UUID', '2026-07-02', -22.00,  'Entertainment', 'AMC Theatres',          'Chase Sapphire Credit Card', 'upi', false, null),
('YOUR_USER_UUID', '2026-07-01', -2400.00,'Rent',          'Parkview Rentals LLC',  'Chase Checking',             'upi', false, null),
('YOUR_USER_UUID', '2026-07-01', 4200.00, 'Income',        'Acme Corp Payroll',     'Chase Checking',             'upi', false, null),
('YOUR_USER_UUID', '2026-06-30', -76.43,  'Groceries',     'Trader Joe''s',          'Chase Checking',             'upi', false, null),
('YOUR_USER_UUID', '2026-06-29', -45.00,  'Fitness',       'Planet Fitness',        'Chase Checking',             'upi', false, null),
('YOUR_USER_UUID', '2026-06-28', -112.87, 'Personal Care', 'Sephora',               'Chase Sapphire Credit Card', 'upi', false, null),
('YOUR_USER_UUID', '2026-06-27', -38.60,  'Food & Drink',  'Chipotle Mexican Grill','Chase Sapphire Credit Card', 'upi', false, null),
('YOUR_USER_UUID', '2026-06-26', -410.22, 'Travel',        'Delta Air Lines',       'Chase Sapphire Credit Card', 'upi', false, null),
('YOUR_USER_UUID', '2026-06-25', -18.99,  'Health',        'CVS Pharmacy',          'Chase Checking',             'upi', false, null),
('YOUR_USER_UUID', '2026-06-24', -145.00, 'Utilities',     'Con Edison',            'Chase Checking',             'upi', false, null),
('YOUR_USER_UUID', '2026-06-23', -85.00,  'Utilities',     'Verizon Wireless',      'Chase Checking',             'upi', false, null),
('YOUR_USER_UUID', '2026-06-22', -63.14,  'Groceries',     'Whole Foods Market',    'Chase Checking',             'upi', false, null),
('YOUR_USER_UUID', '2026-06-21', -29.50,  'Food & Drink',  'Starbucks',             'Chase Sapphire Credit Card', 'upi', true,  'Four Starbucks charges this week — 2x your usual pace.'),
('YOUR_USER_UUID', '2026-06-20', -220.00, 'Shopping',      'Amazon',                'Chase Sapphire Credit Card', 'upi', false, null),
('YOUR_USER_UUID', '2026-06-19', -14.40,  'Transport',     'Uber',                  'Chase Sapphire Credit Card', 'upi', false, null),
('YOUR_USER_UUID', '2026-06-18', -98.00,  'Entertainment', 'Airbnb',                'Chase Sapphire Credit Card', 'upi', false, null),
('YOUR_USER_UUID', '2026-06-17', -12.99,  'Subscriptions', 'Apple',                 'Chase Checking',             'upi', false, null),
('YOUR_USER_UUID', '2026-06-16', -210.34, 'Groceries',     'Costco Wholesale',      'Chase Checking',             'upi', false, null),
('YOUR_USER_UUID', '2026-06-15', -55.00,  'Food & Drink',  'Chipotle Mexican Grill','Chase Sapphire Credit Card', 'upi', false, null),
('YOUR_USER_UUID', '2026-06-14', -6.75,   'Food & Drink',  'Starbucks',             'Chase Sapphire Credit Card', 'upi', false, null),
('YOUR_USER_UUID', '2026-06-01', -2400.00,'Rent',          'Parkview Rentals LLC',  'Chase Checking',             'upi', false, null),
('YOUR_USER_UUID', '2026-06-01', 4200.00, 'Income',        'Acme Corp Payroll',     'Chase Checking',             'upi', false, null);

-- Cash transactions
insert into public.transactions (user_id, date, time, amount, category, merchant, account, payment_method, notes) values
('YOUR_USER_UUID', '2026-07-06', '13:20', -180.00, 'Food',     'Street food', 'Cash', 'cash', 'Lunch with colleagues'),
('YOUR_USER_UUID', '2026-07-04', '09:05', -60.00,  'Transport', 'Auto rickshaw', 'Cash', 'cash', null),
('YOUR_USER_UUID', '2026-06-29', '18:45', -450.00, 'Shopping', 'Local market', 'Cash', 'cash', null),
('YOUR_USER_UUID', '2026-06-24', '11:00', -220.00, 'Healthcare', 'Pharmacy', 'Cash', 'cash', null);

-- Budgets
insert into public.budgets (user_id, category, limit, spent, period) values
('YOUR_USER_UUID', 'Food & Drink',    500,  412.75, 'monthly'),
('YOUR_USER_UUID', 'Groceries',       450,  380.10, 'monthly'),
('YOUR_USER_UUID', 'Transport',       200,  145.20, 'monthly'),
('YOUR_USER_UUID', 'Subscriptions',    60,   58.97, 'monthly'),
('YOUR_USER_UUID', 'Shopping',        300,  340.50, 'monthly'),
('YOUR_USER_UUID', 'Entertainment',   150,   90.00, 'monthly'),
('YOUR_USER_UUID', 'Utilities',       250,  230.00, 'monthly'),
('YOUR_USER_UUID', 'Fitness',          60,   45.00, 'monthly');

-- Goals
insert into public.goals (user_id, name, target_amount, current_amount, target_date, linked_account) values
('YOUR_USER_UUID', 'Emergency Fund',         10000, 6200, '2026-12-31', 'Ally Savings'),
('YOUR_USER_UUID', 'Hawaii Trip',            4000, 1200, '2026-11-01', 'Ally Savings'),
('YOUR_USER_UUID', 'New Car Down Payment',   8000, 7800, '2026-08-01', 'Chase Checking'),
('YOUR_USER_UUID', 'Home Down Payment',     50000, 12000,'2029-01-01', 'Ally Savings');

-- Connected accounts
insert into public.connected_accounts (user_id, institution, nickname, mask, balance) values
('YOUR_USER_UUID', 'Chase',    'Chase Checking',          '4821', 3240.55),
('YOUR_USER_UUID', 'Chase',    'Chase Sapphire Credit Card', '7710', -1284.32),
('YOUR_USER_UUID', 'Ally Bank', 'Ally Savings',           '0093', 27300.00);

-- Agent insights
insert into public.agent_insights (user_id, type, message, severity, related_entity) values
('YOUR_USER_UUID', 'alert',      'Your dining spend is 34% above last month''s average — consider reducing restaurant visits this week.', 'medium', 'Food & Drink'),
('YOUR_USER_UUID', 'alert',      'Unusual $340 Amazon charge detected on your Chase Sapphire card — much larger than your typical purchase.', 'high',   'txn_004'),
('YOUR_USER_UUID', 'suggestion', 'Increase your Hawaii Trip contribution by $50/mo to hit your target 2 months early.',              'low',    'goal_002'),
('YOUR_USER_UUID', 'summary',    'Weekly digest: you spent $1,842 across 18 transactions, 6% less than last week.',                   'low',    null),
('YOUR_USER_UUID', 'alert',      'Shopping budget is 13% over its $300 monthly limit — mostly driven by two Amazon orders.',          'medium', 'bud_005'),
('YOUR_USER_UUID', 'suggestion', 'You''re on track to hit your New Car Down Payment goal in 3 weeks — want to set up the transfer now?', 'low', 'goal_003');

-- Agent actions
insert into public.agent_actions (user_id, description, timestamp, status) values
('YOUR_USER_UUID', 'Flagged unusual $340 charge at Amazon for review',                        '2026-07-05T09:05:00Z', 'proposed'),
('YOUR_USER_UUID', 'Flagged 4th Starbucks charge this week as a spending-pace outlier',       '2026-06-21T18:30:00Z', 'proposed'),
('YOUR_USER_UUID', 'Sent overspend alert for Shopping category',                              '2026-06-29T16:40:00Z', 'executed'),
('YOUR_USER_UUID', 'Auto-categorized 6 new transactions from Chase Sapphire Credit Card',     '2026-06-28T07:00:00Z', 'executed'),
('YOUR_USER_UUID', 'Suggested increasing Hawaii Trip contribution by $50/mo',                 '2026-07-04T11:00:00Z', 'proposed'),
('YOUR_USER_UUID', 'Muted duplicate bill-due reminder for Verizon Wireless',                  '2026-06-23T09:00:00Z', 'undone'),
('YOUR_USER_UUID', 'Generated weekly spending digest',                                        '2026-07-01T08:00:00Z', 'executed'),
('YOUR_USER_UUID', 'Rebalanced budget rollover from Entertainment to Groceries',              '2026-06-18T12:00:00Z', 'executed');

-- Notifications
insert into public.notifications (user_id, type, title, message, created_at, read) values
('YOUR_USER_UUID', 'unusual_transaction', 'Unusual charge detected',  'A $340 charge at Amazon is much larger than your typical purchase.',    '2026-07-05T09:05:00Z', false),
('YOUR_USER_UUID', 'overspend',           'Shopping budget exceeded', "You've spent $340.50 of your $300 Shopping budget this month.",        '2026-06-29T16:40:00Z', false),
('YOUR_USER_UUID', 'bill_due',            'Rent due in 3 days',       'Your $2,400 rent payment to Parkview Rentals LLC is due Jul 1.',        '2026-06-28T08:00:00Z', false),
('YOUR_USER_UUID', 'goal_milestone',      'Almost there!',            'New Car Down Payment is 97.5% funded — just $200 to go.',              '2026-06-27T10:15:00Z', true),
('YOUR_USER_UUID', 'weekly_digest',       'Your weekly digest is ready', 'You spent $1,842 across 18 transactions, 6% less than last week.', '2026-07-01T08:00:00Z', true);

-- Assets
insert into public.assets (user_id, name, type, value, return_pct) values
('YOUR_USER_UUID', 'Apple Inc. (AAPL)',             'stock',  8420.50,  12.4),
('YOUR_USER_UUID', 'Vanguard S&P 500 ETF (VOO)',    'stock',  15230.00, 9.1),
('YOUR_USER_UUID', 'US Treasury Bond 10Y',          'bond',   5000.00,  3.2),
('YOUR_USER_UUID', 'Ally Savings (Cash)',           'cash',   6200.00,  4.1),
('YOUR_USER_UUID', 'Bitcoin (BTC)',                 'crypto', 3120.75,  -6.8),
('YOUR_USER_UUID', 'Ethereum (ETH)',                'crypto', 1840.20,  4.5);
