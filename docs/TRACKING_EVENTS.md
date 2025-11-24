# 📊 Documentação de Tracking - ChatData

Este documento lista todos os eventos de tracking implementados no ChatData usando PostHog.

## 🎯 Setup

### Variáveis de Ambiente

```env
VITE_POSTHOG_KEY=phc_your_project_api_key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### Hook Customizado

Use o hook `useTracking()` em qualquer componente:

```typescript
import { useTracking } from '@/hooks/useTracking';

const { trackEvent, trackPageView, identifyUser } = useTracking();
```

---

## 📋 Eventos Implementados

### 1. Aquisição & Landing Pages

#### `landing_page_viewed`
**Onde:** `/lp-v4` (LandingPageV4.tsx:27)
**Quando:** Usuário acessa a landing page
**Propriedades:**
- `page_version`: "v4"
- `utm_source`: string | undefined
- `utm_medium`: string | undefined
- `utm_campaign`: string | undefined
- `utm_content`: string | undefined
- `utm_term`: string | undefined

**Exemplo:**
```typescript
trackPageView('landing_page_v4', {
  page_version: 'v4',
  utm_source: 'google',
  utm_medium: 'cpc',
  utm_campaign: 'black-friday',
});
```

---

#### `cta_clicked`
**Onde:** HeroSectionV4.tsx:121
**Quando:** Clique no botão "Testar Grátis" do hero
**Propriedades:**
- `cta_text`: "Testar Grátis"
- `cta_location`: "hero_section"

**Exemplo:**
```typescript
trackEvent('cta_clicked', {
  cta_text: 'Testar Grátis',
  cta_location: 'hero_section',
});
```

**💡 Próximos CTAs a implementar:**
- Botão de preços (PricingSection)
- Botão final (CTASection)
- Botão de FAQ

---

### 2. Registro & Ativação

#### `registration_started`
**Onde:** `/register` (Register.tsx:58)
**Quando:** Usuário acessa página de registro
**Propriedades:** Nenhuma adicional

---

#### `registration_completed`
**Onde:** `/register` (Register.tsx:80)
**Quando:** Conta criada com sucesso
**Propriedades:**
- `whatsapp_provided`: boolean
- `email_domain`: string (ex: "gmail.com")

**Exemplo:**
```typescript
trackEvent('registration_completed', {
  whatsapp_provided: true,
  email_domain: 'gmail.com',
});
```

---

#### `email_confirmation_sent`
**Onde:** `/register` (Register.tsx:84)
**Quando:** Email de confirmação enviado
**Propriedades:** Nenhuma adicional

---

#### `email_confirmed`
**Onde:** `/email-confirmed` (EmailConfirmed.tsx:16)
**Quando:** Usuário confirma email via link
**Propriedades:** Nenhuma adicional

---

#### `first_login`
**Onde:** `/login` (Login.tsx:65)
**Quando:** Primeiro login após registro (detectado por created_at recente)
**Propriedades:** Nenhuma adicional

**Nota:** Também chama `identifyUser(userId)` para associar eventos futuros ao usuário.

---

### 3. Conexões (Meta & WhatsApp)

> ⚠️ **EM DESENVOLVIMENTO** - Eventos planejados mas ainda não implementados

#### `meta_connection_started`
**Onde:** `/connect/meta` (ConnectMeta.tsx)
**Quando:** Usuário inicia fluxo de conexão Meta
**Status:** 🔴 Não implementado

---

#### `meta_connection_completed`
**Onde:** `/connect/meta` (ConnectMeta.tsx)
**Quando:** Meta Ads conectado com sucesso
**Propriedades esperadas:**
- `ad_accounts_count`: number
- `permissions_granted`: string[]
**Status:** 🔴 Não implementado

---

#### `meta_connection_failed`
**Onde:** `/connect/meta` (ConnectMeta.tsx)
**Quando:** Falha na conexão Meta
**Propriedades esperadas:**
- `error_type`: string
**Status:** 🔴 Não implementado

---

#### `whatsapp_connection_started`
**Onde:** `/connect/whatsapp` (ConnectWhatsApp.tsx)
**Quando:** Usuário inicia conexão WhatsApp
**Status:** 🔴 Não implementado

---

#### `whatsapp_connection_completed`
**Onde:** `/connect/whatsapp` (ConnectWhatsApp.tsx)
**Quando:** WhatsApp conectado
**Propriedades esperadas:**
- `phone_number_hash`: string (hash do número)
**Status:** 🔴 Não implementado

---

#### `whatsapp_connection_failed`
**Onde:** `/connect/whatsapp` (ConnectWhatsApp.tsx)
**Quando:** Falha na conexão WhatsApp
**Status:** 🔴 Não implementado

---

### 4. Monetização (Subscription Events)

> ⚠️ **EM DESENVOLVIMENTO** - Eventos críticos para análise de receita

#### `pricing_viewed`
**Onde:** `/subscription` (Subscription.tsx)
**Quando:** Visualiza página de preços
**Status:** 🔴 Não implementado

---

#### `plan_selected`
**Onde:** `/subscription` (Subscription.tsx)
**Quando:** Seleciona um plano
**Propriedades esperadas:**
- `plan_tier`: "basic" | "pro" | "agency"
- `plan_price`: number
- `is_trial`: boolean
**Status:** 🔴 Não implementado

---

#### `subscription_created` 💰
**Onde:** Webhook do Stripe ou Subscription.tsx
**Quando:** Assinatura criada (conversão!)
**Propriedades esperadas:**
- `plan_tier`: string
- `plan_price`: number
- `payment_method`: string
- `is_trial`: boolean
**Status:** 🔴 Não implementado
**Prioridade:** 🔥 CRÍTICO

---

#### `trial_started`
**Onde:** Subscription.tsx
**Quando:** Trial de 7 dias iniciado
**Status:** 🔴 Não implementado

---

#### `subscription_upgraded`
**Onde:** Subscription.tsx
**Quando:** Upgrade de plano
**Propriedades esperadas:**
- `from_tier`: string
- `to_tier`: string
- `price_difference`: number
**Status:** 🔴 Não implementado

---

#### `subscription_canceled`
**Onde:** Subscription.tsx
**Quando:** Cancelamento agendado
**Status:** 🔴 Não implementado

---

### 5. Engajamento & Retenção

> ⚠️ **EM DESENVOLVIMENTO** - Eventos para análise de produto

#### `dashboard_viewed`
**Onde:** `/dashboard` (Dashboard.tsx)
**Quando:** Acessa dashboard principal
**Status:** 🔴 Não implementado

---

#### `meta_ads_dashboard_viewed`
**Onde:** `/meta-ads` (MetaAdsDashboard.tsx)
**Quando:** Visualiza métricas Meta Ads
**Propriedades esperadas:**
- `date_range_selected`: string
- `ad_account_id`: string
**Status:** 🔴 Não implementado

---

#### `insight_viewed`
**Onde:** `/history` (History.tsx)
**Quando:** Visualiza um insight da IA
**Propriedades esperadas:**
- `insight_type`: "performance" | "audience" | "recommendation" | "alert" | "opportunity"
**Status:** 🔴 Não implementado

---

#### `date_filter_applied`
**Onde:** MetaAdsDashboard.tsx
**Quando:** Aplica filtro de data
**Propriedades esperadas:**
- `date_range_type`: "today" | "yesterday" | "7days" | "30days" | "custom"
**Status:** 🔴 Não implementado

---

#### `settings_viewed`
**Onde:** `/settings` (Settings.tsx)
**Quando:** Acessa configurações
**Status:** 🔴 Não implementado

---

#### `profile_updated`
**Onde:** Settings.tsx
**Quando:** Atualiza perfil
**Propriedades esperadas:**
- `field_updated`: "name" | "avatar"
**Status:** 🔴 Não implementado

---

#### `logout`
**Onde:** Settings.tsx, useAuth hook
**Quando:** Faz logout (também chama `resetUser()`)
**Status:** 🔴 Não implementado

---

## 🎨 Propriedades Globais (Auto-adicionadas)

Todos os eventos incluem automaticamente:

```typescript
{
  is_authenticated: boolean,
  is_subscribed: boolean,
  subscription_tier: "basic" | "pro" | "agency" | null,
  meta_connected: boolean,
  whatsapp_connected: boolean,
  email_domain: string | undefined
}
```

Essas propriedades são adicionadas automaticamente pelo hook `useTracking()`.

---

## 📊 Identificação de Usuário

### `identifyUser(userId, properties?)`

Associa eventos futuros a um usuário específico. Chamado automaticamente no primeiro login.

**Propriedades enviadas:**
- `email`: string
- `name`: string
- `whatsapp`: string
- `subscription_tier`: string
- `meta_connected`: boolean
- `whatsapp_connected`: boolean

---

### `resetUser()`

Remove identificação do usuário. Deve ser chamado no logout.

---

## 🔍 Como Testar

### 1. Localhost

Os eventos funcionam perfeitamente em `localhost:5173`. Você verá:

1. **Console do browser:** Logs do PostHog (debug mode ativado)
2. **Network tab:** Requests para `https://app.posthog.com/e/`
3. **PostHog Dashboard:** Activity → Live Events

