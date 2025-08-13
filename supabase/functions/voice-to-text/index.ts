
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Voice-to-text request received')
    
    // Check if OpenAI API key is available
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiKey) {
      console.error('OpenAI API key not found in environment')
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your Supabase secrets.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const requestBody = await req.json().catch(() => {
      console.error('Failed to parse request body as JSON')
      throw new Error('Invalid JSON in request body')
    })
    
    const { audio } = requestBody
    
    if (!audio) {
      console.error('No audio data provided in request')
      return new Response(
        JSON.stringify({ error: 'No audio data provided' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Audio data length:', audio.length)

    // Convert base64 to binary with error handling
    let binaryAudio: string
    let bytes: Uint8Array
    
    try {
      binaryAudio = atob(audio)
      bytes = new Uint8Array(binaryAudio.length)
      for (let i = 0; i < binaryAudio.length; i++) {
        bytes[i] = binaryAudio.charCodeAt(i)
      }
      console.log('Binary audio converted, size:', bytes.length)
    } catch (error) {
      console.error('Failed to decode base64 audio:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid base64 audio data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
    
    // Prepare form data
    const formData = new FormData()
    const blob = new Blob([bytes], { type: 'audio/webm' })
    formData.append('file', blob, 'audio.webm')
    formData.append('model', 'whisper-1')

    console.log('Sending request to OpenAI Whisper API...')
    
    // Send to OpenAI with better error handling
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: formData,
    }).catch((error) => {
      console.error('Network error calling OpenAI:', error)
      throw new Error('Failed to connect to OpenAI API')
    })

    console.log('OpenAI response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error (${response.status}): ${errorText}` 
        }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const result = await response.json()
    console.log('Transcription successful, text length:', result.text?.length || 0)

    return new Response(
      JSON.stringify({ text: result.text }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: 'Check Edge Function logs for more information'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
