# Sistema de Emails para Trial de 7 Dias

## ⚡ RECOMENDAÇÃO: Use Emails Nativos do Stripe (Mais Simples)

**A forma mais simples e recomendada** é usar os emails automáticos do Stripe, sem precisar configurar provedor de email externo.

### Como Configurar Emails Nativos do Stripe:

1. **Acessar:** https://dashboard.stripe.com/settings/emails
2. **Ativar:**
   - ✅ Successful payments (confirmação de cobrança)
   - ✅ Upcoming renewal - **3 days before renewal** ⭐
   - ✅ Failed payments (se cartão falhar)
3. **Customizar:**
   - Adicionar logo da empresa
   - Personalizar cores (https://dashboard.stripe.com/settings/branding)
   - Adicionar mensagem customizada

**Pronto!** O Stripe cuida de tudo automaticamente.

---

## 📧 Emails Opcionais com Provedor Externo

Se você quiser emails **100% personalizados** (com seu design, gatilhos customizados, etc.), use um provedor de email externo como Resend, SendGrid, etc.

Este documento descreve como implementar emails customizados (OPCIONAL).

## 📧 Emails do Sistema de Trial

### 1. Email de Boas-Vindas ao Trial
**Evento:** `checkout.session.completed` (quando `subscription_status === 'trialing'`)
**Quando enviar:** Imediatamente após o usuário completar o checkout com trial

**Assunto:** `🎁 Bem-vindo ao Meta Aura - Seu trial de 7 dias começou!`

**Conteúdo sugerido:**
```
Olá [NOME],

Bem-vindo ao Meta Aura! 🎉

Seu trial gratuito de 7 dias do plano Basic começou agora. Você tem acesso completo a:
- ✅ IA ChatData no WhatsApp
- ✅ Dashboard com métricas principais
- ✅ 50 requisições de IA por dia

📅 Seu trial termina em: [DATA_FIM_TRIAL]
💳 Seu cartão será cobrado automaticamente em: [DATA_FIM_TRIAL]
💰 Valor: R$ 47/mês

Não quer continuar? Sem problemas!
Você pode cancelar a qualquer momento durante o trial e não será cobrado.

[BOTÃO: Acessar Dashboard]
[LINK: Cancelar Trial]

Aproveite! 🚀
Equipe Meta Aura
```

---

### 2. Email de Aviso - 3 Dias Antes do Trial Acabar
**Evento:** `customer.subscription.trial_will_end`
**Quando enviar:** 3 dias antes do trial acabar (Stripe envia automaticamente)

**Assunto:** `⏰ Seu trial acaba em 3 dias - Meta Aura`

**Conteúdo sugerido:**
```
Olá [NOME],

Este é um lembrete amigável: seu trial gratuito acaba em 3 dias!

📅 Data de término: [DATA_FIM_TRIAL]
💳 Seu cartão (terminado em [ULTIMOS_4_DIGITOS]) será cobrado em R$ 47,00

✨ Durante seu trial você:
- [X] requisições de IA utilizadas
- [X] insights gerados
- [X] horas economizadas

Quer continuar aproveitando esses benefícios?
→ Não precisa fazer nada! Sua assinatura continuará automaticamente.

Não quer mais?
→ [LINK: Cancelar antes da cobrança]

Dúvidas? Responda este email!

Equipe Meta Aura
```

---

### 3. Email de Conversão - Trial → Assinatura Paga
**Evento:** `invoice.payment_succeeded` (primeira cobrança após trial)
**Quando enviar:** Logo após o trial converter para assinatura paga

**Assunto:** `✅ Sua assinatura Meta Aura foi ativada`

**Conteúdo sugerido:**
```
Olá [NOME],

Sua assinatura do plano Basic foi ativada com sucesso! 🎉

💳 Cobrança processada: R$ 47,00
📅 Próxima cobrança: [DATA_PROXIMA_COBRANCA]
📧 Nota fiscal enviada em anexo

Seu plano inclui:
- ✅ IA ChatData no WhatsApp
- ✅ Dashboard com métricas principais
- ✅ 50 requisições de IA por dia

[BOTÃO: Acessar Dashboard]
[LINK: Gerenciar Assinatura]
[LINK: Ver Fatura]

Obrigado por confiar no Meta Aura!

Equipe Meta Aura
```

---

### 4. Email de Trial Cancelado (Opcional)
**Evento:** `customer.subscription.deleted` (quando `cancel_at_period_end === true` durante trial)
**Quando enviar:** Quando usuário cancela durante o trial

**Assunto:** `Trial cancelado - Sentiremos sua falta 😢`

**Conteúdo sugerido:**
```
Olá [NOME],

Confirmamos o cancelamento do seu trial.

📅 Você ainda tem acesso até: [DATA_FIM_TRIAL]
💳 Você NÃO será cobrado

Nos conte: por que você decidiu cancelar?
→ Muito caro
→ Não atendeu minhas necessidades
→ Interface complicada
→ Outro motivo: [LINK_FEEDBACK]

Caso mude de ideia, você pode voltar a qualquer momento!
[BOTÃO: Reativar Assinatura]

Até logo! 👋
Equipe Meta Aura
```

---

## 🔧 Implementação Técnica

### Opção 1: Usar Supabase Edge Function + Provedor de Email

Criar uma nova edge function: `supabase/functions/send-trial-email/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Exemplo com Resend (recomendado)
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  type: 'trial_started' | 'trial_ending' | 'trial_converted' | 'trial_canceled';
}

serve(async (req) => {
  const { to, subject, html, type } = await req.json() as EmailPayload;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Meta Aura <noreply@metaaura.com>',
      to: [to],
      subject: subject,
      html: html,
      tags: [
        { name: 'category', value: 'trial' },
        { name: 'type', value: type }
      ]
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Opção 2: Chamar a Edge Function do Webhook

No arquivo `stripe-webhook/index.ts`, adicionar chamadas de email:

```typescript
// Após processar checkout.session.completed com trial
if (subscriptionStatus === 'trialing') {
  await supabase.functions.invoke('send-trial-email', {
    body: {
      to: customer.email,
      subject: '🎁 Bem-vindo ao Meta Aura - Seu trial de 7 dias começou!',
      html: generateTrialWelcomeEmail(customer.name, subscriptionEnd),
      type: 'trial_started'
    }
  });
}

// No evento customer.subscription.trial_will_end
case "customer.subscription.trial_will_end": {
  const subscription = event.data.object;
  const customer = await stripe.customers.retrieve(subscription.customer);

  await supabase.functions.invoke('send-trial-email', {
    body: {
      to: customer.email,
      subject: '⏰ Seu trial acaba em 3 dias - Meta Aura',
      html: generateTrialEndingEmail(customer.name, subscription.trial_end),
      type: 'trial_ending'
    }
  });
  break;
}
```

---

## 📊 Templates HTML dos Emails

### Template Base (Design Responsivo)

Criar em: `src/email-templates/trial-base.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 150px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #46CCC6 0%, #2D9B96 100%);
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
    .highlight {
      background: #FEF3C7;
      padding: 15px;
      border-left: 4px solid #F59E0B;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{logo_url}}" alt="Meta Aura" class="logo">
    </div>

    {{content}}

    <div class="footer">
      <p>Meta Aura - Transforme seus dados do Meta Ads em insights acionáveis</p>
      <p><a href="{{unsubscribe_url}}">Cancelar emails</a></p>
    </div>
  </div>
</body>
</html>
```

---

## 🚀 Próximos Passos

1. **Escolher provedor de email:**
   - ✅ Resend (Recomendado - Simples e moderno)
   - SendGrid (Robusto, mais complexo)
   - Mailgun (Bom para volume)
   - Amazon SES (Mais barato, mais técnico)

2. **Configurar variáveis de ambiente:**
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxx
   EMAIL_FROM=noreply@metaaura.com
   ```

3. **Criar edge function para envio de emails**

4. **Adicionar chamadas no webhook do Stripe**

5. **Testar emails em ambiente de desenvolvimento:**
   - Usar Stripe CLI para simular eventos
   - Usar Mailtrap ou similar para capturar emails de teste

6. **Configurar webhook do Stripe para incluir `customer.subscription.trial_will_end`:**
   - Acessar: https://dashboard.stripe.com/webhooks
   - Editar o webhook existente
   - Adicionar evento: `customer.subscription.trial_will_end`
   - Salvar

---

## 📝 Checklist de Implementação

- [ ] Escolher e configurar provedor de email
- [ ] Criar edge function `send-trial-email`
- [ ] Criar templates HTML dos emails
- [ ] Adicionar chamadas de email no webhook
- [ ] Configurar evento `customer.subscription.trial_will_end` no Stripe
- [ ] Testar envio de emails
- [ ] Configurar domínio customizado para emails (@metaaura.com)
- [ ] Adicionar métricas de abertura de email (opcional)
- [ ] Configurar resposta automática de emails (opcional)

---

## 💡 Dicas

- Use variáveis personalizadas nos templates ({{name}}, {{trial_end}}, etc.)
- Inclua sempre um CTA claro (Call-to-Action)
- Torne fácil cancelar (menos frustração = melhor reputação)
- Teste em diferentes clientes de email (Gmail, Outlook, Apple Mail)
- Monitore taxa de abertura e cliques
- A/B teste diferentes assuntos de email

---

**Status:** ⏳ Aguardando configuração de provedor de email
**Prioridade:** Alta (melhora conversão de trials)
**Estimativa:** 2-4 horas de implementação
