import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MetaTokenRequest {
  access_token: string
  user_id: string
  expires_at: string
  granted_scopes: string[]
  ad_accounts: Array<{
    id: string
    account_id: string
    name: string
    currency: string
    business?: {
      id: string
      name: string
    }
  }>
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with the service role key
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
    const body: MetaTokenRequest = await req.json()

    // Validate required fields
    if (!body.access_token || !body.user_id || !body.expires_at || !body.ad_accounts) {
      throw new Error('Missing required fields')
    }

    // TODO: In production, encrypt the access token before storing
    // For now, we'll store it directly, but in production you should:
    // 1. Use a proper encryption library
    // 2. Store the encryption key in a secure vault (not in environment variables)
    // 3. Consider using Meta's system user tokens which don't expire

    // Store the Meta connection data
    const { data: connectionData, error: connectionError } = await supabaseClient
      .from('meta_connections')
      .upsert({
        user_id: user.id,
        meta_user_id: body.user_id,
        access_token: body.access_token, // TODO: Encrypt this
        expires_at: body.expires_at,
        granted_scopes: body.granted_scopes,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (connectionError) {
      console.error('Error storing connection:', connectionError)
      throw connectionError
    }

    // Store ad accounts
    for (const account of body.ad_accounts) {
      const { error: accountError } = await supabaseClient
        .from('meta_ad_accounts')
        .upsert({
          user_id: user.id,
          account_id: account.account_id,
          ad_account_id: account.id,
          name: account.name,
          currency: account.currency,
          business_id: account.business?.id || null,
          business_name: account.business?.name || null,
          updated_at: new Date().toISOString(),
        })

      if (accountError) {
        console.error('Error storing ad account:', accountError)
        // Continue with other accounts even if one fails
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Meta connection stored successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in store-meta-token function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
