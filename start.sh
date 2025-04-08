#!/bin/bash

GREEN='\033[0;32m'
NC='\033[0m' # Reset color

while true; do
  echo -e "${GREEN}Tomori - Auto reconexão ativada para prevenção de quedas...${NC}"

  case "$1" in
    sim)
      node iniciar.js sim
      ;;
    não | nao)
      node iniciar.js não
      ;;
    *)
      node iniciar.js
      ;;
  esac

  sleep 1
done
