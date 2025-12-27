#!/bin/bash

echo "=== TEST SIMPLIFIÉ ==="

echo "1. Vérification serveur..."
curl -s http://localhost:5000 > /dev/null && echo "✅ Serveur OK" || echo "❌ Serveur arrêté"

echo -e "\n2. Récupération produits..."
RESPONSE=$(curl -s -X GET http://localhost:5000/api/products)
echo "Produits disponibles"

echo -e "\n3. Test commande simple..."
# Utiliser un ID de produit connu
PRODUCT_ID="694dbbec5c2fcf5a67a63ef7"  # Smartphone Android

curl -X POST http://localhost:5000/api/orders/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTRlM2I1NWE0ZTVkNTBlYjNhMjA3ODIiLCJyb2xlIjoiYnV5ZXIiLCJpYXQiOjE3NjY3MzQ2NzcsImV4cCI6MTc2NzMzOTQ3N30.FSQImX0ADjkcYKiGtxXu1_VZ7meMwBHoc6wEtFSiQKw" \
  -d "{
    \"items\": [
      {
        \"productId\": \"$PRODUCT_ID\",
        \"quantity\": 1
      }
    ]
  }"
