# Guia de Deploy - Hostinger

Este guia explica como fazer deploy do projeto CorretorIA na Hostinger.

## Opções de Deploy na Hostinger

### Opção 1: VPS Hostinger (Recomendado)

Se você tem um VPS Hostinger, pode usar Docker ou Node.js diretamente.

#### Com Docker (se disponível no VPS):

```bash
# 1. Conecte-se ao VPS via SSH
ssh seu-usuario@seu-ip-hostinger

# 2. Instale Docker e Docker Compose (se não tiver)
# Ubuntu/Debian:
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker

# 3. Clone ou faça upload do projeto
git clone seu-repositorio
# OU faça upload via SFTP/FTP

# 4. Entre no diretório
cd CorretorIA

# 5. Execute o Docker Compose
docker-compose up -d --build
```

#### Sem Docker (Node.js direto):

```bash
# 1. Conecte-se ao VPS via SSH
ssh seu-usuario@seu-ip-hostinger

# 2. Instale Node.js 20+ e pnpm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pnpm

# 3. Clone ou faça upload do projeto
cd ~/domains/seu-dominio.com/public_html
# OU crie um diretório específico
mkdir -p ~/corretoria
cd ~/corretoria

# 4. Faça upload dos arquivos (via SFTP ou git clone)

# 5. Instale dependências e faça build
cd web
pnpm install
pnpm build

# 6. Configure variáveis de ambiente
nano .env.production
# Adicione:
# N8N_WEBHOOK_URL_PROD=...
# N8N_BASIC_USER=...
# N8N_BASIC_PASS=...

# 7. Execute com PM2 (gerenciador de processos)
sudo npm install -g pm2
pm2 start npm --name "corretoria" -- start
pm2 save
pm2 startup  # Siga as instruções para iniciar no boot
```

### Opção 2: Hostinger Cloud (Node.js)

Se você tem Hostinger Cloud com suporte a Node.js:

1. Acesse o painel Hostinger
2. Vá em "Aplicações" ou "Node.js"
3. Crie uma nova aplicação Node.js
4. Configure:
   - **Versão Node.js**: 20.x
   - **Comando de build**: `cd web && pnpm install && pnpm build`
   - **Comando de start**: `cd web && pnpm start`
   - **Porta**: 3000 (ou a porta que a Hostinger fornecer)
5. Configure as variáveis de ambiente no painel

### Opção 3: Usando Git e Deploy Automático

```bash
# No seu VPS/Cloud Hostinger
cd ~/domains/seu-dominio.com/public_html
git clone seu-repositorio-git .
cd web
pnpm install
pnpm build

# Configure PM2
pm2 start npm --name "corretoria" -- start
pm2 save
```

## Configuração de Nginx (Reverso Proxy)

Se você tem acesso root/sudo, configure Nginx para servir na porta 80:

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
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

## Variáveis de Ambiente

Crie um arquivo `.env.production` na pasta `web/`:

```env
NODE_ENV=production
N8N_WEBHOOK_URL_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/pro-portrait
N8N_WEBHOOK_URL_POST_IMAGES_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/post-image-gen
N8N_WEBHOOK_URL_POST_CAPTION_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/post-caption
N8N_BASIC_USER=generation
N8N_BASIC_PASS=x@nd31Z03
```

## Comandos Úteis

```bash
# Ver logs do PM2
pm2 logs corretoria

# Reiniciar aplicação
pm2 restart corretoria

# Parar aplicação
pm2 stop corretoria

# Ver status
pm2 status
```

