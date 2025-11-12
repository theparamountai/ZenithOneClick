-- Create bank_accounts table
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_number TEXT UNIQUE NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('savings', 'business', 'current')),
  account_name TEXT NOT NULL,
  balance NUMERIC DEFAULT 0.00,
  currency TEXT DEFAULT '₦',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT now(),
  nin_number TEXT,
  full_name TEXT,
  gender TEXT,
  address TEXT
);

-- Create conversation_history table
CREATE TABLE public.conversation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  messages JSONB NOT NULL,
  intent TEXT,
  extracted_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bank_accounts
CREATE POLICY "Users can view own bank accounts"
  ON public.bank_accounts
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank accounts"
  ON public.bank_accounts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank accounts"
  ON public.bank_accounts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for conversation_history
CREATE POLICY "Users can view own conversations"
  ON public.conversation_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.conversation_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON public.conversation_history
  FOR UPDATE
  USING (auth.uid() = user_id);