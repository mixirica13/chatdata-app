-- ==========================================
-- Migration: Update Plan Limits for Basic, Pro, and Agency
-- Atualiza os limites de requisições para os novos planos do Stripe
-- ==========================================

-- Atualizar limites de requisições AI por plano
-- Basic: 50 requisições/dia
-- Pro: 100 requisições/dia
-- Agency: Ilimitado (999999)
UPDATE subscribers
SET ai_requests_limit = CASE
  WHEN subscription_tier = 'basic' THEN 50
  WHEN subscription_tier = 'pro' THEN 100
  WHEN subscription_tier = 'agency' THEN 999999  -- Ilimitado (número bem alto)
  WHEN subscription_tier = 'premium' THEN 2000  -- Legacy (manter compatibilidade)
  WHEN subscription_tier = 'starter' THEN 500  -- Legacy
  WHEN subscription_tier = 'professional' THEN 2000  -- Legacy
  WHEN subscription_tier = 'enterprise' THEN 999999  -- Legacy ilimitado
  ELSE 10  -- free tier (limite reduzido para incentivar upgrade)
END;

-- Comentário para documentação
COMMENT ON COLUMN subscribers.ai_requests_limit IS
'Limite de requisições AI por dia: Basic=50, Pro=100, Agency=999999 (ilimitado), Free=10';
