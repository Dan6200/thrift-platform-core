#!/bin/sh
set -eu
. /opt/src/wait_for_task.sh
response=$(curl -fsS --connect-timeout 5 --max-time 45 \
  -X POST "$MEILISEARCH_SERVER/indexes/products/documents?primaryKey=product_id" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $API_KEY" \
  --data-binary @/opt/src/products.json)
wait_for_task "$response"
