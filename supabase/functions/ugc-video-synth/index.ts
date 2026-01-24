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

    let job_id = "unknown";
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const body = await req.json();
        const record = body.record;

        if (!record || record.status !== 'READY_FOR_SYNTHESIS') {
            return new Response('Skipping - not ready for synthesis', { status: 200 });
        }

        job_id = record.job_id;
        console.log(`[ugc-video-synth] Starting synthesis for job: ${job_id}`);

        const durationNum = parseInt(record.duration) || 24;
        const isLongVideo = durationNum > 12;
        const sceneData = record.video_segments.scenes || [];

        await supabase.from('video_jobs').update({
            current_step: `AI Character coming to life using ${isLongVideo ? 'Veo 3.1 Extend' : 'SeeDance 1.5 PRO'}...`,
            progress_percentage: 85
        }).eq('job_id', job_id);

        const sceneUrls: string[] = [];

        if (!isLongVideo) {
            // SHORT VIDEO: Parallel SeeDance 1.5 PRO (2 Scenes)
            console.log("[ugc-video-synth] Using Parallel SeeDance logic for 12s video");

            const triggerShort = async (idx: number, segment: any, imageUrl: string) => {
                const res = await fetch('https://api.kie.ai/api/v1/jobs/createTask', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${KIE_API_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: "seedance-1.5-pro",
                        input: { prompt: segment.motion_prompt, image_url: imageUrl, duration: segment.duration || 6 }
                    })
                });
                const d = await res.json();
                const tid = d.task_id || (d.data && (d.data.taskId || d.data.recordId));
                if (!tid) throw new Error(`Scene ${idx + 1} synthesis failed: ${JSON.stringify(d)}`);
                return tid;
            };

            const taskIds = await Promise.all(sceneData.map((seg: any, i: number) => triggerShort(i, seg, record.start_frame_url)));

            await Promise.all(taskIds.map(async (tid, idx) => {
                let attempts = 0;
                while (attempts < 150) {
                    const statusRes = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${tid}`, {
                        headers: { 'Authorization': `Bearer ${KIE_API_KEY}` }
                    });
                    const res = await statusRes.json();
                    const statusData = res.data || res;
                    const currentStatus = statusData.status || res.status;
                    if (currentStatus === 'success' || currentStatus === 'completed') {
                        const url = statusData.video_url || statusData.output?.[0] || (statusData.output && statusData.output.video_url);
                        sceneUrls[idx] = url;
                        await supabase.from('video_jobs').update({ [`video_url_${idx + 1}`]: url }).eq('job_id', job_id);
                        return;
                    } else if (currentStatus === 'failed') throw new Error(`Scene ${idx + 1} failed`);
                    await new Promise(resolve => setTimeout(resolve, 10000));
                    attempts++;
                }
            }));
        } else {
            // LONG VIDEO: Sequential Veo 3.1 Extend
            console.log(`[ugc-video-synth] Using Sequential Veo 3.1 Extend logic for ${durationNum}s`);

            let lastTaskId = "";

            for (let i = 0; i < sceneData.length; i++) {
                const segment = sceneData[i];
                const isInitial = i === 0;
                const endpoint = isInitial ? "https://api.kie.ai/api/v1/veo/generate" : "https://api.kie.ai/api/v1/veo/extend";

                const payload = isInitial ? {
                    model: "veo-3-1",
                    prompt: segment.motion_prompt,
                    image_url: record.start_frame_url,
                    duration: 8
                } : {
                    taskId: lastTaskId,
                    prompt: segment.motion_prompt
                };

                console.log(`[ugc-video-synth] Scene ${i + 1}: ${isInitial ? 'Generating' : 'Extending'}...`);

                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${KIE_API_KEY}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const d = await res.json();
                lastTaskId = d.task_id || (d.data && d.data.taskId);
                if (!lastTaskId) throw new Error(`Scene ${i + 1} failed to start: ${JSON.stringify(d)}`);

                // Poll for this segment before continuing
                let attempts = 0;
                let segmentUrl = "";
                while (attempts < 180) {
                    const statusRes = await fetch(`https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${lastTaskId}`, {
                        headers: { 'Authorization': `Bearer ${KIE_API_KEY}` }
                    });
                    const res = await statusRes.json();
                    const statusData = res.data || res;
                    const currentStatus = statusData.status || res.status;

                    if (currentStatus === 'success' || currentStatus === 'completed') {
                        segmentUrl = statusData.video_url || statusData.output?.[0] || (statusData.output && statusData.output.resultUrls?.[0]);
                        sceneUrls.push(segmentUrl);
                        await supabase.from('video_jobs').update({ [`video_url_${i + 1}`]: segmentUrl }).eq('job_id', job_id);
                        break;
                    } else if (currentStatus === 'failed') throw new Error(`Scene ${i + 1} failed: ${statusData.error || statusData.msg}`);

                    await new Promise(resolve => setTimeout(resolve, 15000));
                    attempts++;
                }
                if (!segmentUrl) throw new Error(`Scene ${i + 1} timed out`);
            }
        }

        // FINALIZATION: Move to assembly
        await supabase.from('video_jobs').update({
            status: 'READY_FOR_ASSEMBLY',
            current_step: 'All scenes generated! Assembling final masterpiece...',
            progress_percentage: 95
        }).eq('job_id', job_id);

        return new Response(JSON.stringify({ success: true, videos: sceneUrls }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("[ugc-video-synth] Error:", error.message);
        try {
            const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
            if (job_id !== "unknown") {
                await sb.from('video_jobs').update({ status: 'failed', error_message: error.message }).eq('job_id', job_id);
            }
        } catch (e) { }
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
})
