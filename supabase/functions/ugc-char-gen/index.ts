import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const KIE_API_KEY = Deno.env.get('KIE_API_KEY') || 'be2a13c69e352161fd623df5ad90de0f';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { record } = await req.json(); // Triggered by DB Webhook

    if (!record || record.status !== 'READY_FOR_CHAR') {
      return new Response('Skipping - not ready for character generation', { status: 200 });
    }

    console.log("[ugc-char-gen] Processing job: " + record.job_id);

    // Update status to processing char
    await supabase
      .from('video_jobs')
      .update({ 
        current_step: 'Creating your digital creator personality...',
        progress_percentage: 30
      })
      .eq('job_id', record.job_id);

    // 1. Initial Request to Kie.ai
    // We use the character description from Gemini (creator_persona)
    const prompt = "A professional UGC creator, " + persona.age + " year old " + persona.ethnicity + " " + persona.gender + ", " + persona.style_aesthetic + " style, " + persona.personality + ". High quality, realistic lighting, studio background.";

    const kieResponse = await fetch('https://api.kie.ai/v1/generate/character', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_API_KEY}`
      },
      body: JSON.stringify({
        prompt: prompt,
        image_url: record.product_image_url
      })
    });

    const kieData = await kieResponse.json();
    const taskId = kieData.task_id;

    // 2. POLLING STRATEGY
    // Edge Functions have a 150s limit. We will poll for up to 100s, 
    // then if not finished, we'll update DB and let next webhook or a scheduled task pick it up.
    // In this simplified version, we poll for completion.
    
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
      console.log("[ugc-char-gen] Polling Kie.ai (Attempt " + (attempts + 1) + ")...");
      
      const statusResponse = await fetch(`https://api.kie.ai/v1/status/${taskId}`, {
        headers: { 'Authorization': `Bearer ${KIE_API_KEY}` }
      });
      const statusData = await statusResponse.json();

      if (statusData.status === 'completed') {
        imageUrl = statusData.image_url;
        break;
      } else if (statusData.status === 'failed') {
        throw new Error(`Kie.ai generation failed: ${statusData.error}`);
      }

      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5s
      attempts++;
    }

    if (!imageUrl) {
      // HANDLE TIMEOUT: In a robust setup, we would save the taskId and exit.
      // The user can refresh and a background job can continue.
      throw new Error('Kie.ai generation timed out after 100s');
    }

    // 3. Save result and move to next step
    await supabase
      .from('video_jobs')
      .update({
        character_image_url: imageUrl,
        status: 'READY_FOR_VIDEO', // Triggers the next function
        current_step: 'Digital creator ready! Now starting video generation...',
        progress_percentage: 45
      })
      .eq('job_id', record.job_id);

    return new Response(JSON.stringify({ success: true, character_image_url: imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`[ugc-char-gen] Error:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
