import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log('Creating OpenAI Realtime session...');

    // Create ephemeral session with OpenAI Realtime API
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: `You are a friendly Zenith Bank account opening assistant. Your goal is to collect the following information from the user through a natural conversation:

1. Full Name (first and last name)
2. Gender (Male or Female)
3. Full Residential Address (including street, city, state)
4. NIN Number (11 digits - National Identification Number)
5. Account Type (Savings, Business, or Current)

CRITICAL Guidelines:
- Be warm, professional, and efficient
- Ask for ONE piece of information at a time and WAIT for the user's complete response
- After the user provides information, CONFIRM it back to them explicitly (e.g., "Just to confirm, your name is John Doe, is that correct?")
- Only move to the next question AFTER the user confirms the information
- If information seems incomplete or unclear, politely ask for clarification
- Use Nigerian context and terminology
- As you collect and CONFIRM each piece of information, call the appropriate function to record it
- ONLY call the complete_account_opening function AFTER all 5 pieces of information are collected AND confirmed with the user
- Do NOT cut yourself off mid-sentence - complete your questions and confirmations fully

After collecting all information, thank the user and let them know they'll be able to review and edit the information before final submission.`,
        tools: [
          {
            type: "function",
            name: "record_full_name",
            description: "Record the user's full name once confirmed",
            parameters: {
              type: "object",
              properties: {
                fullName: { type: "string", description: "User's full name (first and last)" }
              },
              required: ["fullName"]
            }
          },
          {
            type: "function",
            name: "record_gender",
            description: "Record the user's gender once confirmed",
            parameters: {
              type: "object",
              properties: {
                gender: { type: "string", enum: ["Male", "Female"], description: "User's gender" }
              },
              required: ["gender"]
            }
          },
          {
            type: "function",
            name: "record_address",
            description: "Record the user's residential address once confirmed",
            parameters: {
              type: "object",
              properties: {
                address: { type: "string", description: "Complete residential address" }
              },
              required: ["address"]
            }
          },
          {
            type: "function",
            name: "record_nin",
            description: "Record the user's NIN number once confirmed",
            parameters: {
              type: "object",
              properties: {
                ninNumber: { type: "string", description: "11-digit NIN number" }
              },
              required: ["ninNumber"]
            }
          },
          {
            type: "function",
            name: "record_account_type",
            description: "Record the user's desired account type once confirmed",
            parameters: {
              type: "object",
              properties: {
                accountType: { type: "string", enum: ["savings", "business", "current"], description: "Type of account" }
              },
              required: ["accountType"]
            }
          },
          {
            type: "function",
            name: "complete_account_opening",
            description: "Call this when all information has been collected and confirmed with the user",
            parameters: {
              type: "object",
              properties: {
                complete: { type: "boolean", description: "Whether all information is collected" }
              },
              required: ["complete"]
            }
          }
        ],
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI Realtime API error:', error);
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data = await response.json();
    console.log('Session created successfully');

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in realtime-voice-agent:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
