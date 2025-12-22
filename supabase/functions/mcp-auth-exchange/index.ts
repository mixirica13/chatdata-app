import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExchangeRequest {
  code: string
}

interface ExchangeResponse {
  user_id: string
  meta_access_token: string
  ad_account_ids: string[]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'method_not_allowed', error_description: 'Only POST requests are allowed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
      )
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const body: ExchangeRequest = await req.json()

    if (!body.code) {
      return new Response(
        JSON.stringify({ error: 'invalid_request', error_description: 'Missing code parameter' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Exchanging MCP auth code...')

    // Look up the authorization code
    const { data: authCode, error: codeError } = await supabaseClient
      .from('mcp_auth_codes')
      .select('*')
      .eq('code', body.code)
      .single()

    if (codeError || !authCode) {
      console.error('Code not found:', codeError)
      return new Response(
        JSON.stringify({ error: 'invalid_code', error_description: 'Invalid or expired authorization code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if code is expired
    const expiresAt = new Date(authCode.expires_at)
    if (expiresAt < new Date()) {
      console.error('Code expired:', authCode.expires_at)
      return new Response(
        JSON.stringify({ error: 'invalid_code', error_description: 'Authorization code has expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if code was already used
    if (authCode.used_at) {
      console.error('Code already used:', authCode.used_at)
      return new Response(
        JSON.stringify({ error: 'invalid_code', error_description: 'Authorization code has already been used' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Mark code as used
    const { error: updateError } = await supabaseClient
      .from('mcp_auth_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', authCode.id)

    if (updateError) {
      console.error('Error marking code as used:', updateError)
      // Continue anyway - this is not critical
    }

    // Get user's Meta credentials
    const { data: metaCredentials, error: credentialsError } = await supabaseClient
      .from('meta_credentials')
      .select('access_token, ad_account_ids, expires_at')
      .eq('user_id', authCode.user_id)
      .single()

    if (credentialsError || !metaCredentials) {
      console.error('Meta credentials not found:', credentialsError)
      return new Response(
        JSON.stringify({ error: 'no_meta_connection', error_description: 'User has not connected Meta Ads' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if Meta token is expired
    const metaExpiresAt = new Date(metaCredentials.expires_at)
    if (metaExpiresAt < new Date()) {
      console.error('Meta token expired:', metaCredentials.expires_at)
      return new Response(
        JSON.stringify({ error: 'meta_token_expired', error_description: 'Meta Ads token has expired. User needs to reconnect.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('MCP auth code exchanged successfully for user:', authCode.user_id)

    // Return user data for MCP server
    const response: ExchangeResponse = {
      user_id: authCode.user_id,
      meta_access_token: metaCredentials.access_token,
      ad_account_ids: metaCredentials.ad_account_ids || []
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in mcp-auth-exchange function:', error)
    return new Response(
      JSON.stringify({ error: 'server_error', error_description: error.message || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
