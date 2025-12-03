# 🖥️ Deploy em VPS - Guia Completo

## Provedores Recomendados

### Brasil (Baixa Latência)
- **Contabo** - A partir de R$25/mês (4GB RAM, região BR)
- **Hostinger VPS** - A partir de R$29.99/mês
- **Locaweb VPS** - A partir de R$49/mês

### Internacional (Mais Baratos)
- **Hetzner** - €4.51/mês (~$5) - Alemanha
- **DigitalOcean** - $6/mês - Multiple regions
- **Vultr** - $6/mês - São Paulo disponível
- **Linode** - $5/mês

## 🚀 Setup Completo (Ubuntu 22.04)

### 1. Preparar Servidor

```bash
# Conectar via SSH
ssh root@seu-servidor.com

# Atualizar sistema
apt update && apt upgrade -y

# Instalar dependências
apt install -y curl git nginx certbot python3-certbot-nginx

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Instalar Docker e Docker Compose (opcional, mas recomendado)
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose

# Instalar PM2 (gerenciador de processos Node.js)
npm install -g pm2
```

### 2. Clonar e Configurar Projeto

```bash
# Criar usuário para a aplicação (boa prática de segurança)
adduser --disabled-password --gecos "" mcp
usermod -aG docker mcp
su - mcp

# Clonar repositório
cd ~
git clone https://github.com/mixirica13/chatdata-app.git
cd chatdata-app/mcp

# Instalar dependências
npm install

# Build
npm run build

# Criar arquivo .env (opcional)
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
# REDIS_URL=redis://localhost:6379  # se instalar Redis
EOF
```

### 3. Opção A: Rodar com PM2 (Recomendado)

```bash
# Iniciar aplicação
pm2 start dist/mcp-server.js --name mcp-server

# Configurar para iniciar no boot
pm2 startup
pm2 save

# Ver logs
pm2 logs mcp-server

# Outros comandos úteis
pm2 status          # Ver status
pm2 restart mcp-server  # Reiniciar
pm2 stop mcp-server     # Parar
pm2 delete mcp-server   # Remover
```

### 3. Opção B: Rodar com Docker (Mais Isolado)

```bash
# Build da imagem
docker build -t mcp-server .

# Rodar container
docker run -d \
  --name mcp-server \
  --restart unless-stopped \
  -p 3001:3001 \
  mcp-server

# Ver logs
docker logs -f mcp-server

# Outros comandos
docker ps               # Ver containers rodando
docker restart mcp-server  # Reiniciar
docker stop mcp-server     # Parar
```

### 3. Opção C: Docker Compose (Mais Completo)

```bash
# Usar o docker-compose.yml já incluído no projeto
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar
docker-compose down

# Reiniciar
docker-compose restart
```

### 4. Instalar Redis (Opcional, mas Recomendado)

```bash
# Voltar para root
exit

# Instalar Redis
apt install -y redis-server

# Configurar Redis
sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf

# Iniciar Redis
systemctl enable redis-server
systemctl start redis-server

# Testar
redis-cli ping  # Deve retornar "PONG"

# Voltar para usuário mcp e adicionar Redis URL ao .env
su - mcp
cd chatdata-app/mcp
echo "REDIS_URL=redis://localhost:6379" >> .env

# Reiniciar aplicação
pm2 restart mcp-server
# OU
docker-compose restart
```

### 5. Configurar Nginx como Proxy Reverso

```bash
# Voltar para root
exit

# Criar configuração do Nginx
cat > /etc/nginx/sites-available/mcp << 'EOF'
server {
    listen 80;
    server_name mcp.seudominio.com;

    # Logs
    access_log /var/log/nginx/mcp_access.log;
    error_log /var/log/nginx/mcp_error.log;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;

        # Headers importantes
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts (importantes para requisições longas)
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Cache bypass
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint sem cache
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
EOF

# Ativar site
ln -s /etc/nginx/sites-available/mcp /etc/nginx/sites-enabled/

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx
```

### 6. Configurar SSL com Let's Encrypt (HTTPS)

```bash
# Certbot automático
certbot --nginx -d mcp.seudominio.com

# Siga as instruções (forneça email, aceite termos)
# O Certbot vai configurar SSL automaticamente!

# Testar renovação automática
certbot renew --dry-run
```

