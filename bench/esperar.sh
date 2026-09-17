#!/usr/bin/env bash
# Uso: esperar.sh <ruta-del-marcador>. Termina cuando el marcador existe (+30 s de margen).
f="$1"
while [ ! -f "$f" ]; do sleep 15; done
sleep 30
echo "LISTO $f $(date -u +%Y-%m-%dT%H:%M:%SZ)"
