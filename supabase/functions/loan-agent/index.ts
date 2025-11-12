import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { accountNumber, loanAmount, loanPurpose, loanTermMonths } = await req.json();
    
    console.log('Loan agent request:', { accountNumber, loanAmount, loanPurpose, loanTermMonths });

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    // Create client with service role key for backend operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the JWT and get user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    // Fetch bank account details using admin client
    const { data: account, error: accountError } = await supabaseAdmin
      .from('bank_accounts')
      .select('*')
      .eq('account_number', accountNumber)
      .eq('user_id', user.id)
      .single();

    if (accountError || !account) {
      console.error('Account fetch error:', accountError);
      throw new Error('Account not found');
    }

    console.log('Account details:', account);

    // Fetch transaction history using admin client
    const { data: transactions, error: transactionsError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .eq('account_id', account.id)
      .order('created_at', { ascending: false });

    if (transactionsError) {
      console.error('Transactions fetch error:', transactionsError);
    }

    console.log('Transactions count:', transactions?.length || 0);

    // Calculate financial metrics
    const currentBalance = Number(account.balance) || 0;
    const accountAgeMonths = Math.floor(
      (new Date().getTime() - new Date(account.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    const deposits = transactions?.filter(t => t.transaction_type === 'deposit') || [];
    const withdrawals = transactions?.filter(t => ['withdrawal', 'transfer'].includes(t.transaction_type)) || [];
    
    const totalDeposits = deposits.reduce((sum, t) => sum + Number(t.amount), 0);
    const totalWithdrawals = withdrawals.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const averageMonthlyIncome = deposits.length > 0 ? totalDeposits / Math.max(accountAgeMonths, 1) : 0;
    const averageMonthlyExpenses = withdrawals.length > 0 ? totalWithdrawals / Math.max(accountAgeMonths, 1) : 0;

    // Determine maximum loan amount based on account age and balance rules
    let maxLoanAmount = 0;
    if (accountAgeMonths < 3) {
      // Young account rules
      if (averageMonthlyIncome < 100000) {
        maxLoanAmount = 50000; // Restricted for low-income young accounts
      } else {
        maxLoanAmount = Math.min(currentBalance * 0.8, 200000); // Up to 80% of balance, max ₦200K
      }
    } else if (accountAgeMonths < 6) {
      // Moderately aged account (3-6 months)
      maxLoanAmount = Math.min(currentBalance * 1.2, 500000); // Up to 120% of balance, max ₦500K
    } else {
      // Mature account (6+ months)
      maxLoanAmount = Math.min(currentBalance * 2, 5000000); // Up to 200% of balance, max ₦5M
    }

    // Prepare context for AI
    const financialContext = `
You are a loan assessment AI for Zenith Bank. Analyze the following financial data and determine loan eligibility.

ACCOUNT DETAILS:
- Account Number: ${accountNumber}
- Account Type: ${account.account_type}
- Current Balance: ₦${currentBalance.toLocaleString()}
- Account Age: ${accountAgeMonths} months
- Account Status: ${account.status}

TRANSACTION ANALYSIS:
- Total Transactions: ${transactions?.length || 0}
- Total Deposits: ₦${totalDeposits.toLocaleString()}
- Total Withdrawals: ₦${totalWithdrawals.toLocaleString()}
- Average Monthly Income: ₦${averageMonthlyIncome.toLocaleString()}
- Average Monthly Expenses: ₦${averageMonthlyExpenses.toLocaleString()}
- Net Monthly Cash Flow: ₦${(averageMonthlyIncome - averageMonthlyExpenses).toLocaleString()}

LOAN REQUEST:
- Requested Amount: ₦${Number(loanAmount).toLocaleString()}
- Purpose: ${loanPurpose}
- Requested Term: ${loanTermMonths} months

LENDING RULES (STRICTLY ENFORCE):
1. Account Age < 3 months:
   - If Average Monthly Income < ₦100,000: Maximum loan = ₦50,000
   - If Average Monthly Income ≥ ₦100,000: Maximum loan = min(Balance × 0.8, ₦200,000)
2. Account Age 3-6 months:
   - Maximum loan = min(Balance × 1.2, ₦500,000)
3. Account Age > 6 months:
   - Maximum loan = min(Balance × 2, ₦5,000,000)
4. Debt Service Coverage: Net monthly cash flow must cover at least 1.5× the monthly payment
5. Transaction History: At least 5 transactions showing regular activity
6. Balance Stability: Account must maintain positive balance consistently

MAXIMUM APPROVABLE AMOUNT: ₦${maxLoanAmount.toLocaleString()} (based on the rules above)

Based on this analysis, provide a JSON response with:
{
  "eligible": boolean,
  "max_loan_amount": number (maximum recommended loan amount in Naira),
  "suggested_interest_rate": number (annual percentage rate, typically 12-24% based on risk),
  "monthly_payment": number (calculated based on approved amount and term),
  "reasoning": string (detailed explanation of decision),
  "risk_factors": array of strings (any concerns),
  "approval_confidence": number (percentage 0-100),
  "recommendations": array of strings (advice for borrower)
}

Calculate the monthly payment using standard loan formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
Where: P = monthly payment, L = loan amount, c = monthly interest rate, n = number of months
`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling Lovable AI for loan analysis...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a professional loan assessment AI. Analyze financial data and provide structured loan eligibility decisions in JSON format only.'
          },
          {
            role: 'user',
            content: financialContext
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    const aiContent = aiData.choices[0].message.content;
    
    // Extract JSON from response (handle markdown code blocks)
    let analysisResult;
    try {
      const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || aiContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : aiContent;
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiContent);
      throw new Error('Failed to parse AI analysis');
    }

    console.log('Loan analysis complete:', analysisResult);

    return new Response(
      JSON.stringify({
        success: true,
        analysis: analysisResult,
        accountDetails: {
          accountNumber: account.account_number,
          accountType: account.account_type,
          currentBalance: currentBalance,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Loan agent error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
