#!/bin/bash

# Verifica se está em uma branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" = "HEAD" ]; then
  echo "❌ Você está em estado 'detached HEAD'. Use 'git switch main' antes de rodar esse script."
  exit 1
fi

# Mensagem automática com data/hora
DATA=$(date "+%d/%m/%Y %H:%M")
MENSAGEM="Atualização automática - $DATA"

echo "📦 Adicionando arquivos..."
git add .

echo "📝 Criando commit..."
git commit -m "$MENSAGEM"

echo "🔄 Atualizando repositório local com GitHub..."
git pull --rebase

echo "🚀 Enviando para o GitHub..."
git push

echo "✅ Atualização concluída com sucesso!"
