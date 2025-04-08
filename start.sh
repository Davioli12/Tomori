#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # Reset color

echo -e "${GREEN}Iniciando Tomori com auto reconexão ativada...${NC}"

# Função para lidar com interrupção (Ctrl+C)
trap 'echo -e "\n${RED}Interrupção detectada. Encerrando o loop de reconexão.${NC}"; exit 0' SIGINT

while true; do
  echo -e "${GREEN}Executando Tomori...${NC}"

  case "$1" in
    sim)
      node main.js sim
      ;;
    não | nao)
      node main.js não
      ;;
    *)
      node main.js
      ;;
  esac

  echo -e "${RED}Tomori caiu ou foi encerrado. Reiniciando em 1 segundo...${NC}"
  sleep 1
done