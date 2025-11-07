# Guia de Integração com Meta Ads

Este guia explica como configurar e usar a integração com o Facebook Login para Empresas e a API de Marketing da Meta.

## Pré-requisitos

1. **Criar um App na Meta for Developers**
   - Acesse https://developers.facebook.com/apps/
   - Clique em "Create App" (Criar App)
   - Escolha o tipo "Business" ou "Consumer"
   - Preencha as informações básicas do app

2. **Configurar Facebook Login**
   - No dashboard do app, vá em "Add Products" (Adicionar Produtos)
   - Adicione "Facebook Login"
   - Em "Settings" > "Facebook Login", configure:
     - Valid OAuth Redirect URIs: `http://localhost:5173/connect-meta` (desenvolvimento) e `https://seu-dominio.com/connect-meta` (produção)

3. **Configurar Marketing API**
   - No dashboard do app, adicione "Marketing API"
   - Isso permite acesso às contas de anúncios

4. **Obter Credenciais**
   - App ID: Disponível no dashboard principal
   - App Secret: Em "Settings" > "Basic"

## Configuração do Projeto

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (use `.env.example` como referência):

```env
VITE_META_APP_ID=seu_app_id
VITE_META_APP_SECRET=seu_app_secret
VITE_META_API_VERSION=v24.0
VITE_META_REDIRECT_URI=http://localhost:5173/connect-meta
VITE_META_PERMISSIONS=ads_management,ads_read,business_management,pages_read_engagement
```

### 2. Configurar Modo de Teste

**IMPORTANTE**: Para testar o app antes de enviá-lo para revisão da Meta:

1. No dashboard do app, vá em "Roles" > "Test Users"
2. Adicione os usuários que precisam testar o app
3. Ou adicione usuários em "Roles" > "Roles" como desenvolvedores/testadores

Apenas esses usuários poderão fazer login enquanto o app estiver em modo de desenvolvimento.

### 3. Permissões Necessárias

O app solicita as seguintes permissões:

- **ads_management**: Gerenciar campanhas e anúncios
- **ads_read**: Ler dados de campanhas e anúncios
- **business_management**: Gerenciar Business Manager
- **pages_read_engagement**: Ler engajamento de páginas

### 4. Migrations do Supabase

Execute a migration para criar as tabelas necessárias:

```bash
cd supabase
npx supabase db push
```

Ou se estiver usando o Supabase localmente:

```bash
npx supabase migration up
```

### 5. Deploy da Edge Function

Deploy a função Edge para armazenar tokens de forma segura:

```bash
npx supabase functions deploy store-meta-token
```

## Fluxo de Autenticação

### Modo de Teste (Development)

1. Usuário clica em "Conectar com Meta"
2. Facebook SDK abre popup de login
3. Usuário faz login e autoriza as permissões
4. App recebe access token (válido por ~2 horas)
5. App busca contas de anúncios via Graph API
6. Usuário seleciona quais contas quer conectar
7. Token e dados são salvos no Supabase

### Modo de Produção

Após aprovação do app pela Meta:

1. Mesmo fluxo do modo de teste
2. Qualquer usuário pode fazer login (não apenas testadores)
3. Recomenda-se trocar tokens curtos por tokens de longa duração
4. Considere usar System User Tokens para serviços server-side

## Como Obter Access Tokens das Contas de Anúncios

### 1. User Access Token (Modo Cliente)

```javascript
import { useFacebookLogin } from '@/hooks/useFacebookLogin';
import { createMetaGraphAPI } from '@/lib/metaGraphAPI';

// No componente
const { login, authResponse } = useFacebookLogin();

// Fazer login
await login();

// Usar o token
if (authResponse) {
  const api = createMetaGraphAPI(authResponse.accessToken);
  const adAccounts = await api.getAdAccounts();
}
```

### 2. Trocar por Long-Lived Token

```javascript
const api = createMetaGraphAPI(shortLivedToken);
const longLivedTokenData = await api.exchangeToken();
// longLivedTokenData.access_token válido por ~60 dias
```

