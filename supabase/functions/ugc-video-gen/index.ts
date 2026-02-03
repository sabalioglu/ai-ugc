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
    const { record } = await req.json();

    if (!record || record.status !== 'READY_FOR_VIDEO') {
      return new Response('Skipping - not ready for video generation', { status: 200 });
    }

    console.log("[ugc-video-gen] Processing job: " + record.job_id);

    const duration = parseInt(record.duration) || 24;
    const isLongVideo = duration > 12; // DurationCheck node logic
    const numSegments = isLongVideo ? Math.ceil(duration / 8) : 2; // Veo (8s segments) vs SeeDance (2 scenes)
    const segmentDuration = isLongVideo ? 8 : (duration / 2);

    // STAGE 3a: LLM Scene Strategy (Gemini 2.5 Pro Logic)
    console.log(`[ugc-video-gen] Stage 3a: Generating ${numSegments}-scene narrative...`);

    // Update status
    await supabase.from('video_jobs').update({
      current_step: `Developing ${numSegments}-scene cinematic strategy...`,
      progress_percentage: 50
    }).eq('job_id', record.job_id);

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    // Prepare character data for LLM
    const charData = record.character_model || {};
    const productData = record.product_analysis || {};

    const strategyPrompt = `
You are an elite UGC scriptwriter. Craft a compelling ${numSegments}-scene narrative that sells ${productData.product_name || 'the product'}.

## CREATIVE MANDATE
1. Scene 1 = Impact Hook / Problem
2. Sequential development leading to...
3. Final Scene = The Victory Lap (Transformation/Solution + Product Prominent)
- Generate exactly ${numSegments} scenes.
- Each scene needs a hyper-detailed image generation prompt (1500+ chars).

## OUTPUT FORMAT
Return ONLY JSON. No markdown fences.
{
  "scenes": [
    {
      "scene_number": 1,
      "promptForImageGen": "1500+ character ultra-detailed prompt",
      "emotion": "Frustrated",
      "narrative": { "storyBeat": "..." }
    },
    ...
  ]
}
`;

    const llmResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      body: JSON.stringify({
        contents: [{
          parts: [{ text: strategyPrompt }]
        }]
      })
    });

    const llmData = await llmResponse.json();
    let llmResultRaw = llmData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!llmResultRaw) throw new Error("Scene Strategy LLM call failed");

    llmResultRaw = llmResultRaw.replace(/```json/g, "").replace(/```/g, "").trim();
    const strategyResult = JSON.parse(llmResultRaw);

    // Save strategy to database
    await supabase.from('video_jobs').update({
      scenes: strategyResult.scenes,
      current_step: "Script ready! Generating cinematic frames...",
      progress_percentage: 65
    }).eq('job_id', record.job_id);


    // STAGE 3b: Frame Generation (Parallelized for N segments)
    console.log(`[ugc-video-gen] Stage 3b: Triggering ${numSegments} frames in parallel...`);

    const initiateTask = async (idx: number) => {
      const kieRes = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${KIE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "nano-banana-pro",
          input: { prompt: strategyResult.scenes[idx].promptForImageGen, image_url: record.character_image_url }
        })
      });
      const d = await kieRes.json();
      const tid = d.task_id || (d.data && (d.data.taskId || d.data.recordId));
      if (!tid) throw new Error(`Kie.ai frame ${idx + 1} failed to start`);
      return tid;
    };

    const taskIds = await Promise.all(strategyResult.scenes.map((_, i) => initiateTask(i)));
    const frameUrls: string[] = new Array(numSegments).fill("");

    const pollTask = async (idx: number) => {
      let attempts = 0;
      while (attempts < 60) {
        const statusRes = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskIds[idx]}`, {
          headers: { 'Authorization': `Bearer ${KIE_API_KEY}` }
        });
        const res = await statusRes.json();
        const statusData = res.data || res;
        const currentStatus = statusData.status || res.status;

        if (currentStatus === 'success' || currentStatus === 'completed') {
          const url = statusData.image_url || statusData.output?.[0] || (statusData.output && statusData.output.image_url);
          frameUrls[idx] = url;
          if (idx === 0) await supabase.from('video_jobs').update({ start_frame_url: url }).eq('job_id', record.job_id);
          if (idx === numSegments - 1) await supabase.from('video_jobs').update({ end_frame_url: url }).eq('job_id', record.job_id);
          return url;
        } else if (currentStatus === 'failed') {
          throw new Error(`Frame ${idx + 1} failed: ${statusData.error || statusData.msg}`);
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
        attempts++;
      }
      throw new Error(`Frame ${idx + 1} polling timed out.`);
    };

    console.log("[ugc-video-gen] Polling for frames...");
    await Promise.all(strategyResult.scenes.map((_, i) => pollTask(i)));

    // STAGE 3c: Vision-based ScriptWriter (Analyzes ALL generated frames)
    console.log("[ugc-video-gen] Stage 3c: Analyzing frames for final script...");

    await supabase.from('video_jobs').update({
      current_step: "AI Director analyzing cinematic frames for flow...",
      progress_percentage: 85
    }).eq('job_id', record.job_id);

    // Fetch images to pass as base64 to Gemini
    const fetchImageBase64 = async (url: string) => {
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(buffer);
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    };

    const framesB64 = await Promise.all(frameUrls.map(url => fetchImageBase64(url)));

    const scriptPrompt = `
You are a professional UGC Video Scriptwriter. Analyze these ${numSegments} sequential images and write an authentic conversational script.

YOUR TASK: 
1. Write ONE continuous story across ${numSegments} sequential clips.
2. Generate ${isLongVideo ? 'Veo 3.1 Extension' : 'Kling v1.6 Pro'} motion prompts for each scene. 
   ${isLongVideo ? `- IMPORTANT: For Veo 3.1, Scene 1 is the base video. Scenes 2-${numSegments} are EXTENSIONS. Each extension prompt must detail how the action continues from the END of the previous scene while maintaining perfect visual and character continuity.` : ''}

## OUTPUT FORMAT
Return ONLY valid JSON.
{
  "scenes": [
    {
      "scene_number": 1,
      "motion_prompt": "...",
      "script": "...",
      "duration": ${segmentDuration}
    },
    ...
  ]
}
`;

    const scriptResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: scriptPrompt },
            ...framesB64.map(b64 => ({ inline_data: { mime_type: "image/png", data: b64 } }))
          ]
        }]
      })
    });

    const scriptData = await scriptResponse.json();
    let scriptRaw = scriptData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!scriptRaw) throw new Error("ScriptWriter LLM call failed");

    scriptRaw = scriptRaw.replace(/```json/g, "").replace(/```/g, "").trim();
    const scriptResult = JSON.parse(scriptRaw);

    // FINALIZATION
    await supabase
      .from('video_jobs')
      .update({
        video_segments: scriptResult, // Store the final cinematic strategy
        status: 'READY_FOR_SYNTHESIS',
        current_step: 'Cinematic flow ready! Initializing video engines...',
        progress_percentage: 100
      })
      .eq('job_id', record.job_id);

    return new Response(JSON.stringify({ success: true, script: scriptResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

    return new Response(JSON.stringify({ success: true, script: scriptResult }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("[ugc-video-gen] Error:", error.message);
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
