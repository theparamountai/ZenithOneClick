-- Create profiles table with comprehensive financial data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Personal Information
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  ssn_last_four TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Address Information
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  residence_type TEXT,
  years_at_address TEXT,
  
  -- Employment Information
  employment_status TEXT NOT NULL,
  employer_name TEXT,
  job_title TEXT,
  annual_income NUMERIC NOT NULL,
  employment_duration TEXT,
  
  -- Financial Information
  existing_checking BOOLEAN DEFAULT false,
  existing_savings BOOLEAN DEFAULT false,
  existing_credit_cards INTEGER DEFAULT 0,
  monthly_expenses NUMERIC,
  banking_goal TEXT,
  
  -- Application Tracking
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  application_data JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Product-specific fields
  credit_limit NUMERIC,
  account_number TEXT,
  loan_amount NUMERIC,
  loan_term TEXT,
  interest_rate NUMERIC
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for applications
CREATE POLICY "Users can view own applications"
  ON public.applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();