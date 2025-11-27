# Configuração do Supabase para Reset de Senha

## 1. Configurar URLs de Redirect

Acesse o painel do Supabase: https://supabase.com/dashboard

1. Vá em **Authentication** > **URL Configuration**
2. Em **Redirect URLs**, adicione:
   - `https://chatdata.pro/reset-password`
   - `http://localhost:8080/reset-password` (para testes locais)
3. Em **Site URL**, certifique-se que está: `https://chatdata.pro`
4. Clique em **Save**

## 2. Configurar Template de Email

1. Vá em **Authentication** > **Email Templates**
2. Selecione **Reset Password** (ou "Change Email")
3. Cole o conteúdo do arquivo `docs/emails/reset-password.html`
4. **IMPORTANTE**: Certifique-se que o botão usa a variável correta:
   ```html
   <a href="{{ .ConfirmationURL }}" class="cta-button">
       Redefinir Senha
   </a>
   ```
5. Clique em **Save**

## 3. Verificar Configuração de PKCE

1. Vá em **Authentication** > **Settings**
2. Em **Auth Providers**, certifique-se que **Email** está habilitado
3. Em **Security and Protection**:
   - **Enable PKCE flow** deve estar **HABILITADO**
   - **Enable Manual Linking** pode estar desabilitado

## 4. Testar o Fluxo

### Em Produção (chatdata.pro):
1. Acesse https://chatdata.pro/forgot-password
2. Digite seu email
3. Verifique o email recebido
4. Clique no botão "Redefinir Senha"
5. Deve redirecionar para https://chatdata.pro/reset-password
6. Digite a nova senha
7. Deve redirecionar para /login

### Localhost:
1. Acesse http://localhost:8080/forgot-password
2. Digite seu email
3. Verifique o email recebido
4. **IMPORTANTE**: Edite manualmente a URL do link no email:
   - De: `https://qcohdtsvvahebfciuklc.supabase.co/auth/v1/verify?token=...&redirect_to=https://chatdata.pro/reset-password`
   - Para: `https://qcohdtsvvahebfciuklc.supabase.co/auth/v1/verify?token=...&redirect_to=http://localhost:8080/reset-password`
5. Cole a URL editada no navegador
6. Digite a nova senha
7. Deve redirecionar para /login

## Troubleshooting

### "Link inválido ou expirado"
- Verifique se a URL de redirect está configurada no Supabase
- Verifique se `detectSessionInUrl: true` está no `client.ts`
- Verifique se o link não expirou (expira em 1 hora)

### "Invalid API key"
- Verifique se as variáveis de ambiente estão corretas:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`

### Botão fica travado
- Abra o DevTools Console e verifique os erros
- Verifique se a requisição `PUT /auth/v1/user` está retornando 200
- Verifique se há alguma política RLS bloqueando a operação
