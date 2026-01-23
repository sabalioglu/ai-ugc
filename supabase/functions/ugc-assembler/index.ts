import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const FFMPEG_SERVICE_URL = Deno.env.get('FFMPEG_SERVICE_URL');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { record } = await req.json();

    if (!record || record.status !== 'READY_FOR_ASSEMBLY') {
      return new Response('Skipping - not ready for assembly', { status: 200 });
    }

    console.log(`[ugc-assembler] Assembling job: ${record.job_id}`);

    // Update progress
    await supabase
      .from('video_jobs')
      .update({ 
        current_step: 'Finalizing cinematic assembly...',
        progress_percentage: 95
      })
      .eq('job_id', record.job_id);

    // Collect all video segments
    const videoUrls = [];
    for (let i = 1; i <= 8; i++) {
        const url = record[`video_url_${i}`];
        if (url) videoUrls.push(url);
    }

    // Call FFmpeg service
    const assembleResponse = await fetch(`${FFMPEG_SERVICE_URL}/assemble`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jobId: record.job_id,
            videos: videoUrls,
            audio: record.audio_url || null,
            outputFileName: `${record.job_id}_final.mp4`
        })
    });

    const assembleData = await assembleResponse.json();
    const finalVideoUrl = assembleData.url;

    // Final Update
    await supabase
      .from('video_jobs')
      .update({
        video_url: finalVideoUrl,
        status: 'completed',
        completed_at: new Date().toISOString(),
        current_step: 'Video generation completed!',
        progress_percentage: 100
      })
      .eq('job_id', record.job_id);

    return new Response(JSON.stringify({ success: true, url: finalVideoUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`[ugc-assembler] Error:`, error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
