#!/bin/bash

# Script de instalação automática do MCP Server em VPS
# Ubuntu 22.04 LTS
# Usage: curl -fsSL https://raw.githubusercontent.com/mixirica13/chatdata-app/main/mcp/install-vps.sh | bash

set -e

echo "🚀 Instalação do MCP Server - Chatdata Meta Ads"
echo "================================================"
echo ""

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script precisa ser executado como root"
    echo "Use: sudo bash install-vps.sh"
    exit 1
fi

# Perguntar domínio
read -p "📝 Digite seu domínio (ex: mcp.seudominio.com) ou deixe vazio para apenas IP: " DOMAIN
read -p "📧 Digite seu email para Let's Encrypt (para SSL): " EMAIL

echo ""
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

echo ""
echo "📥 Instalando dependências..."
apt install -y curl git nginx certbot python3-certbot-nginx redis-server

echo ""
echo "📥 Instalando Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

echo ""
echo "📥 Instalando PM2..."
npm install -g pm2

echo ""
echo "👤 Criando usuário mcp..."
if ! id -u mcp > /dev/null 2>&1; then
    adduser --disabled-password --gecos "" mcp
fi

echo ""
echo "📂 Clonando repositório..."
su - mcp << 'EOSU'
cd ~
if [ -d "chatdata-app" ]; then
    cd chatdata-app
    git pull origin main
else
    git clone https://github.com/mixirica13/chatdata-app.git
    cd chatdata-app
fi
cd mcp

echo "📦 Instalando dependências do projeto..."
npm install

echo "🏗️  Building..."
npm run build

echo "⚙️  Criando .env..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
REDIS_URL=redis://localhost:6379
EOF

echo "🚀 Iniciando aplicação com PM2..."
pm2 delete mcp-server 2>/dev/null || true
pm2 start dist/mcp-server.js --name mcp-server
pm2 save
EOSU

echo ""
echo "⚙️  Configurando PM2 para iniciar no boot..."
su - mcp -c "pm2 startup" | grep -oP "(?<=sudo ).*" | bash || true
su - mcp -c "pm2 save"

echo ""
echo "🔧 Configurando Redis..."
sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf
systemctl enable redis-server
systemctl restart redis-server

echo ""
echo "🌐 Configurando Nginx..."

if [ -n "$DOMAIN" ]; then
    # Com domínio
    cat > /etc/nginx/sites-available/mcp << EOF
server {
    listen 80;
    server_name $DOMAIN;

    access_log /var/log/nginx/mcp_access.log;
    error_log /var/log/nginx/mcp_error.log;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_cache_bypass \$http_upgrade;
    }

    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
EOF
else
    # Sem domínio (apenas IP)
    cat > /etc/nginx/sites-available/mcp << 'EOF'
server {
    listen 80 default_server;
    server_name _;

    access_log /var/log/nginx/mcp_access.log;
    error_log /var/log/nginx/mcp_error.log;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        proxy_cache_bypass $http_upgrade;
    }

    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
EOF
fi

# Remover default se existir
rm -f /etc/nginx/sites-enabled/default

# Ativar site
ln -sf /etc/nginx/sites-available/mcp /etc/nginx/sites-enabled/

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx

echo ""
echo "🔒 Configurando Firewall..."
ufw --force enable
ufw allow OpenSSH
ufw allow 'Nginx Full'

if [ -n "$DOMAIN" ] && [ -n "$EMAIL" ]; then
    echo ""
    echo "🔐 Configurando SSL com Let's Encrypt..."
    certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL
fi

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "================================================"
echo "📊 Informações do Servidor"
echo "================================================"
echo ""

if [ -n "$DOMAIN" ]; then
    echo "🔗 URLs:"
    echo "   Health:  https://$DOMAIN/health"
    echo "   Info:    https://$DOMAIN/mcp/info"
    echo "   Endpoint: https://$DOMAIN/mcp?token=YOUR_TOKEN"
else
    IP=$(curl -s ifconfig.me)
    echo "🔗 URLs (IP):"
    echo "   Health:  http://$IP/health"
    echo "   Info:    http://$IP/mcp/info"
    echo "   Endpoint: http://$IP/mcp?token=YOUR_TOKEN"
fi

echo ""
echo "📝 Comandos úteis:"
echo "   Ver logs:       pm2 logs mcp-server"
echo "   Status:         pm2 status"
echo "   Reiniciar:      pm2 restart mcp-server"
echo "   Parar:          pm2 stop mcp-server"
echo "   Nginx logs:     tail -f /var/log/nginx/mcp_access.log"
echo ""
echo "🧪 Testar agora:"
echo "   curl http://localhost:3001/health"

if [ -n "$DOMAIN" ]; then
    echo "   curl https://$DOMAIN/health"
else
    echo "   curl http://$IP/health"
fi

echo ""
echo "================================================"
