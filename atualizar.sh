#!/bin/bash

# Nome do repositório
REPO_NAME="Tomori"

# Mensagem automática com data/hora
DATA=$(date "+%d/%m/%Y %H:%M")
MENSAGEM="Atualização automática - $DATA"

# Mostra o que está sendo feito
echo "📦 Adicionando arquivos..."
git add .

echo "📝 Criando commit..."
git commit -m "$MENSAGEM"

echo "🚀 Enviando para o GitHub..."
git push

echo "✅ Atualização concluída com sucesso!"
