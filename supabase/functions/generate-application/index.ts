import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productType, profile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let prompt = '';
    
    if (productType === 'credit_card') {
      prompt = `Based on this user profile, generate a credit card application form data in JSON format:
      
      User Profile:
      - Name: ${profile.first_name} ${profile.last_name}
      - Email: ${profile.email}
      - Phone: ${profile.phone}
      - Address: ${profile.street_address}, ${profile.city}, ${profile.state} ${profile.zip_code}
      - Annual Income: $${profile.annual_income}
      - Employment: ${profile.employment_status}
      
      Generate JSON with these fields:
      - requestedCreditLimit (number, based on income, max 30% of annual income)
      - primaryUse (string: "everyday purchases", "balance transfer", "travel rewards")
      - preferredCardDesign (string: "classic", "platinum", "sapphire")
      
      Return ONLY valid JSON, no markdown or explanation.`;
    } else if (productType === 'checking_account') {
      prompt = `Based on this user profile, generate a checking account application form data in JSON format:
      
      User Profile:
      - Name: ${profile.first_name} ${profile.last_name}
      - Email: ${profile.email}
      - Phone: ${profile.phone}
      - Address: ${profile.street_address}, ${profile.city}, ${profile.state} ${profile.zip_code}
      - Monthly Expenses: $${profile.monthly_expenses}
      
      Generate JSON with these fields:
      - initialDeposit (number, suggested 100-1000)
      - overdraftProtection (boolean, true recommended)
      - debitCardPreference (string: "standard", "premium", "contactless")
      
      Return ONLY valid JSON, no markdown or explanation.`;
    } else if (productType === 'personal_loan') {
      prompt = `Based on this user profile, generate a personal loan application form data in JSON format:
      
      User Profile:
      - Name: ${profile.first_name} ${profile.last_name}
      - Email: ${profile.email}
      - Phone: ${profile.phone}
      - Annual Income: $${profile.annual_income}
      - Monthly Expenses: $${profile.monthly_expenses}
      
      Generate JSON with these fields:
      - requestedAmount (number, max 3x monthly available income)
      - loanPurpose (string: "debt consolidation", "home improvement", "major purchase", "medical expenses")
      - preferredTerm (string: "12 months", "24 months", "36 months", "48 months", "60 months")
      - estimatedMonthlyPayment (number, calculated with 5.99% APR)
      
      Return ONLY valid JSON, no markdown or explanation.`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a financial application assistant. Always return valid JSON only, no markdown formatting.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('AI Gateway error');
    }

    const data = await response.json();
    let generatedData = data.choices[0].message.content;

    // Clean up markdown formatting if present
    generatedData = generatedData.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const parsedData = JSON.parse(generatedData);

    return new Response(JSON.stringify({ success: true, data: parsedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-application:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});