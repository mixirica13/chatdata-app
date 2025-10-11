// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient()
});
const supabase = createClient(supabaseUrl, supabaseServiceKey);
// Função para mapear o ID do preço ao nome do plano
function getPlanTier(priceId) {
  console.log(`Mapeando ID de preço: ${priceId}`);
  const planMap = {
    'price_1SGWsuPP0f85Y8YeWAxdErjJ': 'premium'
  };
  const result = planMap[priceId] || 'unknown';
  console.log(`Resultado do mapeamento: ${result}`);
  return result;
}
serve(async (req)=>{
  // CORS headers para OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Stripe-Signature"
      },
      status: 204
    });
  }
  try {
    // Verificar se a requisição é do Stripe usando apenas a assinatura do Stripe
    // Não depende da verificação JWT do Supabase
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("Assinatura do Stripe não encontrada");
      return new Response(JSON.stringify({
        error: "Assinatura do Stripe não encontrada"
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    // Obter o corpo da requisição como texto
    const body = await req.text();
    console.log(`Webhook recebido: ${body.substring(0, 100)}...`);
    // Verificar a assinatura do webhook
    let event;
    try {
      // Usar a versão assíncrona para evitar erro de contexto de criptografia
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (err) {
      console.error(`Erro na verificação da assinatura: ${err.message}`);
      return new Response(JSON.stringify({
        error: `Erro na verificação da assinatura: ${err.message}`
      }), {
        status: 400,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    console.log(`Evento processado: ${event.type}`);
    // Processar eventos diferentes
    switch(event.type){
      case "checkout.session.completed":
        {
          const session = event.data.object;
          console.log(`Checkout completado: ${session.id}`);
          console.log(`Metadata da sessão: ${JSON.stringify(session.metadata)}`);
          console.log(`Price ID na metadata: ${session.metadata?.price_id}`);
          // Obter detalhes do cliente
          const customer = await stripe.customers.retrieve(session.customer);
          console.log(`Cliente: ${JSON.stringify(customer)}`);
          // Atualizar ou inserir registro na tabela subscribers
          const { error } = await supabase.from('subscribers').upsert({
            user_id: session.client_reference_id,
            email: customer.email,
            stripe_customer_id: session.customer,
            subscribed: true,
            subscription_tier: getPlanTier(session.metadata.price_id),
            subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
          if (error) {
            console.error(`Erro ao atualizar assinatura: ${error.message}`);
            throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
          } else {
            console.log(`Assinatura atualizada com sucesso para o usuário: ${session.client_reference_id}`);
          }
          break;
        }
      case "customer.subscription.updated":
        {
          const subscription = event.data.object;
          // Retrieve customer details
          const customer = await stripe.customers.retrieve(subscription.customer);
          console.log(`Assinatura atualizada para cliente: ${JSON.stringify(customer)}`);
          // Obter o ID do preço da assinatura
          const priceId = subscription.items.data[0].price.id;
          console.log(`ID do preço na assinatura atualizada: ${priceId}`);
          // Verificar se a assinatura está ativa
          const isActive = subscription.status === 'active';
          // Calcular a data de término com base no período atual
          const subscriptionEnd = new Date(subscription.current_period_end * 1000);
          // Buscar o usuário pelo customer_id
          const { data: subscribers, error: fetchError } = await supabase.from('subscribers').select('user_id').eq('stripe_customer_id', subscription.customer).limit(1);
          if (fetchError || !subscribers || subscribers.length === 0) {
            console.error(`Usuário não encontrado para customer_id: ${subscription.customer}`);
            break;
          }
          const userId = subscribers[0].user_id;
          // Atualizar o registro na tabela subscribers
          const { error } = await supabase.from('subscribers').upsert({
            user_id: userId,
            email: customer.email,
            stripe_customer_id: subscription.customer,
            subscribed: isActive,
            subscription_tier: getPlanTier(priceId),
            subscription_end: subscriptionEnd.toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
          if (error) {
            console.error(`Erro ao atualizar assinatura: ${error.message}`);
            throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
          } else {
            console.log(`Assinatura atualizada com sucesso para o usuário: ${userId}`);
          }
          break;
        }
      case "customer.subscription.deleted":
        {
          const subscription = event.data.object;
          // Retrieve customer details
          const customer = await stripe.customers.retrieve(subscription.customer);
          console.log(`Assinatura cancelada para cliente: ${JSON.stringify(customer)}`);
          // Buscar o usuário pelo customer_id
          const { data: subscribers, error: fetchError } = await supabase.from('subscribers').select('user_id').eq('stripe_customer_id', subscription.customer).limit(1);
          if (fetchError || !subscribers || subscribers.length === 0) {
            console.error(`Usuário não encontrado para customer_id: ${subscription.customer}`);
            break;
          }
          const userId = subscribers[0].user_id;
          // Atualizar o registro na tabela subscribers
          const { error } = await supabase.from('subscribers').upsert({
            user_id: userId,
            email: customer.email,
            stripe_customer_id: subscription.customer,
            subscribed: false,
            subscription_end: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
          if (error) {
            console.error(`Erro ao atualizar assinatura: ${error.message}`);
            throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
          } else {
            console.log(`Assinatura cancelada com sucesso para o usuário: ${userId}`);
          }
          break;
        }
      case "invoice.payment_succeeded":
        {
          const invoice = event.data.object;
          // Verificar se é uma fatura de assinatura
          if (invoice.subscription) {
            // Retrieve subscription details
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
            console.log(`Detalhes da assinatura na fatura: ${JSON.stringify(subscription.items.data[0])}`);
            // Retrieve customer details
            const customer = await stripe.customers.retrieve(invoice.customer);
            console.log(`Pagamento de fatura bem-sucedido para cliente: ${JSON.stringify(customer)}`);
            // Obter o ID do preço da assinatura
            const priceId = subscription.items.data[0].price.id;
            console.log(`ID do preço na fatura: ${priceId}`);
            // Calcular a data de término com base no período atual
            const subscriptionEnd = new Date(subscription.current_period_end * 1000);
            // Buscar o usuário pelo customer_id
            const { data: subscribers, error: fetchError } = await supabase.from('subscribers').select('user_id').eq('stripe_customer_id', invoice.customer).limit(1);
            if (fetchError || !subscribers || subscribers.length === 0) {
              console.error(`Usuário não encontrado para customer_id: ${invoice.customer}`);
              break;
            }
            const userId = subscribers[0].user_id;
            // Atualizar o registro na tabela subscribers
            const { error } = await supabase.from('subscribers').upsert({
              user_id: userId,
              email: customer.email,
              stripe_customer_id: invoice.customer,
              subscribed: true,
              subscription_tier: getPlanTier(priceId),
              subscription_end: subscriptionEnd.toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id'
            });
            if (error) {
              console.error(`Erro ao atualizar assinatura: ${error.message}`);
              throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
            } else {
              console.log(`Assinatura atualizada após pagamento para o usuário: ${userId}`);
            }
          }
          break;
        }
      default:
        console.log(`Evento não processado: ${event.type}`);
    }
    return new Response(JSON.stringify({
      received: true
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error(`Erro no webhook: ${error.message}`);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
});