### 2. PostHog Toolbar

Adicione `?__posthog_toolbar=true` na URL para ver eventos em tempo real:

```
http://localhost:5173/?__posthog_toolbar=true
```

### 3. Filtrar eventos de dev

No PostHog Dashboard:
- Settings → Project → Ignore internal and test users
- Adicione: `localhost|127.0.0.1`

---

## 📈 KPIs Principais

Com os eventos implementados você pode calcular:

### Funil de Conversão
```
Landing Page View → CTA Click → Registration Started →
Registration Completed → Email Confirmed → First Login →
Meta Connected → Subscription Created
```

### Conversion Rates
- **Landing → Registration:** `registration_started / landing_page_viewed`
- **Registration → Email Confirmed:** `email_confirmed / registration_completed`
- **Email → First Login:** `first_login / email_confirmed`
- **Login → Subscription:** `subscription_created / first_login`

### Revenue Metrics
- **MRR:** Soma de `subscription_created` com `plan_price`
- **Churn Rate:** `subscription_canceled / active_subscriptions`
- **ARPU:** Total revenue / total users

---

## 🚀 Próximos Passos

### Prioridade Alta 🔥
1. ✅ Implementar `meta_connection_*` events
2. ✅ Implementar `subscription_created` (CRÍTICO para revenue tracking)
3. ✅ Implementar `whatsapp_connection_*` events

### Prioridade Média
4. ⚠️ Adicionar tracking em outros CTAs (PricingSection, CTASection)
5. ⚠️ Implementar eventos de engajamento (dashboard, insights)
6. ⚠️ Adicionar tracking em FAQ (accordion opens)

### Prioridade Baixa
7. ⏸️ Implementar `logout` event
8. ⏸️ Implementar `profile_updated` event
9. ⏸️ Session recording configuration

---

## 🐛 Debug

### Evento não aparece no PostHog?

1. Verifique console: `PostHog initialized in development mode`
2. Verifique `.env`: `VITE_POSTHOG_KEY` está configurado?
3. Verifique Network tab: Request para `/e/` retornou 200?
4. PostHog demora ~5 segundos para processar eventos

### `posthog.__loaded` is false?

O PostHog demora alguns ms para inicializar. O hook `useTracking` já verifica isso e mostra warning no console.

---

## 📚 Recursos

- [PostHog Docs](https://posthog.com/docs)
- [PostHog React SDK](https://posthog.com/docs/libraries/react)
- [Event Tracking Best Practices](https://posthog.com/docs/data/events)

---

**Última atualização:** 2025-11-24
**Status:** 🟡 Implementação parcial (40% completo)
