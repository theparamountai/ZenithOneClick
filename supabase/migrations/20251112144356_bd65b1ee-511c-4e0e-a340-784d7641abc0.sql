-- Add bank_provider column to bank_accounts table
ALTER TABLE public.bank_accounts 
ADD COLUMN bank_provider text DEFAULT 'zenith' NOT NULL,
ADD COLUMN external_reference text,
ADD COLUMN last_synced timestamp with time zone;

-- Create external_bank_credentials table
CREATE TABLE public.external_bank_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_provider text NOT NULL,
  merchant_id text NOT NULL,
  public_key text NOT NULL,
  secret_key text NOT NULL,
  account_reference text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  last_synced timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on external_bank_credentials
ALTER TABLE public.external_bank_credentials ENABLE ROW LEVEL SECURITY;

-- RLS policies for external_bank_credentials
CREATE POLICY "Users can view own credentials"
ON public.external_bank_credentials
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credentials"
ON public.external_bank_credentials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials"
ON public.external_bank_credentials
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for updated_at on external_bank_credentials
CREATE TRIGGER update_external_bank_credentials_updated_at
BEFORE UPDATE ON public.external_bank_credentials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
