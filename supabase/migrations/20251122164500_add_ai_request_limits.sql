-- ==========================================
-- Migration: Add AI Request Rate Limiting
-- Adiciona controle de requisições na tabela subscribers
-- ==========================================

-- Adiciona colunas de rate limiting na tabela subscribers
ALTER TABLE subscribers
ADD COLUMN IF NOT EXISTS ai_requests_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_requests_limit INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS ai_requests_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 month');

-- Define limites por tier de assinatura
-- Starter: 500 msgs/mês, Professional: 2000 msgs/mês, Enterprise: ilimitado
UPDATE subscribers
SET ai_requests_limit = CASE
  WHEN subscription_tier = 'starter' THEN 500
  WHEN subscription_tier = 'professional' THEN 2000
  WHEN subscription_tier = 'enterprise' THEN NULL  -- NULL = ilimitado
  ELSE 100  -- free tier ou sem assinatura
END
WHERE ai_requests_limit = 100;  -- só atualiza valores default

-- Índice para performance (queries filtradas por whatsapp_phone)
CREATE INDEX IF NOT EXISTS idx_subscribers_whatsapp_ai
ON subscribers(whatsapp_phone, ai_requests_expires_at);

-- Comentários para documentação
COMMENT ON COLUMN subscribers.ai_requests_count IS 'Contador de requisições AI do período atual';
COMMENT ON COLUMN subscribers.ai_requests_limit IS 'Limite de requisições por período (NULL = ilimitado)';
COMMENT ON COLUMN subscribers.ai_requests_expires_at IS 'Data de expiração do período atual (auto-reset quando passar)';
