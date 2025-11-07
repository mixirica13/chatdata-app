# Configuração do App na Meta for Developers

Este guia passo a passo mostra como configurar seu app na Meta for Developers para integração com o Meta Ads.

## 1. Criar o App

1. Acesse https://developers.facebook.com/apps/
2. Clique em **"Create App"** (Criar App)
3. Selecione o tipo:
   - **Business** (se você já tem um Business Manager)
   - **Consumer** (se não tem Business Manager)
4. Preencha os detalhes:
   - **App Name**: Nome do seu app (ex: "Meta Aura")
   - **App Contact Email**: Seu email
   - **Business Account**: Selecione ou crie um Business Manager
5. Clique em **"Create App"**

## 2. Configurar Facebook Login

### 2.1 Adicionar Produto

1. No dashboard do app, procure por **"Products"** no menu lateral
2. Encontre **"Facebook Login"** e clique em **"Set Up"**
3. Escolha **"Web"** como plataforma

### 2.2 Configurar URLs

1. Vá em **Settings > Basic**
2. Role até **"App Domains"** e adicione:
   ```
   localhost
   seu-dominio.com
   ```

3. Vá em **Facebook Login > Settings**
4. Em **"Valid OAuth Redirect URIs"**, adicione:
   ```
   http://localhost:5173/connect-meta
   https://seu-dominio.com/connect-meta
   ```

5. Em **"Client OAuth Settings"**:
   - ✅ Enable **"Web OAuth Login"**
   - ✅ Enable **"Enforce HTTPS"** (para produção)

## 3. Configurar Marketing API

### 3.1 Adicionar Produto

1. No dashboard do app, vá em **"Add Products"**
2. Encontre **"Marketing API"** e clique em **"Set Up"**
3. Siga as instruções para configurar

### 3.2 Solicitar Permissões

Para modo de teste, as permissões já estarão disponíveis. Para produção:

1. Vá em **App Review > Permissions and Features**
2. Solicite as seguintes permissões:
   - `ads_management`
   - `ads_read`
   - `business_management`
   - `pages_read_engagement`

3. Para cada permissão, você precisará:
   - Explicar como vai usar
   - Fornecer screenshots
   - Gravar um vídeo demonstrando o uso

## 4. Configurar Modo de Teste

### 4.1 Adicionar Testadores

Enquanto o app estiver em desenvolvimento, apenas testadores autorizados podem fazer login:

1. Vá em **Roles > Test Users**
2. Clique em **"Add Test Users"** para criar usuários de teste
3. Ou vá em **Roles > Roles** e adicione pessoas reais como:
   - **Administrators**: Acesso completo
   - **Developers**: Pode testar o app
   - **Testers**: Pode usar o app em desenvolvimento

### 4.2 Criar Usuário de Teste com Conta de Anúncios

**IMPORTANTE**: Usuários de teste criados pelo Facebook não têm contas de anúncios por padrão.

**Opção 1 - Usar Conta Real (Recomendado para Teste)**:
1. Adicione sua conta real como desenvolvedor
2. Use suas contas de anúncios reais para testar

**Opção 2 - Configurar Conta de Teste**:
1. Crie um Business Manager de teste
2. Configure contas de anúncios de teste
3. Associe ao usuário de teste

## 5. Obter Credenciais

### 5.1 App ID e App Secret

1. Vá em **Settings > Basic**
2. Copie o **App ID**
3. Clique em **"Show"** para ver o **App Secret**
4. Cole esses valores no seu arquivo `.env`:

```env
VITE_META_APP_ID=seu_app_id_aqui
VITE_META_APP_SECRET=seu_app_secret_aqui
```

⚠️ **IMPORTANTE**: Nunca compartilhe o App Secret publicamente!

## 6. Configurar Políticas

### 6.1 Privacy Policy (Obrigatório)

1. Vá em **Settings > Basic**
2. Em **"Privacy Policy URL"**, adicione:
   ```
   https://seu-dominio.com/privacy-policy
   ```

### 6.2 Terms of Service (Obrigatório)

1. Na mesma página, em **"Terms of Service URL"**, adicione:
   ```
   https://seu-dominio.com/terms-of-service
   ```

### 6.3 Data Deletion Instructions (Obrigatório)

1. Em **"User Data Deletion"**, adicione:
   ```
   https://seu-dominio.com/data-deletion
   ```

## 7. Configurações de Segurança Avançadas

