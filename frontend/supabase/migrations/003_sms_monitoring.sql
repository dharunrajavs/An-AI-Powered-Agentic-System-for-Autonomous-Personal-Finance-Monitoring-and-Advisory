-- ============================================================
-- FinSense — SMS Monitoring support
-- Extends the existing transactions table for automatically
-- detected bank/UPI SMS transactions.
-- ============================================================

-- Extend payment_method to cover SMS-detected methods.
ALTER TABLE public.transactions
  DROP CONSTRAINT IF EXISTS transactions_payment_method_check;
ALTER TABLE public.transactions
  ADD CONSTRAINT transactions_payment_method_check
  CHECK (payment_method IN ('upi','cash','card','atm','netbanking','bank','unknown'));

-- Structured, non-sensitive fields extracted from financial SMS.
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS reference_id TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS account_last4 TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual'
  CHECK (source IN ('manual','sms','mock'));
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS message_hash TEXT;

-- Duplicate prevention: the same SMS must never create two transactions.
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_message_hash
  ON public.transactions(user_id, message_hash)
  WHERE message_hash IS NOT NULL;

-- Faster lookup by reference id for dedup/support.
CREATE INDEX IF NOT EXISTS idx_transactions_reference_id
  ON public.transactions(user_id, reference_id)
  WHERE reference_id IS NOT NULL;