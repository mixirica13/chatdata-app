import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body to get the priceId
    const requestBody = await req.json();
    const priceId = requestBody.priceId || "price_1SWm28A76CJavEvOTQu7kLC1"; // Default to Basic plan

    logStep("Price ID received", { priceId });

    // Verificar se usuário já teve assinatura (para bloquear trial)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: subscriberData } = await supabaseAdmin
      .from('subscribers')
      .select('stripe_subscription_id, subscription_tier')
      .eq('user_id', user.id)
      .single();

    const hasHadSubscription = subscriberData?.stripe_subscription_id !== null;
    logStep("Subscription history checked", {
      hasHadSubscription,
      currentTier: subscriberData?.subscription_tier
    });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2024-11-20.acacia"
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;

    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    } else {
      logStep("No customer found, will create on checkout");
    }

    // Definir trial: 7 dias para Basic, apenas se nunca teve assinatura
    const BASIC_PRICE_ID = "price_1SWm28A76CJavEvOTQu7kLC1";
    const isBasicPlan = priceId === BASIC_PRICE_ID;
    const shouldHaveTrial = isBasicPlan && !hasHadSubscription;
    const trialDays = shouldHaveTrial ? 7 : 0;

    logStep("Trial configuration", {
      isBasicPlan,
      hasHadSubscription,
      shouldHaveTrial,
      trialDays
    });

    // Criar configuração da sessão
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      payment_method_collection: "always", // Força inserção de cartão mesmo com trial
      success_url: `${req.headers.get("origin")}/dashboard?checkout=success${shouldHaveTrial ? '&trial=true' : ''}`,
      cancel_url: `${req.headers.get("origin")}/dashboard?checkout=canceled`,
      metadata: {
        price_id: priceId,
        user_id: user.id,
        has_trial: shouldHaveTrial.toString(),
      },
    };

    // Adicionar trial apenas se aplicável
    if (shouldHaveTrial) {
      sessionConfig.subscription_data = {
        trial_period_days: trialDays,
        trial_settings: {
          end_behavior: {
            missing_payment_method: 'cancel' // Cancela se não houver cartão
          }
        }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
