# Quick Start - Integração Meta Ads

Guia rápido para começar a testar a integração com Meta Ads.

## Passos Rápidos

### 1. Configurar App na Meta (5 minutos)

1. Acesse https://developers.facebook.com/apps/
2. Crie um novo app (tipo Business ou Consumer)
3. Adicione **Facebook Login** e **Marketing API** como produtos
4. Em **Settings > Basic**, copie:
   - App ID
   - App Secret

### 2. Configurar Projeto (2 minutos)

1. Copie `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Cole suas credenciais:
   ```env
   VITE_META_APP_ID=seu_app_id
   VITE_META_APP_SECRET=seu_app_secret
   VITE_META_API_VERSION=v24.0
   VITE_META_REDIRECT_URI=http://localhost:5173/connect-meta
   VITE_META_PERMISSIONS=ads_management,ads_read,business_management,pages_read_engagement
   ```

3. Configure URLs de redirecionamento no Meta App:
   - Vá em **Facebook Login > Settings**
   - Adicione em **Valid OAuth Redirect URIs**:
     ```
     http://localhost:5173/connect-meta
     ```

### 3. Configurar Banco de Dados (3 minutos)

1. Execute a migration:
   ```bash
   cd supabase
   npx supabase db push
   ```

2. Deploy da Edge Function:
   ```bash
   npx supabase functions deploy store-meta-token
   ```

### 4. Adicionar Testador (2 minutos)

No dashboard do Meta App:

1. Vá em **Roles > Roles**
2. Adicione você mesmo como **Developer** ou **Administrator**
3. Ou vá em **Roles > Test Users** para criar usuários de teste

⚠️ **Importante**: Usuários de teste não têm contas de anúncios. Use sua conta real como desenvolvedor.

### 5. Testar! (1 minuto)

1. Inicie o app:
   ```bash
   npm run dev
   ```

2. Acesse http://localhost:5173/connect-meta

3. Clique em **"Conectar com Meta"**

4. Faça login e autorize as permissões

5. Selecione contas de anúncios e confirme

## Pronto! 🎉

Agora você pode:
- Ver suas contas de anúncios conectadas
- Buscar dados da Marketing API
- Desenvolver features usando os hooks e APIs criados

## Próximos Passos

- 📖 Leia o [Guia Completo de Integração](./META_INTEGRATION_GUIDE.md)
- 🔧 Veja o [Guia de Configuração do App](./SETUP_META_APP.md)
- 🚀 Prepare para produção seguindo as orientações de segurança

## Problemas?

### App em modo de desenvolvimento
✅ Adicione-se como testador em **Roles**

### Nenhuma conta de anúncios
✅ Use sua conta real como desenvolvedor (não usuário de teste)

### Invalid redirect URI
✅ Verifique se a URL está exata em **Facebook Login > Settings**

### Outros problemas
📚 Consulte a seção de Troubleshooting no [Setup Guide](./SETUP_META_APP.md)
