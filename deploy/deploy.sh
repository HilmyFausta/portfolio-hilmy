#!/bin/bash
# Cek Docker Hub tiap kali dipanggil (lewat cron), redeploy kalau ada
# image baru. Semua konfigurasi dibaca dari .env di folder yang sama
# — nggak ada credential apapun yang perlu disimpan di GitHub.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "$(date): .env belum ada. Copy .env.example jadi .env dulu, isi sesuai punyamu."
  exit 1
fi
source .env

OLD_ID=$(docker inspect --format='{{.Image}}' "$CONTAINER_NAME" 2>/dev/null || echo "none")

docker pull "$IMAGE" > /dev/null

NEW_ID=$(docker inspect --format='{{.Id}}' "$IMAGE")

if [ "$OLD_ID" != "$NEW_ID" ]; then
  echo "$(date): Image baru terdeteksi, redeploy container..."
  docker stop "$CONTAINER_NAME" 2>/dev/null || true
  docker rm "$CONTAINER_NAME" 2>/dev/null || true
  docker run -d --name "$CONTAINER_NAME" \
    -p "${HOST_PORT}:${CONTAINER_PORT}" \
    --restart unless-stopped \
    "$IMAGE"
  echo "$(date): Selesai, container jalan versi baru."
else
  echo "$(date): Sudah versi terbaru, tidak ada perubahan."
fi