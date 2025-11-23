-- Script para corrigir limite do plano Basic
-- Execute este script manualmente no SQL Editor do Supabase

-- Ver todos os usuários com plano basic e seus limites
SELECT
  user_id,
  email,
  subscription_tier,
  ai_requests_limit,
  ai_requests_count,
  subscribed,
  subscription_end
FROM subscribers
WHERE subscription_tier = 'basic';

-- Corrigir limites do plano Basic para 50 requisições
UPDATE subscribers
SET ai_requests_limit = 50
WHERE subscription_tier = 'basic' AND ai_requests_limit != 50;

-- Verificar se foi corrigido
SELECT
  user_id,
  email,
  subscription_tier,
  ai_requests_limit,
  'Corrigido!' as status
FROM subscribers
WHERE subscription_tier = 'basic';
