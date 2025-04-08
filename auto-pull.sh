#!/bin/bash

while true
do
  echo "🔄 Verificando atualizações no GitHub..."
  git pull origin main
  sleep 10 # espera 10 segundos antes de checar de novo
done
