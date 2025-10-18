-- Dropar triggers e funções relacionadas à profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Dropar tabela profiles
DROP TABLE IF EXISTS profiles CASCADE;

-- Atualizar trigger para criar subscriber automaticamente
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
    subscribed,
    subscription_status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Novo Usuário'),
    false,
    'inactive'
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
COMMENT ON TABLE subscribers IS 'Tabela consolidada de usuários com informações de perfil e assinatura';
