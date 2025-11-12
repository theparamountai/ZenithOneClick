import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OPayBalanceRequest {
  credentialId: string;
}

interface OPayCredentials {
  merchant_id: string;
  public_key: string;
  secret_key: string;
  account_reference: string;
  bank_provider: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Unauthorized');
    }

    const { credentialId }: OPayBalanceRequest = await req.json();

    if (!credentialId) {
      throw new Error('Credential ID is required');
    }

    // Fetch OPay credentials from database
    const { data: credentials, error: credError } = await supabaseClient
      .from('external_bank_credentials')
      .select('*')
      .eq('id', credentialId)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (credError || !credentials) {
      console.error('Error fetching credentials:', credError);
      throw new Error('Invalid credentials');
    }

    const creds = credentials as unknown as OPayCredentials;

    // Generate HMAC-SHA512 signature for authentication
    const timestamp = Date.now().toString();
    const requestBody = {
      reference: timestamp,
    };

    const message = JSON.stringify(requestBody);
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(creds.secret_key),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(message)
    );
    
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Determine API base URL based on environment
    const baseUrl = creds.merchant_id.startsWith('TEST') 
      ? 'https://testapi.opayweb.com'
      : 'https://api.opayweb.com';

    // Call OPay Balance Query API
    const opayResponse = await fetch(`${baseUrl}/api/v1/international/balance/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${creds.public_key}`,
        'MerchantId': creds.merchant_id,
        'Signature': signatureHex,
      },
      body: JSON.stringify(requestBody),
    });

    if (!opayResponse.ok) {
      const errorText = await opayResponse.text();
      console.error('OPay API error:', opayResponse.status, errorText);
      throw new Error(`OPay API error: ${opayResponse.status}`);
    }

    const opayData = await opayResponse.json();

    if (opayData.code !== '00000') {
      console.error('OPay error response:', opayData);
      throw new Error(opayData.message || 'Failed to fetch balance from OPay');
    }

    // Convert balance from Kobo to Naira (divide by 100)
    const balanceInNaira = parseFloat(opayData.data.balance.availableBalance) / 100;

    // Update bank_accounts table with new balance
    const { error: updateError } = await supabaseClient
      .from('bank_accounts')
      .update({
        balance: balanceInNaira,
        last_synced: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('external_reference', creds.account_reference);

    if (updateError) {
      console.error('Error updating balance:', updateError);
    }

    // Update last_synced in credentials table
    await supabaseClient
      .from('external_bank_credentials')
      .update({ last_synced: new Date().toISOString() })
      .eq('id', credentialId);

    return new Response(
      JSON.stringify({
        success: true,
        balance: balanceInNaira,
        currency: 'NGN',
        lastSynced: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in opay-balance function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
