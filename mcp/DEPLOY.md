# 🚀 Guia de Deploy - MCP Server Meta Ads

## Opções de Hospedagem

### 1. 🔥 Fly.io (Recomendado)

**Vantagens:**
- $5 de crédito grátis/mês
- Máquinas auto-sleep (sem custo quando inativo)
- Deploy global (escolha região mais próxima)
- SSL automático

**Deploy:**

```bash
# 1. Instalar Fly CLI
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux
curl -L https://fly.io/install.sh | sh

# 2. Login
fly auth login

# 3. Criar app (do diretório mcp/)
cd mcp
fly launch --no-deploy

# 4. Configurar secrets
fly secrets set REDIS_URL=redis://your-redis-url (opcional)

# 5. Deploy
fly deploy

# 6. Verificar
fly open /health
```

**Configuração Otimizada:**
- Região: `gru` (São Paulo) ou `iad` (US East)
- CPU: 1 shared
- RAM: 256MB
- Auto-sleep quando inativo

**URL do servidor:**
```
https://chatdata-meta-mcp.fly.dev/mcp?token=YOUR_TOKEN
```

---

### 2. 🚂 Railway

**Vantagens:**
- Interface super simples
- Deploy automático do GitHub
- $5 de crédito grátis/mês

**Deploy:**

1. Acesse [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub repo"
3. Selecione o repositório `chatdata-app`
4. Configure:
   - **Root Directory:** `mcp`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. Adicione variáveis de ambiente (opcional):
   - `REDIS_URL` (se usar Redis)
6. Deploy automático!

**URL gerada:**
```
https://chatdata-meta-mcp.up.railway.app/mcp?token=YOUR_TOKEN
```

---

### 3. 🎨 Render.com

**Vantagens:**
- Plano gratuito generoso
- SSL automático
- Fácil configuração

**Deploy:**

1. Acesse [render.com](https://render.com)
2. "New" → "Web Service"
3. Conecte o repositório GitHub
4. Configure:
   - **Name:** `chatdata-meta-mcp`
   - **Root Directory:** `mcp`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Adicione variável de ambiente:
   - `PORT` = `3001`
6. "Create Web Service"

**URL gerada:**
```
https://chatdata-meta-mcp.onrender.com/mcp?token=YOUR_TOKEN
```

**⚠️ Nota:** Plano gratuito hiberna após 15 min de inatividade (demora ~30s para acordar).

---

### 4. ☁️ Google Cloud Run

**Vantagens:**
- Serverless (paga apenas pelo uso)
- Escala automaticamente
- Até 2 milhões de requisições grátis/mês

**Deploy:**

```bash
# 1. Instalar gcloud CLI
# https://cloud.google.com/sdk/docs/install

# 2. Login e configurar projeto
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# 3. Build e deploy (do diretório mcp/)
cd mcp
gcloud run deploy chatdata-meta-mcp \
  --source . \
  --platform managed \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

# 4. Verificar
gcloud run services describe chatdata-meta-mcp --region southamerica-east1
```

**URL gerada:**
```
https://chatdata-meta-mcp-xxx.a.run.app/mcp?token=YOUR_TOKEN
```

---

### 5. 🐳 Docker + VPS (DigitalOcean, Hetzner, etc)

**Para quem já tem servidor:**

```bash
# 1. Clonar repositório no servidor
git clone https://github.com/mixirica13/chatdata-app.git
cd chatdata-app/mcp

# 2. Criar .env
cp .env.example .env
# Editar .env com suas configurações

# 3. Build da imagem
docker build -t chatdata-meta-mcp .

# 4. Rodar container
docker run -d \
  --name mcp-server \
  -p 3001:3001 \
  --env-file .env \
  --restart unless-stopped \
  chatdata-meta-mcp

# 5. Verificar
curl http://localhost:3001/health
```

**Com Docker Compose:**

```bash
# No diretório mcp/
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down
```

**Configurar Nginx como proxy reverso:**

```nginx
# /etc/nginx/sites-available/mcp
server {
    listen 80;
    server_name mcp.chatdata.pro;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/mcp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# SSL com Certbot
sudo certbot --nginx -d mcp.chatdata.pro
```

---

## 📊 Comparação de Custos

| Plataforma | Grátis | Pago (mínimo) | Região BR | Auto-sleep |
|------------|--------|---------------|-----------|------------|
| **Fly.io** | $5 crédito/mês | ~$1.94/mês | ✅ São Paulo | ✅ |
| **Railway** | $5 crédito/mês | $5/mês | ❌ US/EU | ❌ |
| **Render** | ✅ Ilimitado* | $7/mês | ❌ US/EU | ✅* |
| **Cloud Run** | 2M req/mês | Pay-as-you-go | ✅ SP | ✅ |
| **VPS** | - | $5-10/mês | ✅ Variável | ❌ |

*Render free hiberna após 15 min de inatividade

---

## 🔐 Configuração de Variáveis de Ambiente

Independente da plataforma, você NÃO precisa configurar variáveis obrigatórias!

**Opcional (para features extras):**

```bash
# Cache com Redis (recomendado para produção)
REDIS_URL=redis://user:password@host:port

# Se quiser usar o modo legacy (REST API)
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=your_key
```

---

## ✅ Verificação Pós-Deploy

Após deploy, teste o servidor:

```bash
# 1. Health check
curl https://your-server.com/health

# 2. Server info
curl https://your-server.com/mcp/info

# 3. Testar com token real
curl -X POST "https://your-server.com/mcp?token=YOUR_META_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

---

## 🎯 Minha Recomendação

**Para começar rápido:** Railway ou Render (gratuito, fácil)

**Para produção:** Fly.io (melhor custo-benefício, região BR, auto-sleep)

**Para escala:** Google Cloud Run (serverless, paga apenas uso real)

**Para controle total:** VPS com Docker (mais barato em longo prazo)

---

## 📝 Próximos Passos

1. Escolha uma plataforma
2. Faça o deploy
3. Configure o domínio customizado (opcional)
4. Teste com seu Meta Access Token
5. Integre com n8n ou Claude Desktop

Qualquer dúvida, consulte a documentação específica de cada plataforma!
