import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MailSummary {
  mail_id: string
  from: string
  subject: string
  summary: string
  received_at: string
  original_text?: string
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabase client oluştur
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Request body'yi parse et
    const payload: MailSummary = await req.json()

    // Validasyon
    if (!payload.mail_id || !payload.from || !payload.subject || !payload.summary) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          required: ['mail_id', 'from', 'subject', 'summary']
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Mail özetini kaydet
    const { data, error } = await supabaseClient
      .from('mail_summaries')
      .insert([
        {
          mail_id: payload.mail_id,
          from_address: payload.from,
          subject: payload.subject,
          summary: payload.summary,
          received_at: payload.received_at || new Date().toISOString(),
          original_text: payload.original_text || null,
          created_at: new Date().toISOString(),
        }
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Başarılı response
    return new Response(
      JSON.stringify({
        success: true,
        data,
        message: 'Mail summary saved successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
