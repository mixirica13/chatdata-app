-- Corrigir função handle_new_subscriber para suportar OAuth do Google
-- O Google retorna o nome em 'full_name' ao invés de 'name'
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
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      'Novo Usuário'
    ),
    NEW.raw_user_meta_data->>'whatsapp',
    false
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Garantir que o trigger existe
DROP TRIGGER IF EXISTS on_auth_user_created_subscriber ON auth.users;
CREATE TRIGGER on_auth_user_created_subscriber
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_subscriber();

-- Comentário
COMMENT ON FUNCTION public.handle_new_subscriber() IS 'Cria automaticamente um registro em subscribers quando um novo usuário se registra (suporta OAuth Google)';
