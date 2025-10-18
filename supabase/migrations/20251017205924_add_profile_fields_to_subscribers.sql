-- Adicionar campos de perfil em subscribers
ALTER TABLE subscribers
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'past_due', 'canceled'));

-- Comentários descritivos
COMMENT ON COLUMN subscribers.name IS 'Nome do usuário';
COMMENT ON COLUMN subscribers.avatar_url IS 'URL da foto de perfil';
COMMENT ON COLUMN subscribers.whatsapp_connected IS 'Indica se o usuário autenticou seu WhatsApp';
COMMENT ON COLUMN subscribers.whatsapp_phone IS 'Número do WhatsApp autenticado (formato internacional)';
COMMENT ON COLUMN subscribers.stripe_subscription_id IS 'ID da subscription no Stripe';
COMMENT ON COLUMN subscribers.subscription_status IS 'Status detalhado da assinatura';
