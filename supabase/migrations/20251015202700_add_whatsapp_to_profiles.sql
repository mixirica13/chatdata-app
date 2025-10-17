-- Adicionar campos de WhatsApp na tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS whatsapp_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_phone VARCHAR(20);

-- Comentários descritivos
COMMENT ON COLUMN profiles.whatsapp_connected IS 'Indica se o usuário autenticou seu WhatsApp';
COMMENT ON COLUMN profiles.whatsapp_phone IS 'Número do WhatsApp autenticado (formato internacional)';
