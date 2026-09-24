#!/bin/sh
# Mobil uygulamanın web önizlemesini public/uygulama altına üretir (https://buyrun.vercel.app/uygulama).
# app.json yalnızca derleme süresince baseUrl alır; telefon derlemeleri etkilenmez.
set -eu
cd "$(dirname "$0")/../buyrun-mobile"
cp app.json /tmp/buyrun-app.json.bak
trap 'cp /tmp/buyrun-app.json.bak app.json' EXIT
node -e "const f='app.json';const j=require('./'+f);j.expo.experiments={...(j.expo.experiments||{}),baseUrl:'/uygulama'};require('fs').writeFileSync(f,JSON.stringify(j,null,2)+'\n')"
rm -rf ../public/uygulama
EXPO_PUBLIC_API_URL=https://buyrun.vercel.app npx expo export -p web --clear --output-dir ../public/uygulama
