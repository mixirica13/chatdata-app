-- ==========================================
-- Migration: Fix Existing Plan Limits
-- Corrige limites de requisições para usuários já existentes
-- ==========================================

-- Atualizar limites para usuários que já foram criados com valores incorretos
UPDATE subscribers
SET ai_requests_limit = CASE
  WHEN subscription_tier = 'basic' THEN 50
  WHEN subscription_tier = 'pro' THEN 100
  WHEN subscription_tier = 'agency' THEN 999999
  WHEN subscription_tier = 'premium' THEN 2000
  WHEN subscription_tier = 'starter' THEN 500
  WHEN subscription_tier = 'professional' THEN 2000
  WHEN subscription_tier = 'enterprise' THEN 999999
  ELSE 10
END
WHERE
  -- Atualizar apenas usuários que têm valores incorretos
  (subscription_tier = 'basic' AND ai_requests_limit != 50) OR
  (subscription_tier = 'pro' AND ai_requests_limit != 100) OR
  (subscription_tier = 'agency' AND ai_requests_limit != 999999) OR
  (subscription_tier = 'premium' AND ai_requests_limit != 2000) OR
  (subscription_tier = 'starter' AND ai_requests_limit != 500) OR
  (subscription_tier = 'professional' AND ai_requests_limit != 2000) OR
  (subscription_tier = 'enterprise' AND ai_requests_limit != 999999) OR
  (subscription_tier IS NULL AND ai_requests_limit != 10);

-- Log da correção
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Corrigidos % usuários com limites incorretos', updated_count;
END $$;
