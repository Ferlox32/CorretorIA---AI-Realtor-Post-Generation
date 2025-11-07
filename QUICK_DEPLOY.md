# Deploy Rápido - Hostinger

## Passos Rápidos (Copie e Cole)

### 1. No terminal da Hostinger, execute:

```bash
# Verificar Node.js (precisa ser 20+)
node --version

# Se não tiver Node.js 20+, instale:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Criar diretório para o projeto
mkdir -p ~/corretoria
cd ~/corretoria
```

### 2. Faça upload dos arquivos

**Opção A - Via Git:**
```bash
git clone seu-repositorio-git .
```

**Opção B - Via SFTP:**
- Use FileZilla ou WinSCP
- Faça upload da pasta `web/` completa para `~/corretoria/web/`

### 3. Build e Deploy

```bash
cd web

# Instalar dependências
pnpm install

# Fazer build
pnpm build

# Criar arquivo .env.production
cat > .env.production << EOF
NODE_ENV=production
N8N_WEBHOOK_URL_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/pro-portrait
N8N_WEBHOOK_URL_POST_IMAGES_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/post-image-gen
N8N_WEBHOOK_URL_POST_CAPTION_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/post-caption
N8N_BASIC_USER=generation
N8N_BASIC_PASS=x@nd31Z03
EOF

# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "corretoria" -- start
pm2 save
pm2 startup  # Siga as instruções que aparecerem
```

### 4. Verificar se está funcionando

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs corretoria

# Testar localmente (se tiver acesso)
curl http://localhost:3000
```

### 5. Configurar domínio (se necessário)

Se você tem um domínio, configure Nginx ou use o painel Hostinger para apontar para a porta 3000.

## Comandos Úteis

```bash
# Reiniciar
pm2 restart corretoria

# Parar
pm2 stop corretoria

# Ver logs em tempo real
pm2 logs corretoria --lines 50

# Monitoramento
pm2 monit
```

