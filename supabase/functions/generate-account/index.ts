import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate unique Zenith Bank account number (format: 30XXXXXXXX)
function generateAccountNumber(): string {
  const randomDigits = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `30${randomDigits}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullName, gender, address, ninNumber, accountType } = await req.json();
    
    // Validate required fields
    if (!fullName || !gender || !address || !ninNumber || !accountType) {
      throw new Error('All fields are required');
    }

    // Validate account type
    const validAccountTypes = ['savings', 'business', 'current'];
    if (!validAccountTypes.includes(accountType.toLowerCase())) {
      throw new Error('Invalid account type');
    }

    // Get user from auth header
    const authHeader = req.headers.get('authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract JWT token from authorization header
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      throw new Error('No authorization token provided');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('Creating bank account for user:', user.id);

    // Generate unique account number
    let accountNumber: string;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      accountNumber = generateAccountNumber();
      
      // Check if account number already exists
      const { data: existing } = await supabase
        .from('bank_accounts')
        .select('account_number')
        .eq('account_number', accountNumber)
        .single();
      
      if (!existing) {
        break; // Unique account number found
      }
      
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique account number');
    }

    // Create bank account
    const { data: account, error } = await supabase
      .from('bank_accounts')
      .insert({
        user_id: user.id,
        account_number: accountNumber!,
        account_type: accountType.toLowerCase(),
        account_name: fullName,
        full_name: fullName,
        gender: gender,
        address: address,
        nin_number: ninNumber,
        balance: 0.00,
        currency: '₦',
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error('Failed to create account');
    }

    console.log('Account created successfully:', account.account_number);

    return new Response(
      JSON.stringify({
        success: true,
        account: {
          accountNumber: account.account_number,
          accountType: account.account_type,
          accountName: account.account_name,
          balance: account.balance,
          currency: account.currency,
          status: account.status,
          createdAt: account.created_at,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-account:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
