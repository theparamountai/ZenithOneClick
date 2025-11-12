-- Create bank_cards table for storing user debit cards
CREATE TABLE public.bank_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  card_number TEXT NOT NULL UNIQUE,
  card_type TEXT NOT NULL CHECK (card_type IN ('mastercard', 'visa', 'verve')),
  currency TEXT NOT NULL CHECK (currency IN ('naira', 'dollar')),
  category TEXT NOT NULL CHECK (category IN ('savings', 'current')),
  cvv TEXT NOT NULL,
  expiry_date TEXT NOT NULL,
  card_holder_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  is_physical BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bank_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own cards"
  ON public.bank_cards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cards"
  ON public.bank_cards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
  ON public.bank_cards
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_bank_cards_user_id ON public.bank_cards(user_id);
CREATE INDEX idx_bank_cards_account_id ON public.bank_cards(account_id);