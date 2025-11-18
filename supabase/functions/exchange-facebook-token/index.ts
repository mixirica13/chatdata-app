import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExchangeTokenRequest {
  short_lived_token: string
  ad_account_ids: string[]
  granted_permissions: string[]
}

interface FacebookTokenResponse {
  access_token: string
  token_type: string
  expires_in?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const body: ExchangeTokenRequest = await req.json()

    if (!body.short_lived_token) {
      throw new Error('Missing short_lived_token')
    }

    // Get Meta App credentials from environment
    const appId = Deno.env.get('META_APP_ID')
    const appSecret = Deno.env.get('META_APP_SECRET')

    if (!appId || !appSecret) {
      throw new Error('Meta App credentials not configured')
    }

    console.log('Exchanging short-lived token for long-lived token...')

    // Exchange short-lived token for long-lived token (60 days)
    // https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived
    const exchangeUrl = new URL('https://graph.facebook.com/v22.0/oauth/access_token')
    exchangeUrl.searchParams.set('grant_type', 'fb_exchange_token')
    exchangeUrl.searchParams.set('client_id', appId)
    exchangeUrl.searchParams.set('client_secret', appSecret)
    exchangeUrl.searchParams.set('fb_exchange_token', body.short_lived_token)

    const exchangeResponse = await fetch(exchangeUrl.toString())
    const exchangeData: FacebookTokenResponse = await exchangeResponse.json()

    if (!exchangeResponse.ok || !exchangeData.access_token) {
      console.error('Token exchange failed:', exchangeData)
      throw new Error('Failed to exchange token with Facebook')
    }

    console.log('Token exchanged successfully')

    // Calculate expiration date (default 60 days for long-lived tokens)
    const expiresIn = exchangeData.expires_in || 5184000 // 60 days in seconds
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    console.log(`Token expires at: ${expiresAt.toISOString()}`)

    // Store the long-lived token in meta_credentials table
    const { data: credentialData, error: credentialError } = await supabaseClient
      .from('meta_credentials')
      .upsert({
        user_id: user.id,
        access_token: exchangeData.access_token,
        token_type: 'long_lived',
        expires_at: expiresAt.toISOString(),
        ad_account_ids: body.ad_account_ids || [],
        granted_permissions: body.granted_permissions || [],
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (credentialError) {
      console.error('Error storing credentials:', credentialError)
      throw new Error(`Failed to store credentials: ${credentialError.message}`)
    }

    console.log('Credentials stored successfully')

    // Update meta_connected flag in subscribers table
    const { error: subscriberError } = await supabaseClient
      .from('subscribers')
      .update({ meta_connected: true })
      .eq('user_id', user.id)

    if (subscriberError) {
      console.error('Error updating subscriber meta_connected flag:', subscriberError)
      // Don't throw error, just log it - credentials are already saved
    } else {
      console.log('Subscriber meta_connected flag updated successfully')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Token exchanged and stored successfully',
        expires_at: expiresAt.toISOString(),
        ad_account_count: body.ad_account_ids?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in exchange-facebook-token function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