### 7. Configurar Firewall

```bash
# Habilitar UFW
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Verificar status
ufw status
```

## 🔄 Atualizar Aplicação (Deploy de Updates)

```bash
# Como usuário mcp
su - mcp
cd ~/chatdata-app/mcp

# Baixar alterações
git pull origin main

# Reinstalar dependências se necessário
npm install

# Rebuild
npm run build

# Reiniciar aplicação
pm2 restart mcp-server
# OU
docker-compose down && docker-compose up -d --build
```

## 📊 Monitoramento

### PM2 Monitoring

```bash
# Dashboard interativo
pm2 monit

# Logs em tempo real
pm2 logs mcp-server

# Ver métricas
pm2 show mcp-server
```

### Docker Monitoring

```bash
# Uso de recursos
docker stats mcp-server

# Logs
docker logs -f mcp-server --tail 100
```

### Nginx Logs

```bash
# Access logs
tail -f /var/log/nginx/mcp_access.log

# Error logs
tail -f /var/log/nginx/mcp_error.log
```

## 🔐 Boas Práticas de Segurança

### 1. Configurar fail2ban (proteção contra brute force)

```bash
apt install -y fail2ban

# Configurar para proteger SSH e Nginx
cat > /etc/fail2ban/jail.local << 'EOF'
[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
EOF

systemctl enable fail2ban
systemctl start fail2ban
```

### 2. Desabilitar login root via SSH

```bash
# Editar configuração SSH
nano /etc/ssh/sshd_config

# Alterar linha:
# PermitRootLogin no

# Reiniciar SSH
systemctl restart sshd
```

### 3. Configurar backups automáticos

```bash
# Script de backup simples
cat > /usr/local/bin/backup-mcp.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/mcp"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup do código
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /home/mcp/chatdata-app/mcp

# Backup do Redis (se usar)
redis-cli SAVE
cp /var/lib/redis/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Limpar backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete
EOF

chmod +x /usr/local/bin/backup-mcp.sh

# Agendar backup diário (3h da manhã)
crontab -e
# Adicionar linha:
# 0 3 * * * /usr/local/bin/backup-mcp.sh
```

## 🎯 Custos Estimados

### Setup Mínimo (1 servidor)
- **VPS 2GB RAM:** R$25-50/mês
- **Domínio:** R$40/ano
- **SSL:** Grátis (Let's Encrypt)

**Total:** ~R$30-55/mês

### Setup com Redis (melhor performance)
- Mesmo VPS (Redis roda junto)
- **Total:** ~R$30-55/mês (sem custo extra!)

## ✅ Verificação Final

```bash
# 1. Testar localmente no servidor
curl http://localhost:3001/health

# 2. Testar via Nginx
curl http://seu-dominio.com/health

# 3. Testar HTTPS
curl https://seu-dominio.com/health

# 4. Testar MCP endpoint
curl https://seu-dominio.com/mcp/info

# 5. Testar com token
curl -X POST "https://seu-dominio.com/mcp?token=SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## 📝 Troubleshooting

### Aplicação não inicia

```bash
# Ver logs do PM2
pm2 logs mcp-server --lines 100

# OU ver logs do Docker
docker logs mcp-server --tail 100

# Verificar se a porta está em uso
netstat -tulpn | grep 3001
```

### Nginx retorna 502 Bad Gateway

```bash
# Verificar se aplicação está rodando
pm2 status
# OU
docker ps

# Ver logs do Nginx
tail -f /var/log/nginx/mcp_error.log
```

### SSL não funciona

```bash
# Renovar certificado manualmente
certbot renew --force-renewal

# Verificar status
certbot certificates
```

## 🚀 Setup com Um Comando (Script Automático)

Vou criar um script que faz tudo automaticamente:

```bash
# Como root
curl -fsSL https://raw.githubusercontent.com/mixirica13/chatdata-app/main/mcp/install-vps.sh | bash
```

(Script será criado em outro arquivo)

---

## 💡 Dica Final

Se é seu primeiro VPS, recomendo começar com **DigitalOcean** ou **Hetzner**:
- Interface amigável
- Documentação excelente
- Preço competitivo
- Fácil de escalar

Para região Brasil e baixo custo: **Contabo** ou **Vultr São Paulo**
