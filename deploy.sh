#!/bin/bash

# Script de deploy para Hostinger
# Uso: ./deploy.sh

set -e

echo "🚀 Iniciando deploy do CorretorIA..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se está no diretório correto
if [ ! -f "docker-compose.yaml" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "📦 Instalando pnpm..."
    npm install -g pnpm
fi

# Entrar na pasta web
cd web

echo "📦 Instalando dependências..."
pnpm install

echo "🔨 Fazendo build do projeto..."
pnpm build

echo "✅ Build concluído!"

# Verificar se PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

# Parar instância anterior se existir
pm2 stop corretoria 2>/dev/null || true
pm2 delete corretoria 2>/dev/null || true

echo "🚀 Iniciando aplicação com PM2..."
cd ..
cd web
pm2 start npm --name "corretoria" -- start
pm2 save

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo "📊 Status da aplicação:"
pm2 status

echo ""
echo "📝 Para ver os logs: pm2 logs corretoria"
echo "🔄 Para reiniciar: pm2 restart corretoria"

