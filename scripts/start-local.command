#!/bin/zsh
set -e
cd "$(dirname "$0")/.."
if ! command -v node >/dev/null 2>&1; then
  echo 'Node.js 22 veya daha yeni bir sürüm gerekiyor: https://nodejs.org/'
  read '?Kapatmak için Enter tuşuna bas.'
  exit 1
fi
if [ ! -d node_modules ]; then npm ci; fi
export NEXT_PUBLIC_SITE_URL="http://$(ipconfig getifaddr en0 || echo 127.0.0.1):3001"
echo 'Buyrun sunucusu açılıyor. Telefon ve bilgisayar aynı Wi-Fi ağında olmalı.'
echo "$NEXT_PUBLIC_SITE_URL"
npm run dev -- --hostname 0.0.0.0 --port 3001
