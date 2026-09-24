#!/bin/sh
set -eu
cd "$(dirname "$0")"
: "${BUYRUN_LOCAL_IP:?Set BUYRUN_LOCAL_IP to the computer IPv4 address, e.g. 192.168.1.170}"
: "${ANDROID_HOME:?Android SDK required}"
: "${JAVA_HOME:?JDK 17 required}"
export EXPO_PUBLIC_API_URL="http://${BUYRUN_LOCAL_IP}:3001"
export EXPO_PUBLIC_LOCAL_PREVIEW=1
npx expo prebuild --platform android --no-install
cd android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a --no-daemon --max-workers=2