### 3. System User Token (Recomendado para Produção)

Para operações server-side que não expiram:

1. No Business Manager, crie um System User
2. Gere um token para esse System User
3. Use esse token em suas operações de backend

Veja a documentação da Meta: https://developers.facebook.com/docs/marketing-api/system-users

## Integração com MCP Server

O projeto inclui uma Edge Function que armazena os tokens de forma segura:

```typescript
const { error } = await supabase.functions.invoke('store-meta-token', {
  body: {
    access_token: authResponse.accessToken,
    user_id: authResponse.userID,
    expires_at: expiresAt.toISOString(),
    granted_scopes: authResponse.grantedScopes?.split(',') || [],
    ad_accounts: selectedAccountDetails,
  },
});
```

**SEGURANÇA**: Em produção, você deve:
1. Criptografar os access tokens antes de armazená-los
2. Usar um serviço de vault para gerenciar chaves de criptografia
3. Considerar usar System User Tokens que não expiram
4. Implementar refresh token flow para tokens de longa duração

## Buscar Dados da Marketing API

Após ter o access token, você pode buscar dados das contas de anúncios:

```javascript
const api = createMetaGraphAPI(accessToken);

// Buscar contas de anúncios
const accounts = await api.getAdAccounts();

// Buscar informações do usuário
const userInfo = await api.getUserInfo();

// Buscar Business Managers
const businesses = await api.getBusinesses();
```

Para operações mais avançadas, use a Graph API diretamente:

```javascript
import { getFacebookSDK } from '@/lib/facebookSDK';

const FB = await getFacebookSDK();

FB.api(
  '/act_<ACCOUNT_ID>/campaigns',
  'GET',
  {
    access_token: accessToken,
    fields: 'id,name,status,objective,daily_budget'
  },
  (response) => {
    console.log('Campaigns:', response.data);
  }
);
```

## Preparação para Produção

Antes de enviar o app para revisão da Meta:

1. **App Review**
   - No dashboard do app, vá em "App Review"
   - Solicite aprovação para as permissões necessárias
   - Forneça detalhes sobre como seu app usa cada permissão
   - Grave um vídeo demonstrando o uso

2. **Privacy Policy & Terms**
   - Configure URLs para Política de Privacidade
   - Configure URLs para Termos de Serviço
   - Configure URL para Data Deletion Instructions

3. **Segurança**
   - Ative "Require App Secret" em Settings > Advanced
   - Implemente `appsecret_proof` em todas as chamadas de API
   - Use HTTPS em produção
   - Criptografe tokens antes de armazenar

4. **Business Verification**
   - Verifique seu Business Manager
   - Isso é necessário para aprovar permissões avançadas

## Troubleshooting

### "This app is in development mode"
- Adicione o usuário como testador em Roles > Test Users

### "User hasn't authorized the app"
- Verifique se as permissões estão corretas
- Tente `auth_type: 'rerequest'` para solicitar novamente

### "Invalid OAuth redirect URI"
- Verifique se a URL está configurada em Facebook Login Settings
- Certifique-se de que a URL corresponde exatamente (incluindo protocolo e porta)

### "No ad accounts found"
- Verifique se o usuário tem acesso a contas de anúncios no Business Manager
- Confirme que as permissões `ads_read` foram concedidas

## Recursos Úteis

- [Meta Marketing API Documentation](https://developers.facebook.com/docs/marketing-api)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- [Business Manager](https://business.facebook.com/)

## Próximos Passos

1. **Implementar Token Refresh**: Configure um cron job para renovar tokens antes de expirarem
2. **Webhook Integration**: Configure webhooks para receber atualizações em tempo real
3. **Error Handling**: Implemente tratamento robusto de erros da API
4. **Rate Limiting**: Implemente controle de taxa para evitar limites da API
5. **Monitoring**: Configure logging e monitoring para rastrear uso da API
