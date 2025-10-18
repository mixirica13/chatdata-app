-- Remover coluna subscription_status da tabela subscribers
ALTER TABLE subscribers DROP COLUMN IF EXISTS subscription_status;

-- Comentário
COMMENT ON TABLE subscribers IS 'Tabela consolidada de usuários - usa coluna subscribed (boolean) para status de assinatura';
