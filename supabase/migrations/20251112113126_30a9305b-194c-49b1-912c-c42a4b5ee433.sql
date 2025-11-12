-- Create transactions table for transaction history
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT NOT NULL,
  balance_after NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for transactions
CREATE POLICY "Users can view own transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
ON public.transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create loans table for loan applications
CREATE TABLE public.loans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.bank_accounts(id) ON DELETE CASCADE,
  loan_amount NUMERIC NOT NULL,
  loan_purpose TEXT NOT NULL,
  loan_term_months INTEGER NOT NULL,
  interest_rate NUMERIC NOT NULL,
  monthly_payment NUMERIC NOT NULL,
  total_repayment NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  ai_analysis JSONB,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  decision_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on loans
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- RLS policies for loans
CREATE POLICY "Users can view own loans"
ON public.loans
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loans"
ON public.loans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loans"
ON public.loans
FOR UPDATE
USING (auth.uid() = user_id);