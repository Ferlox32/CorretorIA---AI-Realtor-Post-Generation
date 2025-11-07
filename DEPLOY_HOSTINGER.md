# Deploy na Hostinger - Guia Completo

## Passo a Passo para Deploy

### 1. Conecte-se ao servidor Hostinger via SSH

```bash
ssh seu-usuario@seu-ip-ou-dominio
# Ou use o terminal do painel Hostinger
```

### 2. Verifique o ambiente

```bash
# Verificar Node.js
node --version  # Precisa ser 20 ou superior

# Verificar pnpm
pnpm --version  # Se não tiver, instale: npm install -g pnpm
```

### 3. Faça upload dos arquivos

**Opção A - Via Git (Recomendado):**
```bash
cd ~
git clone seu-repositorio-git CorretorIA
cd CorretorIA
```

**Opção B - Via SFTP/FTP:**
- Use FileZilla ou similar
- Faça upload de toda a pasta `web/` para o servidor
- Exemplo: `~/domains/seu-dominio.com/public_html/`

### 4. Instale dependências e faça build

```bash
cd web
pnpm install
pnpm build
```

### 5. Configure variáveis de ambiente

```bash
# Crie arquivo .env.production
nano .env.production
```

Adicione:
```env
NODE_ENV=production
N8N_WEBHOOK_URL_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/pro-portrait
N8N_WEBHOOK_URL_POST_IMAGES_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/post-image-gen
N8N_WEBHOOK_URL_POST_CAPTION_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/post-caption
N8N_BASIC_USER=generation
N8N_BASIC_PASS=x@nd31Z03
```

### 6. Instale e configure PM2 (gerenciador de processos)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
cd ~/CorretorIA/web
pm2 start npm --name "corretoria" -- start

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
# Siga as instruções que aparecerem
```

### 7. Configure Nginx (se tiver acesso)

Se você tem acesso root/sudo, configure Nginx como proxy reverso:

```bash
sudo nano /etc/nginx/sites-available/corretoria
```

Adicione:
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

Ative o site:
```bash
sudo ln -s /etc/nginx/sites-available/corretoria /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Comandos úteis

```bash
# Ver logs
pm2 logs corretoria

# Reiniciar
pm2 restart corretoria

# Parar
pm2 stop corretoria

# Status
pm2 status

# Monitoramento
pm2 monit
```

## Deploy Rápido (Script Automatizado)

Use o script `deploy.sh` que criei:

```bash
chmod +x deploy.sh
./deploy.sh
```

## Troubleshooting

### Porta 3000 não acessível
- Verifique firewall: `sudo ufw allow 3000`
- Ou configure Nginx para fazer proxy

### Aplicação não inicia
- Verifique logs: `pm2 logs corretoria`
- Verifique se a porta está livre: `netstat -tulpn | grep 3000`

### Erro de permissões
- Certifique-se de ter permissões no diretório
- Use `chmod` se necessário

