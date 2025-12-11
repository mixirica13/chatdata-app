-- Adicionar coluna phone para armazenar o telefone do cadastro
ALTER TABLE subscribers
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Comentário descritivo
COMMENT ON COLUMN subscribers.phone IS 'Número de telefone informado no cadastro (formato internacional)';

-- Atualizar trigger para salvar o telefone do cadastro na coluna phone
-- e manter whatsapp_phone apenas para o número autenticado via WhatsApp
CREATE OR REPLACE FUNCTION public.handle_new_subscriber()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscribers (
    user_id,
    email,
    name,
    phone,
    subscribed
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'),
    NEW.raw_user_meta_data->>'whatsapp',
    false
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Comentário atualizado
COMMENT ON FUNCTION public.handle_new_subscriber() IS 'Cria automaticamente um registro em subscribers quando um novo usuário se registra. Salva o telefone do cadastro em phone e mantém whatsapp_phone para o número autenticado.';
