# Docker Setup

Este projeto inclui configuração Docker para facilitar o deploy e desenvolvimento.

## Arquivos Criados

- `docker-compose.yaml` - Configuração do Docker Compose
- `web/Dockerfile` - Dockerfile para o aplicativo Next.js
- `web/.dockerignore` - Arquivos ignorados no build Docker

## Como Usar

### Desenvolvimento

1. Certifique-se de ter Docker e Docker Compose instalados
2. Na raiz do projeto, execute:

```bash
docker-compose up --build
```

O aplicativo estará disponível em `http://localhost:3000`

### Produção

Para produção, você pode:

1. **Usar Docker Compose:**
```bash
docker-compose up -d --build
```

2. **Ou construir e executar manualmente:**
```bash
cd web
docker build -t corretoria-web .
docker run -p 3000:3000 corretoria-web
```

## Variáveis de Ambiente

As variáveis de ambiente podem ser configuradas de duas formas:

1. **Via arquivo `.env` na raiz do projeto:**
```env
N8N_WEBHOOK_URL_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/pro-portrait
N8N_WEBHOOK_URL_POST_IMAGES_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/post-image-gen
N8N_WEBHOOK_URL_POST_CAPTION_PROD=https://n8n.srv1092655.hstgr.cloud/webhook/post-caption
N8N_BASIC_USER=generation
N8N_BASIC_PASS=x@nd31Z03
```

2. **Ou diretamente no `docker-compose.yaml`** (já configurado com valores padrão)

## Comandos Úteis

- **Parar os containers:** `docker-compose down`
- **Ver logs:** `docker-compose logs -f`
- **Reconstruir:** `docker-compose up --build`
- **Executar em background:** `docker-compose up -d`

