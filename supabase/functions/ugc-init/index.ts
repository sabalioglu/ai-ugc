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
  additionalNotes: string;
}

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyAXXaJA9uyS9loxITDu7CsxvTGbTz5jt88';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const payload: RequestPayload = await req.json();

    console.log("[ugc-init] Starting job: " + payload.job_id);

    // Update status: Initializing AI Analysis
    await supabase
      .from('video_jobs')
      .update({
        status: 'processing',
        current_step: 'Analyzing product and writing script...',
        progress_percentage: 10
      })
      .eq('job_id', payload.job_id);

    console.log("Fetching image from: " + payload.uploadedImageUrl);
    const imageResponse = await fetch(payload.uploadedImageUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch product image: " + imageResponse.statusText);
    }
    const imageBuffer = await imageResponse.arrayBuffer();

    // Robust base64 conversion
    let binary = "";
    const bytes = new Uint8Array(imageBuffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Image = btoa(binary);
    console.log("Calling Gemini 2.0 Analysis...");

    // CONSOLIDATED ANALYSIS & SCRIPTING (Matching n8n logic)
    console.log("Calling Gemini 2.0 Consolidated Analysis...");
    const systemPrompt = `You are an expert UGC content strategist and AI video director.
Your task is to analyze a product image and generate a detailed UGC Creator Profile optimized for social media video ads.

---

INPUTS YOU WILL RECEIVE:
- Product name: ${payload.productName}
- Product Description: ${payload.productDescription}
- Target Audience: ${payload.targetAudience}
- UGC Style: ${payload.ugcStyleDetails}
- Platform: ${payload.platform}
- Video Length: ${payload.duration}
- Additional Notes: ${payload.additionalNotes}

---

ANALYSIS STEPS:

PART A: PRODUCT VISUAL ANALYSIS
1. Identify product type, material, color, and key branding elements.
2. Note specific details for consistency (e.g., "Glossy red bottle", "Matte black box").
3. Determine the "vibe" of the product (Luxury, Medical, Fun, Eco-friendly).

PART B: UGC CREATOR PROFILE GENERATION
1. AUDIENCE-PRODUCT ALIGNMENT
   - Determine ideal creator Age, Gender, and Ethnicity based on Target Audience.
   - Define the Style Aesthetic (e.g., "Clean Girl", "Tech Enthusiast", "Busy Mom").

2. SETTING & SCENE
   - Choose a location that fits the product context (e.g., Supplement -> Kitchen, Tech -> Desk).
   - Define lighting and background mood.

3. ACTION & ENERGY
   - Define how the creator interacts with the product.
   - Set the energy level suitable for the selected Platform.

CRITICAL REQUIREMENT: You MUST include a detailed "scene_breakdown" array within the "ugc_creator_profile" object. 
The video must be exactly ${payload.duration} seconds long. Generate exactly ${Math.ceil(parseInt(payload.duration) / 5)} scenes based on this duration.
Each scene in the "scene_breakdown" array MUST follow this structure:
{
  "scene_number": 1,
  "time_range": "0s - 8s",
  "duration": 8,
  "type": "problem_intro", 
  "description": "Visual description of the scene",
  "action": "What the creator is doing exactly",
  "product_visibility": "prominent / in_use / background"
}
Types should follow a logical UGC flow: problem_intro, solution_discovery, and success_cta.

### STRICT CONTENT COMPLIANCE RULES (MANDATORY) ###

You MUST adhere to these safety rules when generating the "scene_breakdown" and "action" descriptions:

1. ❌ NO PHYSICAL CONSUMPTION:
   - NEVER suggest the character eats, drinks, swallows, or tastes the product.
   - NO chewing, NO opening mouth with product, NO product-to-lip contact

2. ✅ ALLOWED ACTIONS ONLY:
   - Holding the bottle/package prominently.
   - Pointing at labels or specific features.
   - Gesturing enthusiastically while the product is in hand or on the counter.
   - Demonstrating the bottle size, cap, or packaging.
   - Shaking the bottle gently to show it's full.
   - Placing the product in the scene (e.g., on a marble counter).

3. ✅ SCENE STRATEGY:
   - Focus on "Showing & Telling" rather than "Consuming".
   - Use actions like: "Displays the label clearly", "Nods while holding the product at eye-level", "Points to the vegan icons on the side of the bottle".

### ANY VIOLATION OF THESE RULES WILL CAUSE SYSTEM FAILURE. ###

---

OUTPUT FORMAT (JSON ONLY):

{
  "product_analysis": {
    "product_name": "Extracted name",
    "category": "Category",
    "key_visual_features": ["feature1", "feature2"],
    "material_description": "Detailed description of surface/texture",
    "color_palette": ["primary", "secondary"],
    "branding_text": "Visible text on product"
  },

  "ugc_creator_profile": {
    "demographics": {
      "gender": "female|male|non-binary",
      "age_range": "e.g. 25-35",
      "age_numeric": 28,
      "ethnicity": "Specific ethnicity relatable to audience",
      "location_context": "urban|suburban|rural"
    },
    
    "appearance": {
      "style": "Fashion style description",
      "hair": "Hair style and color",
      "outfit": "Specific clothing description suitable for the scene",
      "accessories": "Minimal accessories"
    },
    
    "scene_setting": {
      "primary_location": "Specific room or place",
      "lighting": "natural_window|studio_soft|neon",
      "background_elements": ["prop1", "prop2"]
    },
    
    "energy_and_vibe": {
      "energy_level": "high|medium|calm",
      "emotional_tone": "enthusiastic|trustworthy|relatable"
    },
    "scene_breakdown": []
  },
  
  "video_production_metadata": {
    "platform": "${payload.platform}",
    "aspect_ratio": "9:16",
    "suggested_hook": "A short hook idea based on product benefits"
  }
}

CRITICAL: 
- Focus on visual details needed for image generation (skin tone, hair, lighting, texture).
- Return ONLY valid JSON. 
- Do not include markdown code fences ( \`\`\`json ).
`;

    const analysisResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: systemPrompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }]
      })
    });

    const analysisData = await analysisResponse.json();
    let rawResult = analysisData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawResult) {
      throw new Error("Gemini Consolidated Analysis failed: " + JSON.stringify(analysisData));
    }

    rawResult = rawResult.replace(/```json/g, "").replace(/```/g, "").trim();
    const finalResult = JSON.parse(rawResult);

    // STEP 3: Save to Database and move to next state
    const { error: updateError } = await supabase
      .from('video_jobs')
      .update({
        product_analysis: finalResult.product_analysis,
        scenes: finalResult.ugc_creator_profile.scene_breakdown,
        character_model: finalResult.ugc_creator_profile,
        video_metadata: finalResult.video_production_metadata,
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
    console.error("[ugc-init] Error:", error.message);

    // Log error to DB if possible
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      if (payload && payload.job_id) {
        await supabase
          .from('video_jobs')
          .update({
            status: 'failed',
            error_message: error.message
          })
          .eq('job_id', payload.job_id);
      }
    } catch (dbErr) {
      console.error("[ugc-init] Failed to log error to DB:", dbErr.message);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
