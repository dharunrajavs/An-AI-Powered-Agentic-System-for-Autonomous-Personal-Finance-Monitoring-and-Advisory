-- UPI Accounts table
CREATE TABLE IF NOT EXISTS upi_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  upi_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('googlepay', 'phonepe', 'paytm', 'amazonpay', 'other')),
  account_holder TEXT NOT NULL DEFAULT '',
  bank_name TEXT NOT NULL DEFAULT '',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, upi_id)
);

ALTER TABLE upi_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own UPI accounts"
  ON upi_accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add UPI ref columns to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS upi_ref_id TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS upi_payer_vpa TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS upi_payee_vpa TEXT;

-- Index for faster UPI transaction lookups
CREATE INDEX IF NOT EXISTS idx_upi_accounts_user_id ON upi_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_upi_accounts_upi_id ON upi_accounts(upi_id);
