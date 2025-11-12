import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, sessionId } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
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

    // System prompt for Zenith Bank account opening - Intent extraction only
    const systemPrompt = `You are a friendly Zenith Bank account opening assistant. Your ONLY job is to understand what type of account the user wants to open.

Account Types:
- Savings Account
- Business Account  
- Current Account

Guidelines:
- Be conversational and friendly
- Understand user intent from their message (e.g., "I want to open a savings account", "create business account for me")
- Once you identify the account type they want, immediately return it
- If unclear, ask one clarifying question
- Use Nigerian context and terminology

When you identify the account type, respond with exactly this format:
INTENT_DETECTED: {"accountType": "savings" OR "business" OR "current"}

Do NOT ask for personal information like name, address, NIN, etc. That will be collected via document scanning.`;

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // Save conversation to database
    if (sessionId) {
      await supabase
        .from('conversation_history')
        .upsert({
          session_id: sessionId,
          user_id: user.id,
          messages: [...messages, { role: 'assistant', content: aiMessage }],
          created_at: new Date().toISOString(),
        }, {
          onConflict: 'session_id'
        });
    }

    // Check if intent is detected
    let intentData = null;
    if (aiMessage.includes('INTENT_DETECTED:')) {
      const jsonMatch = aiMessage.match(/INTENT_DETECTED:\s*(\{.*\})/);
      if (jsonMatch) {
        try {
          intentData = JSON.parse(jsonMatch[1]);
        } catch (e) {
          console.error('Failed to parse intent data:', e);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: aiMessage.replace(/INTENT_DETECTED:.*/, '').trim(),
        intentData,
        intentDetected: !!intentData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in chat-agent:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
