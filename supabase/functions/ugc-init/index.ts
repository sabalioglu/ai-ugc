import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestPayload {
  job_id: string;
  productName: string;
  productDescription: string;
  uploadedImageUrl: string;
  targetAudience: string;
  platform: string;
  duration: string;
  ugcStyleDetails: string;
  userEmail: string;
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const payload: RequestPayload = await req.json();

    console.log(`[ugc-init] Starting job: ${payload.job_id}`);

    // Update status: Initializing AI Analysis
    await supabase
      .from('video_jobs')
      .update({ 
        status: 'processing', 
        current_step: 'Analyzing product and writing script...',
        progress_percentage: 10
      })
      .eq('job_id', payload.job_id);

    // STEP 1: Product Analysis (Gemini)
    // Note: In a real scenario, we might need to convert the image to base64 if it's not a public URL
    // For now assuming the URL is accessible by Gemini
    const analysisResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: `You are an expert UGC content strategist. Analyze this product photo and details:
              Product Name: ${payload.productName}
              Description: ${payload.productDescription}
              Target Audience: ${payload.targetAudience}
              
              Return a JSON object with:
              - category
              - branding_text (key phrases)
              - color_palette (array)
              - key_visual_features (array)
              - material_description
              - visual_vibe
              - target_audience_summary` 
            },
            { 
              inline_data: {
                mime_type: "image/jpeg",
                // We need to fetch the image and convert to base64 for inline_data
                data: await fetch(payload.uploadedImageUrl).then(r => r.arrayBuffer()).then(b => btoa(String.fromCharCode(...new Uint8Array(b))))
              }
            }
          ]
        }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.7
        }
      })
    });

    const analysisData = await analysisResponse.json();
    if (!analysisData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error(`Gemini Analysis failed: ${JSON.stringify(analysisData)}`);
    }
    const productAnalysis = JSON.parse(analysisData.candidates[0].content.parts[0].text);

    // STEP 2: Script Writing (Gemini)
    const scriptResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `Generate a UGC video script based on this analysis:
            Analysis: ${JSON.stringify(productAnalysis)}
            Platform: ${payload.platform}
            Duration: ${payload.duration}s
            UGC Style: ${payload.ugcStyleDetails}
            
            Return a JSON object with:
            - scenes: Array of { scene_number, visual_description, spoken_script, duration }
            - creator_persona: { age, gender, ethnicity, style_aesthetic, personality }`
          }]
        }],
        generationConfig: { 
          response_mime_type: "application/json",
          temperature: 0.8
        }
      })
    });

    const scriptData = await scriptResponse.json();
    if (!scriptData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error(`Gemini Script Generation failed: ${JSON.stringify(scriptData)}`);
    }
    const scriptResult = JSON.parse(scriptData.candidates[0].content.parts[0].text);

    // STEP 3: Save to Database and move to next state
    const { error: updateError } = await supabase
      .from('video_jobs')
      .update({
        product_analysis: productAnalysis,
        scenes: scriptResult.scenes,
        character_model: scriptResult.creator_persona,
        status: 'READY_FOR_CHAR', // Trigger next step
        current_step: 'Strategic analysis complete! Preparing digital creator...',
        progress_percentage: 25
      })
      .eq('job_id', payload.job_id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true, jobId: payload.job_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`[ugc-init] Error:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
