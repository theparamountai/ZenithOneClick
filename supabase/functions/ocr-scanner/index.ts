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
    const { image } = await req.json();
    
    if (!image) {
      throw new Error('Image data is required');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    console.log('Scanning document with OCR...');

    // Ensure image is in proper data URL format
    const imageUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;

    // Use OpenAI Vision API to extract NIN information
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are extracting information from a Nigerian National Identity Number (NIN) card.

Extract the following:
1. Full Name - exactly as shown on the card
2. Gender - Male or Female
3. Address - complete residential address
4. NIN Number - This is the MOST IMPORTANT: Nigerian NIN is ALWAYS exactly 11 digits. Look carefully at the card and extract only the 11-digit number. If you see 12 digits, the last one might be a check digit - exclude it.

Return ONLY a JSON object with these exact keys: fullName, gender, address, ninNumber
No markdown, no explanation, just the JSON.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI Vision API error:', error);
      throw new Error('Failed to scan document');
    }

    const data = await response.json();
    const extractedText = data.choices[0].message.content;

    console.log('Extracted text:', extractedText);

    // Parse the JSON response
    let extractedData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        extractedData = JSON.parse(extractedText);
      }
    } catch (e) {
      console.error('Failed to parse extracted data:', e);
      throw new Error('Could not extract data from document. Please ensure the image is clear and shows a valid NIN ID.');
    }

    // Validate and clean extracted data
    let cleanedNIN = extractedData.ninNumber?.replace(/\D/g, '') || '';
    console.log('Raw extracted NIN:', extractedData.ninNumber);
    console.log('Cleaned NIN:', cleanedNIN, 'Length:', cleanedNIN.length);
    
    // Handle 12-digit NINs (remove last check digit)
    if (cleanedNIN.length === 12) {
      console.log('12-digit NIN detected, removing last digit');
      cleanedNIN = cleanedNIN.substring(0, 11);
    }
    
    // Validate final NIN
    if (!cleanedNIN || cleanedNIN.length !== 11) {
      console.error('Invalid NIN after cleaning:', cleanedNIN);
      throw new Error(`Could not extract valid 11-digit NIN (found ${cleanedNIN.length} digits). Please ensure the document is clear and well-lit, then try again.`);
    }
    
    console.log('Final validated NIN:', cleanedNIN);
    extractedData.ninNumber = cleanedNIN;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          fullName: extractedData.fullName || '',
          gender: extractedData.gender || '',
          address: extractedData.address || '',
          ninNumber: extractedData.ninNumber || '',
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ocr-scanner:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
