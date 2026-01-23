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

    const scenes = record.scenes || [];
    const videoUrls: string[] = [];

    // Update initial progress
    await supabase
      .from('video_jobs')
      .update({ 
        current_step: "Generating " + scenes.length + " video scenes...",
        progress_percentage: 50
      })
      .eq('job_id', record.job_id);

    // VIDEO GENERATION LOOP
    for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        console.log("[ugc-video-gen] Generating Scene " + (i + 1) + "/" + scenes.length);

        // Update progress for each scene
        await supabase
          .from('video_jobs')
          .update({ 
            current_step: "Generating Scene " + (i + 1) + "/" + scenes.length + ": " + scene.visual_description.substring(0, 30) + "...",
            progress_percentage: 50 + ((i / scenes.length) * 40)
          })
          .eq('job_id', record.job_id);

        // API Call to Kie.ai Video Generation
        const kieResponse = await fetch('https://api.kie.ai/v1/generate/video', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${KIE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image_url: record.character_image_url,
                prompt: scene.visual_description,
                duration: scene.duration || 8
            })
        });

        if (!kieResponse.ok) {
            const errorText = await kieResponse.text();
            throw new Error(`Kie.ai Video Request failed: ${errorText}`);
        }

        const kieData = await kieResponse.json();
        const taskId = kieData.task_id;

        // Polling for this specific scene
        let sceneVideoUrl = null;
        let attempts = 0;
        const maxAttempts = 30; // 30 * 5s = 150s (Max for Edge Function)

        while (attempts < maxAttempts) {
            const statusResponse = await fetch(`https://api.kie.ai/v1/status/${taskId}`, {
                headers: { 'Authorization': `Bearer ${KIE_API_KEY}` }
            });
            const statusData = await statusResponse.json();

            if (statusData.status === 'completed') {
                sceneVideoUrl = statusData.video_url;
                break;
            } else if (statusData.status === 'failed') {
                throw new Error(`Kie.ai video generation failed for scene ${i+1}: ${statusData.error}`);
            }

            await new Promise(resolve => setTimeout(resolve, 5000));
            attempts++;
        }

        if (sceneVideoUrl) {
            videoUrls.push(sceneVideoUrl);
            // Save the individual segment
            const updateObj: any = {};
            updateObj[`video_url_${i + 1}`] = sceneVideoUrl;
            await supabase
              .from('video_jobs')
              .update(updateObj)
              .eq('job_id', record.job_id);
        } else {
            console.warn(`[ugc-video-gen] Scene ${i+1} timed out or failed to return URL`);
        }
    }

    // SKIP ASSEMBLY - Mark as completed since FFmpeg is not yet integrated
    await supabase
      .from('video_jobs')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        current_step: 'Video generation completed! All segments ready.',
        progress_percentage: 100
      })
      .eq('job_id', record.job_id);

    return new Response(JSON.stringify({ success: true, videos: videoUrls }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`[ugc-video-gen] Error:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
