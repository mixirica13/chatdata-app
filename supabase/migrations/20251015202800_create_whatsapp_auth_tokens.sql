-- Tabela para armazenar tokens de autenticação via WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  used BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used_at TIMESTAMP WITH TIME ZONE
);

-- Índices para melhorar performance
CREATE INDEX idx_whatsapp_auth_tokens_token ON whatsapp_auth_tokens(token);
CREATE INDEX idx_whatsapp_auth_tokens_phone ON whatsapp_auth_tokens(phone);
CREATE INDEX idx_whatsapp_auth_tokens_expires_at ON whatsapp_auth_tokens(expires_at);

-- Função para limpar tokens expirados automaticamente
CREATE OR REPLACE FUNCTION clean_expired_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM whatsapp_auth_tokens
  WHERE expires_at < NOW() OR (used = TRUE AND used_at < NOW() - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS)
ALTER TABLE whatsapp_auth_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas o sistema pode inserir tokens
CREATE POLICY "Service role can insert tokens" ON whatsapp_auth_tokens
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Apenas o sistema pode ler tokens
CREATE POLICY "Service role can read tokens" ON whatsapp_auth_tokens
  FOR SELECT
  USING (auth.role() = 'service_role');

-- Policy: Apenas o sistema pode atualizar tokens
CREATE POLICY "Service role can update tokens" ON whatsapp_auth_tokens
  FOR UPDATE
  USING (auth.role() = 'service_role');

COMMENT ON TABLE whatsapp_auth_tokens IS 'Tokens de autenticação via WhatsApp Magic Link';
