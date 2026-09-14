#!/usr/bin/env bash
# Crea el repo en la organización y sube el primer commit.
# Uso: bash scripts/bootstrap-repo.sh [org]
# Requiere gh autenticado: gh auth login
set -euo pipefail

ORG="${1:-Scalerics-org}"
REPO="noched10"

git init -b main
git add .
git commit -m "chore: andamiaje inicial de noched10"

gh repo create "$ORG/$REPO" --private --source=. --remote=origin
git push -u origin main

# Demo: alcanza con main + feature/*. GitFlow completo se arma cuando el
# proyecto pasa a Clientes.
gh repo edit "$ORG/$REPO" --delete-branch-on-merge

echo "Listo: https://github.com/$ORG/$REPO"
