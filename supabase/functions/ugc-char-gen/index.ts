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

    // STAGE 1: LLM Prompt Engineering (Matching n8n logic)
    console.log("[ugc-char-gen] Stage 1: Generating expert character prompt...");

    // Construct the prompt for Gemini using the "AI Photography Expert" logic
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyAXXaJA9uyS9loxITDu7CsxvTGbTz5jt88';
    const characterExpertPrompt = `
You are an elite AI photography prompt engineer specializing in ultra-realistic human character generation for commercial UGC video production.

## Your Task
Generate a single, comprehensive character generation prompt for Nano Banana Pro including:
- Camera metadata
- Skin texture details
- Exact facial features
- Hair specification
- Outfit details
- Lighting setup
- Background description
- Aspect ratio: 9:16

## Input Data (From Step 1)
${JSON.stringify(record.character_model || record.product_analysis)}

## Output Format Requirements
Return a JSON object with this EXACT structure:
{
  "characterPhysical": { ... },
  "characterPresentation": { ... },
  "aiGenerationPrompt": "400_TO_600_WORD_ULTRA_DETAILED_PROMPT_HERE",
  "consistencyChecklist": { ... },
  "generationMetadata": { ... }
}

CRITICAL: Return ONLY valid JSON. Start with { and end with }. No markdown fences.
`;

    const llmResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      body: JSON.stringify({
        contents: [{
          parts: [{ text: characterExpertPrompt }]
        }]
      })
    });

    const llmData = await llmResponse.json();
    let llmResultRaw = llmData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!llmResultRaw) throw new Error("Character Expert LLM call failed");

    llmResultRaw = llmResultRaw.replace(/```json/g, "").replace(/```/g, "").trim();
    const expertData = JSON.parse(llmResultRaw);
    const finalCharacterPrompt = expertData.aiGenerationPrompt;

    console.log("[ugc-char-gen] Expert Prompt Generated. Length: " + finalCharacterPrompt.length);

    // Update status to processing char with specific feedback
    await supabase.from('video_jobs').update({
      current_step: 'Synthesizing professional creator baseline with Nano Banana Pro...',
      progress_percentage: 35
    }).eq('job_id', record.job_id);

    // STAGE 2: Kie.ai Nano Banana Pro
    const kieResponse = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIE_API_KEY}`
      },
      body: JSON.stringify({
        model: "nano-banana-pro",
        input: {
          prompt: finalCharacterPrompt,
          // Use product image for style reference if provided
          image_url: record.product_image_url
        }
      })
    });

    const kieData = await kieResponse.json();
    const taskId = kieData.task_id || (kieData.data && (kieData.data.taskId || kieData.data.recordId));

    if (!taskId) throw new Error(`Kie.ai failed to start: ${JSON.stringify(kieData)}`);

    console.log("[ugc-char-gen] Kie.ai Task ID: " + taskId);

    let imageUrl = null;
    let attempts = 0;
    while (attempts < 60) {
      const statusRes = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`, {
        headers: { 'Authorization': `Bearer ${KIE_API_KEY}` }
      });
      const res = await statusRes.json();
      const statusData = res.data || res;
      const currentStatus = statusData.status || res.status;

      if (currentStatus === 'success' || currentStatus === 'completed') {
        imageUrl = statusData.image_url || statusData.output?.[0] || (statusData.output && statusData.output.image_url);
        break;
      } else if (currentStatus === 'failed') {
        throw new Error(`Kie.ai character synthesis failed: ${statusData.error || statusData.msg || 'Unknown error'}`);
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    if (!imageUrl) throw new Error('Kie.ai character synthesis timed out after 5 minutes');

    // 3. Save result and move to next step
    await supabase.from('video_jobs').update({
      character_image_url: imageUrl,
      status: 'READY_FOR_VIDEO',
      current_step: 'Digital creator ready! Now starting scene synthesis...',
      progress_percentage: 45
    }).eq('job_id', record.job_id);

    return new Response(JSON.stringify({ success: true, character_image_url: imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("[ugc-char-gen] Error:", error.message);
    try {
      const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const b = await req.clone().json();
      const rid = b?.record?.job_id;
      if (rid) {
        await sb.from('video_jobs').update({ status: 'failed', error_message: error.message }).eq('job_id', rid);
      }
    } catch (e) { }
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
