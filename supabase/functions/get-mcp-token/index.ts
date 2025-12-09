import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GetMcpTokenRequest {
  phone?: string
  user_id?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const body: GetMcpTokenRequest = await req.json()

    if (!body.phone && !body.user_id) {
      throw new Error('Missing phone or user_id parameter')
    }

    let userId: string | null = null

    // Find user by phone number
    if (body.phone) {
      // Normalize phone number (remove spaces, dashes, etc)
      const normalizedPhone = body.phone.replace(/[\s\-\(\)]/g, '')

      console.log(`Looking up user by phone: ${normalizedPhone}`)

      const { data: subscriber, error: subscriberError } = await supabaseClient
        .from('subscribers')
        .select('user_id')
        .eq('whatsapp_phone', normalizedPhone)
        .single()

      if (subscriberError || !subscriber) {
        // Try without country code prefix variations
        const phoneVariations = [
          normalizedPhone,
          normalizedPhone.replace(/^\+/, ''),
          normalizedPhone.replace(/^55/, '+55'),
          `+${normalizedPhone}`,
        ]

        for (const phoneVar of phoneVariations) {
          const { data: sub } = await supabaseClient
            .from('subscribers')
            .select('user_id')
            .eq('whatsapp_phone', phoneVar)
            .single()

          if (sub) {
            userId = sub.user_id
            break
          }
        }

        if (!userId) {
          return new Response(
            JSON.stringify({
              error: 'USER_NOT_FOUND',
              message: 'No user found with this phone number'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404,
            }
          )
        }
      } else {
        userId = subscriber.user_id
      }
    } else if (body.user_id) {
      userId = body.user_id
    }

    console.log(`Found user_id: ${userId}`)

    // Get MCP token for this user
    const { data: mcpToken, error: tokenError } = await supabaseClient
      .from('chatdata_mcp_tokens')
      .select('mcp_token, expires_at')
      .eq('user_id', userId)
      .single()

    if (tokenError || !mcpToken) {
      return new Response(
        JSON.stringify({
          error: 'NO_MCP_TOKEN',
          message: 'User has no MCP token. They need to connect their Meta account first.'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        }
      )
    }

    // Check if token is expired
    const expiresAt = new Date(mcpToken.expires_at)
    const isExpired = expiresAt < new Date()

    if (isExpired) {
      return new Response(
        JSON.stringify({
          error: 'TOKEN_EXPIRED',
          message: 'MCP token has expired. User needs to reconnect their Meta account.',
          expires_at: mcpToken.expires_at
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Update last_used_at
    await supabaseClient
      .from('chatdata_mcp_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('user_id', userId)

    console.log('MCP token retrieved successfully')

    return new Response(
      JSON.stringify({
        success: true,
        mcp_token: mcpToken.mcp_token,
        expires_at: mcpToken.expires_at,
        is_valid: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in get-mcp-token function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