### 7.1 Require App Secret

1. Vá em **Settings > Advanced**
2. Na seção **"Security"**
3. ✅ Enable **"Require App Secret"**

Isso obriga que todas as chamadas de API incluam o `appsecret_proof`.

### 7.2 Server IP Whitelist (Opcional)

Para maior segurança em produção:

1. Na mesma seção, adicione os IPs dos seus servidores
2. Isso limita chamadas de API apenas de IPs autorizados

## 8. Testar a Integração

### 8.1 Verificar Configurações

Use as ferramentas da Meta para testar:

1. **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
   - Selecione seu app
   - Teste endpoints como `/me/adaccounts`

2. **Access Token Debugger**: https://developers.facebook.com/tools/debug/accesstoken/
   - Cole um access token
   - Verifique permissões concedidas

### 8.2 Testar Login

1. Execute seu app localmente:
   ```bash
   npm run dev
   ```

2. Vá para http://localhost:5173/connect-meta

3. Clique em "Conectar com Meta"

4. Faça login com:
   - Usuário de teste (se criou)
   - Sua conta (se adicionou como desenvolvedor)

5. Autorize as permissões

6. Verifique se as contas de anúncios aparecem

## 9. Modo de Produção

### 9.1 Tornar o App Público

1. Vá em **Settings > Basic**
2. No topo da página, mude **"App Mode"** de **"Development"** para **"Live"**

⚠️ **ATENÇÃO**: Só faça isso depois de:
- Ter todas as permissões aprovadas
- Configurar políticas (Privacy, Terms, Data Deletion)
- Testar completamente o app

### 9.2 App Review

Para usar em produção com qualquer usuário:

1. Vá em **App Review > Permissions and Features**
2. Para cada permissão necessária:
   - Clique em **"Request"**
   - Preencha o formulário explicando o uso
   - Forneça screenshots da sua interface
   - Grave um vídeo demonstrando o fluxo completo (2-5 minutos)
   - Explique como a permissão beneficia os usuários

3. Aguarde a revisão da Meta (pode levar alguns dias)

### 9.3 Business Verification

Para permissões avançadas (como `business_management`):

1. Vá em **Business Settings** no seu Business Manager
2. Clique em **Security Center**
3. Complete o processo de **Business Verification**
4. Envie documentos solicitados (pode incluir):
   - Documentos da empresa
   - Comprovante de endereço
   - Documentos pessoais do administrador

## 10. Monitoramento

### 10.1 Analytics

1. Vá em **Analytics > Overview** no dashboard do app
2. Monitore:
   - Número de logins
   - Permissões concedidas/negadas
   - Erros de API

### 10.2 Webhooks (Opcional)

Configure webhooks para receber notificações em tempo real:

1. Vá em **Products > Webhooks**
2. Configure para **"Page"** ou **"Instagram"**
3. Adicione sua URL de callback
4. Selecione eventos para monitorar

## 11. Limites e Quotas

### 11.1 Rate Limits

A Marketing API tem limites de taxa:
- **200 calls per hour** por usuário (padrão)
- **4800 calls per day** por usuário

Para limites maiores:
- Verifique seu Business Manager
- Solicite limites aumentados através do suporte

### 11.2 Monitorar Uso

```javascript
// Verificar limite de taxa atual
const api = createMetaGraphAPI(accessToken);
const debugInfo = await api.debugToken();
console.log('Rate limit info:', debugInfo);
```

## Troubleshooting Comum

### "This app is in development mode"
- Adicione o usuário como testador em **Roles**
- Ou mude para modo Live (após aprovação)

### "Invalid redirect URI"
- Verifique a URL exata em **Facebook Login > Settings**
- Inclua protocolo (http:// ou https://)
- Inclua porta se necessária (:5173)

### "Permission not granted"
- Verifique se solicitou a permissão em **App Review**
- Se em modo de teste, permissões estão disponíveis automaticamente

### "No ad accounts found"
- Verifique se o usuário tem contas no Business Manager
- Confirme que `ads_read` foi concedido
- Usuários de teste podem não ter contas de anúncios

## Recursos Úteis

- [App Dashboard](https://developers.facebook.com/apps/)
- [Business Manager](https://business.facebook.com/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- [Marketing API Docs](https://developers.facebook.com/docs/marketing-api)
- [App Review Guidelines](https://developers.facebook.com/docs/app-review)
