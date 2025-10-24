import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CANCEL-SUBSCRIPTION] ${step}${detailsStr}`);
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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil"
    });

    // Buscar o customer do Stripe para este usuário
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      throw new Error("No Stripe customer found for this user");
    }

    const customerId = customers.data[0].id;
    logStep("Customer found", { customerId });

    // Buscar assinaturas ativas do cliente
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found");
    }

    const subscriptionId = subscriptions.data[0].id;
    const subscription = subscriptions.data[0];

    // Buscar current_period_end em múltiplos lugares
    let currentPeriodEnd = subscription.current_period_end;
    if (!currentPeriodEnd && subscription.items?.data?.[0]?.current_period_end) {
      currentPeriodEnd = subscription.items.data[0].current_period_end;
      logStep("Using current_period_end from subscription item", { currentPeriodEnd });
    }

    logStep("Active subscription found", {
      subscriptionId,
      currentPeriodEnd,
      status: subscription.status
    });

    // Cancelar a assinatura no final do período
    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    logStep("Subscription update response", {
      id: canceledSubscription.id,
      cancel_at_period_end: canceledSubscription.cancel_at_period_end,
      current_period_end: canceledSubscription.current_period_end,
      cancel_at: canceledSubscription.cancel_at,
      status: canceledSubscription.status
    });

    // Buscar timestamp em múltiplos lugares (prioridade)
    let periodEndTimestamp = canceledSubscription.current_period_end
      || currentPeriodEnd
      || canceledSubscription.items?.data?.[0]?.current_period_end
      || canceledSubscription.cancel_at;

    logStep("Period end timestamp search", {
      fromCanceledSub: canceledSubscription.current_period_end,
      fromOriginalSub: currentPeriodEnd,
      fromCanceledItems: canceledSubscription.items?.data?.[0]?.current_period_end,
      fromCancelAt: canceledSubscription.cancel_at,
      final: periodEndTimestamp
    });

    if (!periodEndTimestamp || isNaN(periodEndTimestamp)) {
      throw new Error(`Subscription period end date not available. Checked: current_period_end, items.current_period_end, cancel_at - all invalid`);
    }

    const periodEndDate = new Date(periodEndTimestamp * 1000).toISOString();

    logStep("Subscription canceled", {
      subscriptionId,
      cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
      periodEnd: periodEndDate
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Subscription will be canceled at the end of the billing period",
      periodEnd: periodEndDate
    }), {
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
