#!/bin/bash

echo ""
echo "  ✦ Paula's Nails — Démarrage..."
echo ""

# Backend
echo "  → Démarrage du serveur backend (port 5001)..."
cd "$(dirname "$0")/backend" && node server.js &
BACKEND_PID=$!

sleep 1s

# Frontend
echo "  → Démarrage du frontend (port 5173)..."
cd "$(dirname "$0")/frontend" && npm run dev &
FRONTEND_PID=$!

echo ""
echo "  ✦ Application démarrée !"
echo "  → Frontend : http://localhost:5173"
echo "  → Backend  : http://localhost:5001"
echo ""
echo "  Compte admin : admin@paulasnails.fr / Admin2024!"
echo ""
echo "  Appuyez sur Ctrl+C pour arrêter."
echo ""

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Arrêt.'" EXIT
wait
