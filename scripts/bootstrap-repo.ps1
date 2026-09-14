# Crea el repo en la organización y sube el primer commit.
# Uso, parado en la raíz del repo:
#   powershell -ExecutionPolicy Bypass -File .\scripts\bootstrap-repo.ps1
# Requiere gh autenticado una sola vez: gh auth login
param([string]$Org = 'Scalerics-org')

$ErrorActionPreference = 'Stop'
$Repo = 'noched10'

git init -b main
git add .
git commit -m "chore: andamiaje inicial de noched10"

gh repo create "$Org/$Repo" --private --source=. --remote=origin
git push -u origin main

# Demo: alcanza con main + feature/*. GitFlow completo se arma cuando el
# proyecto pasa a Clientes.
gh repo edit "$Org/$Repo" --delete-branch-on-merge

Write-Host "Listo: https://github.com/$Org/$Repo"
