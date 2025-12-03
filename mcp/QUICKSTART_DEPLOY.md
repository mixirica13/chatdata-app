# ⚡ Deploy Rápido - 5 Minutos

## Opção 1: Fly.io (Recomendada)

### Windows (PowerShell)

```powershell
# 1. Instalar Fly CLI
iwr https://fly.io/install.ps1 -useb | iex

# 2. Fazer deploy
cd mcp
.\deploy-fly.ps1
```

### Mac/Linux

```bash
# 1. Instalar Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Fazer deploy
cd mcp
chmod +x deploy-fly.sh
./deploy-fly.sh
```

**Pronto!** Seu servidor estará em:
```
https://chatdata-meta-mcp.fly.dev/mcp?token=YOUR_META_TOKEN
```

**Custo:** $0 (usa $5 de crédito grátis, auto-sleep quando inativo)

---

## Opção 2: Railway (Ainda Mais Fácil)

1. Acesse https://railway.app
2. Clique em "Start a New Project"
3. Escolha "Deploy from GitHub repo"
4. Selecione `chatdata-app`
5. Configure:
   - Root Directory: `mcp`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Clique em "Deploy"

**Pronto em 2 minutos!**

**Custo:** $0 (usa $5 de crédito grátis/mês)

---

## Opção 3: Render (100% Grátis)

1. Acesse https://render.com
2. Clique em "New +" → "Web Service"
3. Conecte seu GitHub e selecione `chatdata-app`
4. Configure:
   - Name: `chatdata-meta-mcp`
   - Root Directory: `mcp`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Plan: Free
5. Clique em "Create Web Service"

**Pronto em 3 minutos!**

**Custo:** $0 (plano gratuito, mas hiberna após 15min de inatividade)

---

## 🧪 Testar o Deploy

```bash
# Substituir URL pela sua
curl https://sua-url.com/health

# Listar tools disponíveis
curl https://sua-url.com/mcp/info

# Testar com seu token Meta
curl -X POST "https://sua-url.com/mcp?token=SEU_META_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

---

## 🎯 Próximo Passo

Integre com n8n ou Claude Desktop usando sua URL!

Ver: [N8N_GUIDE.md](./N8N_GUIDE.md) para instruções completas.
