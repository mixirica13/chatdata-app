-- Migration: Adicionar suporte para trials de 7 dias
-- Data: 2025-11-23
-- Descrição: Adiciona coluna subscription_status e garante suporte ao status 'trialing'

-- Adicionar coluna subscription_status se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscribers'
    AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE subscribers
    ADD COLUMN subscription_status TEXT
    CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'past_due', 'canceled'))
    DEFAULT 'inactive';

    COMMENT ON COLUMN subscribers.subscription_status IS
    'Status da assinatura no Stripe: active, inactive, trialing, past_due, canceled';
  END IF;
END $$;

-- Remover constraint antiga se existir e recriar com suporte a 'trialing'
ALTER TABLE subscribers
DROP CONSTRAINT IF EXISTS subscribers_subscription_status_check;

ALTER TABLE subscribers
ADD CONSTRAINT subscribers_subscription_status_check
CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'past_due', 'canceled'));

-- Atualizar assinaturas existentes para ter status correto
-- Se está subscribed e não tem status, definir como 'active'
UPDATE subscribers
SET subscription_status = 'active'
WHERE subscribed = true
AND (subscription_status IS NULL OR subscription_status = 'inactive');

-- Se não está subscribed, definir como 'inactive'
UPDATE subscribers
SET subscription_status = 'inactive'
WHERE subscribed = false
AND (subscription_status IS NULL OR subscription_status NOT IN ('inactive', 'canceled'));

-- Criar índice para melhorar performance de queries por status
CREATE INDEX IF NOT EXISTS idx_subscribers_subscription_status
ON subscribers(subscription_status);

-- Criar índice composto para queries comuns (status + tier)
CREATE INDEX IF NOT EXISTS idx_subscribers_status_tier
ON subscribers(subscription_status, subscription_tier);

-- Comentário na tabela
COMMENT ON TABLE subscribers IS
'Tabela de assinantes com suporte a trials de 7 dias no plano Basic';
