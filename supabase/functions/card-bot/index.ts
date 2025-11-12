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
    const { message } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Card bot received message:", message);

    const systemPrompt = `You are a card request assistant for Zenith Bank. Your ONLY job is to extract card request intent from user messages.

Extract these three pieces of information:
1. card_type: "mastercard", "visa", or "verve"
2. currency: "naira" or "dollar"
3. category: "savings" or "current"

Examples:
- "Create a Savings VISA Naira card for me" → {card_type: "visa", currency: "naira", category: "savings"}
- "I want a Mastercard in dollars for my current account" → {card_type: "mastercard", currency: "dollar", category: "current"}
- "Get me a Verve Naira card for savings" → {card_type: "verve", currency: "naira", category: "savings"}

If you can extract ALL THREE values, respond with JSON:
{"intent_detected": true, "card_type": "...", "currency": "...", "category": "..."}

If ANY value is unclear, respond with JSON:
{"intent_detected": false, "message": "Please specify: [what's missing]"}

Only respond with valid JSON. Be friendly but concise.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;
    
    console.log("Card bot AI response:", aiMessage);

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in card-bot function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
