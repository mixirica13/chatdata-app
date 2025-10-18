-- Corrigir função handle_new_subscriber para não usar subscription_status e incluir whatsapp_phone
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
    whatsapp_phone,
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

-- Comentário
COMMENT ON FUNCTION public.handle_new_subscriber() IS 'Cria automaticamente um registro em subscribers quando um novo usuário se registra';
