# CorretorIA - AI Realtor Post Generation

Plataforma web para geração de posts profissionais para corretores imobiliários, com integração n8n para processamento de imagens e geração de legendas usando IA.

## 🚀 Deploy na Hostinger com Docker

Este guia explica como fazer deploy do projeto na Hostinger usando Docker e Docker Compose.

### Pré-requisitos

- Conta Hostinger com acesso SSH (VPS ou Cloud)
- Docker e Docker Compose instalados
- Acesso ao terminal via SSH

### Passo 1: Conecte-se ao servidor Hostinger

```bash
ssh seu-usuario@seu-ip-hostinger
# Ou use o terminal do painel Hostinger
```

### Passo 2: Verifique o Docker

```bash
# Verificar Docker
docker --version
docker-compose --version

# Se não tiver Docker Compose, instale:
sudo apt update
sudo apt install docker-compose -y

# Verificar se o Docker está rodando
sudo systemctl status docker
```

### Passo 3: Clone o repositório

```bash
# Criar diretório para o projeto
mkdir -p ~/corretoria
cd ~/corretoria

# Clonar o repositório
git clone https://github.com/Ferlox32/CorretorIA---AI-Realtor-Post-Generation.git .

# Ou se preferir, clone apenas a branch main
git clone -b main https://github.com/Ferlox32/CorretorIA---AI-Realtor-Post-Generation.git .
```

### Passo 4: Configure as variáveis de ambiente (Opcional)

Se quiser sobrescrever as variáveis padrão, crie um arquivo `.env` na raiz do projeto:

```bash
# Criar arquivo .env (opcional - valores padrão já estão no docker-compose.yaml)
nano .env
```

Adicione (se necessário):

```env
N8N_WEBHOOK_URL_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/pro-portrait
N8N_WEBHOOK_URL_POST_IMAGES_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/post-image-gen
N8N_WEBHOOK_URL_POST_CAPTION_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/post-caption
N8N_BASIC_USER=generation
N8N_BASIC_PASS=x@nd31Z03
```

### Passo 5: Construa e inicie os containers

```bash
# Na raiz do projeto (onde está o docker-compose.yaml)
cd ~/corretoria

# Construir e iniciar o container
docker-compose up -d --build

# Verificar se está rodando
docker-compose ps

# Ver logs
docker-compose logs -f
```

### Passo 6: Verificar se está funcionando

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f web

# Testar se a aplicação está respondendo
curl http://localhost:3000
```

### Passo 7: Configurar domínio (Opcional)

Se você tem um domínio e acesso root/sudo, configure Nginx como proxy reverso:

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

## 📝 Comandos Úteis

### Gerenciar os containers Docker

```bash
# Ver status dos containers
docker-compose ps

# Ver logs
docker-compose logs web

# Ver logs em tempo real
docker-compose logs -f web

# Reiniciar container
docker-compose restart web

# Parar containers
docker-compose stop

# Iniciar containers
docker-compose start

# Parar e remover containers
docker-compose down

# Parar, remover e reconstruir
docker-compose up -d --build

# Ver uso de recursos
docker stats
```

### Atualizar o projeto

```bash
cd ~/corretoria

# Atualizar código do Git
git pull origin main

# Reconstruir e reiniciar containers
docker-compose down
docker-compose up -d --build

# Ou apenas reiniciar (se não houver mudanças no código)
docker-compose restart web
```

### Acessar o container

```bash
# Entrar no container
docker-compose exec web sh

# Ver logs do container
docker-compose logs -f --tail=100 web
```

## 🔧 Troubleshooting

### Container não inicia

```bash
# Verificar logs de erro
docker-compose logs web

# Verificar status do container
docker-compose ps

# Verificar se a porta 3000 está em uso
sudo netstat -tulpn | grep 3000
# ou
sudo ss -tulpn | grep 3000
```

### Rebuild completo

```bash
cd ~/corretoria

# Parar e remover containers
docker-compose down

# Remover imagens antigas (opcional)
docker-compose down --rmi all

# Reconstruir do zero
docker-compose build --no-cache
docker-compose up -d
```

### Verificar logs detalhados

```bash
# Logs do container
docker-compose logs -f web

# Últimas 100 linhas
docker-compose logs --tail=100 web

# Logs de erro apenas
docker-compose logs web 2>&1 | grep -i error
```

### Porta 3000 não acessível

```bash
# Verificar firewall
sudo ufw status

# Permitir porta 3000 (se necessário)
sudo ufw allow 3000/tcp

# Verificar se o container está escutando
docker-compose exec web netstat -tuln | grep 3000
```

### Limpar tudo e recomeçar

```bash
cd ~/corretoria

# Parar e remover tudo
docker-compose down -v

# Remover imagens
docker rmi corretoria-web 2>/dev/null || true

# Reconstruir
docker-compose up -d --build
```

## 📦 Estrutura do Projeto

```
CorretorIA/
├── web/                    # Aplicação Next.js
│   ├── app/               # Páginas e rotas
│   ├── components/        # Componentes React
│   ├── lib/               # Utilitários
│   └── public/            # Arquivos estáticos
├── docker-compose.yaml    # Configuração Docker
├── Dockerfile             # Dockerfile para build
└── README.md             # Este arquivo
```

## 🔐 Variáveis de Ambiente

As seguintes variáveis podem ser configuradas no arquivo `.env.production`:

- `NODE_ENV`: Ambiente (production)
- `N8N_WEBHOOK_URL_PROD`: URL do webhook de retrato profissional
- `N8N_WEBHOOK_URL_POST_IMAGES_PROD`: URL do webhook de geração de imagens
- `N8N_WEBHOOK_URL_POST_CAPTION_PROD`: URL do webhook de geração de legenda
- `N8N_BASIC_USER`: Usuário para autenticação básica
- `N8N_BASIC_PASS`: Senha para autenticação básica

## 📚 Tecnologias Utilizadas

- **Next.js 16** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **pnpm** - Gerenciador de pacotes
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers

## 🔗 Links

- Repositório: https://github.com/Ferlox32/CorretorIA---AI-Realtor-Post-Generation.git
- N8n Webhooks: https://n8n.srv1092655.hstgr.cloud

## 📄 Licença

Este projeto é privado.

