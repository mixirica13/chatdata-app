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
    // Adicione aqui os IDs dos preços do Stripe para cada plano
    'price_1SWm28A76CJavEvOTQu7kLC1': 'basic',      // 50 requisições/dia
    'price_1SWlyAA76CJavEvOEXapiskH': 'pro',          // 100 requisições/dia
    'price_1SWlxaA76CJavEvOS0FdYuNb': 'agency',    // Ilimitado
    'price_1SGWsuPP0f85Y8YeWAxdErjJ': 'premium' // legacy
  };
  const result = planMap[priceId] || 'free';
  console.log(`Resultado do mapeamento: ${result}`);
  return result;
}

// Função para obter o limite de requisições baseado no tier
function getRequestLimit(tier) {
  const limits = {
    'basic': 50,
    'pro': 100,
    'agency': 999999,
    'premium': 2000,      // Legacy
    'starter': 500,       // Legacy
    'professional': 2000, // Legacy
    'enterprise': 999999, // Legacy
    'free': 10
  };
  const limit = limits[tier] || 10;
  console.log(`Limite de requisições para tier ${tier}: ${limit}`);
  return limit;
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
          console.log(`Subscription ID: ${session.subscription}`);

          // Obter detalhes do cliente
          const customer = await stripe.customers.retrieve(session.customer);
          console.log(`Cliente: ${JSON.stringify(customer)}`);

          // Buscar a assinatura real para obter a data correta e verificar trial
          let subscriptionEnd;
          let subscriptionStatus = 'active';
          let stripeSubscriptionId = null;

          if (session.subscription) {
            try {
              const subscription = await stripe.subscriptions.retrieve(session.subscription);
              stripeSubscriptionId = subscription.id;
              subscriptionStatus = subscription.status; // 'trialing' ou 'active'

              console.log(`Status da assinatura: ${subscriptionStatus}`);
              console.log(`Trial end: ${subscription.trial_end}`);

              // Se estiver em trial, usar trial_end como data de término
              // Caso contrário, usar current_period_end
              if (subscriptionStatus === 'trialing' && subscription.trial_end) {
                subscriptionEnd = new Date(subscription.trial_end * 1000).toISOString();
                console.log(`Trial ativo - Data de término do trial: ${subscriptionEnd}`);
              } else if (subscription.current_period_end) {
                subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
                console.log(`Data de término da assinatura: ${subscriptionEnd}`);
              } else {
                console.warn(`current_period_end não encontrado, usando data padrão de 30 dias`);
                subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
              }
            } catch (err) {
              console.error(`Erro ao buscar assinatura: ${err.message}, usando data padrão`);
              subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            }
          } else {
            console.warn(`Nenhuma assinatura encontrada na sessão, usando data padrão de 30 dias`);
            subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          }

          // Atualizar ou inserir registro na tabela subscribers
          const tier = getPlanTier(session.metadata.price_id);
          const { error } = await supabase.from('subscribers').upsert({
            user_id: session.client_reference_id,
            email: customer.email,
            stripe_customer_id: session.customer,
            stripe_subscription_id: stripeSubscriptionId,
            subscribed: true, // Tem acesso mesmo durante trial
            subscription_status: subscriptionStatus,
            subscription_tier: tier,
            ai_requests_limit: getRequestLimit(tier),
            subscription_end: subscriptionEnd,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
          if (error) {
            console.error(`Erro ao atualizar assinatura: ${error.message}`);
            throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
          } else {
            console.log(`Assinatura atualizada com sucesso para o usuário: ${session.client_reference_id} (Status: ${subscriptionStatus})`);
          }
          break;
        }
      case "customer.subscription.updated":
        {
          const subscription = event.data.object;
          // Retrieve customer details
          const customer = await stripe.customers.retrieve(subscription.customer);
          console.log(`Assinatura atualizada para cliente: ${JSON.stringify(customer)}`);
          console.log(`Status da assinatura: ${subscription.status}`);

          // Obter o ID do preço da assinatura
          const priceId = subscription.items.data[0].price.id;
          console.log(`ID do preço na assinatura atualizada: ${priceId}`);

          // Verificar status da assinatura (trialing, active, canceled, etc.)
          const subscriptionStatus = subscription.status;
          const isActive = ['active', 'trialing'].includes(subscriptionStatus);

          // Buscar data de término em múltiplos lugares (com validação)
          let subscriptionEnd;
          let periodEndTimestamp = null;

          // Se estiver em trial, usar trial_end
          if (subscriptionStatus === 'trialing' && subscription.trial_end) {
            periodEndTimestamp = subscription.trial_end;
            console.log(`Trial ativo - usando trial_end: ${periodEndTimestamp}`);
          }
          // Caso contrário, usar current_period_end
          else if (subscription.current_period_end && !isNaN(subscription.current_period_end)) {
            periodEndTimestamp = subscription.current_period_end;
            console.log(`Usando current_period_end do subscription: ${periodEndTimestamp}`);
          } else if (subscription.items?.data?.[0]?.current_period_end) {
            periodEndTimestamp = subscription.items.data[0].current_period_end;
            console.log(`Usando current_period_end do subscription item: ${periodEndTimestamp}`);
          } else if (subscription.cancel_at && !isNaN(subscription.cancel_at)) {
            periodEndTimestamp = subscription.cancel_at;
            console.log(`Usando cancel_at: ${periodEndTimestamp}`);
          }

          if (periodEndTimestamp && !isNaN(periodEndTimestamp)) {
            subscriptionEnd = new Date(periodEndTimestamp * 1000).toISOString();
            console.log(`Data de término final: ${subscriptionEnd}`);
          } else {
            console.warn(`Nenhum timestamp válido encontrado, usando data padrão de 30 dias`);
            subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          }

          // Buscar o usuário pelo customer_id
          const { data: subscribers, error: fetchError } = await supabase.from('subscribers').select('user_id').eq('stripe_customer_id', subscription.customer).limit(1);
          if (fetchError || !subscribers || subscribers.length === 0) {
            console.error(`Usuário não encontrado para customer_id: ${subscription.customer}`);
            break;
          }
          const userId = subscribers[0].user_id;
          // Atualizar o registro na tabela subscribers
          const tier = getPlanTier(priceId);
          const { error } = await supabase.from('subscribers').upsert({
            user_id: userId,
            email: customer.email,
            stripe_customer_id: subscription.customer,
            stripe_subscription_id: subscription.id,
            subscribed: isActive,
            subscription_status: subscriptionStatus,
            subscription_tier: tier,
            ai_requests_limit: getRequestLimit(tier),
            subscription_end: subscriptionEnd,
            cancel_at_period_end: subscription.cancel_at_period_end || false,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
          if (error) {
            console.error(`Erro ao atualizar assinatura: ${error.message}`);
            throw new Error(`Erro ao atualizar assinatura: ${error.message}`);
          } else {
            console.log(`Assinatura atualizada com sucesso para o usuário: ${userId} (Status: ${subscriptionStatus})`);
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

            // Buscar data de término em múltiplos lugares (com validação)
            let subscriptionEnd;
            let periodEndTimestamp = null;

            // Tentar obter de diferentes locais
            if (subscription.current_period_end && !isNaN(subscription.current_period_end)) {
              periodEndTimestamp = subscription.current_period_end;
              console.log(`Usando current_period_end do subscription: ${periodEndTimestamp}`);
            } else if (subscription.items?.data?.[0]?.current_period_end) {
              periodEndTimestamp = subscription.items.data[0].current_period_end;
              console.log(`Usando current_period_end do subscription item: ${periodEndTimestamp}`);
            } else if (subscription.cancel_at && !isNaN(subscription.cancel_at)) {
              periodEndTimestamp = subscription.cancel_at;
              console.log(`Usando cancel_at: ${periodEndTimestamp}`);
            }

            if (periodEndTimestamp && !isNaN(periodEndTimestamp)) {
              subscriptionEnd = new Date(periodEndTimestamp * 1000).toISOString();
              console.log(`Data de término final na fatura: ${subscriptionEnd}`);
            } else {
              console.warn(`Nenhum timestamp válido encontrado na fatura, usando data padrão`);
              subscriptionEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            }

            // Buscar o usuário pelo customer_id
            const { data: subscribers, error: fetchError } = await supabase.from('subscribers').select('user_id').eq('stripe_customer_id', invoice.customer).limit(1);
            if (fetchError || !subscribers || subscribers.length === 0) {
              console.error(`Usuário não encontrado para customer_id: ${invoice.customer}`);
              break;
            }
            const userId = subscribers[0].user_id;
            // Atualizar o registro na tabela subscribers
            const tier = getPlanTier(priceId);
            const { error } = await supabase.from('subscribers').upsert({
              user_id: userId,
              email: customer.email,
              stripe_customer_id: invoice.customer,
              subscribed: true,
              subscription_tier: tier,
              ai_requests_limit: getRequestLimit(tier),
              subscription_end: subscriptionEnd,
              cancel_at_period_end: subscription.cancel_at_period_end || false,
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
