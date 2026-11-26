#!/bin/sh
set -eu
. /opt/src/wait_for_task.sh
response=$(curl -fsS --connect-timeout 5 --max-time 15 \
  -X PUT "$MEILISEARCH_SERVER/indexes/products/settings/searchable-attributes" \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $API_KEY" \
  --data-binary '["title","description","list_price","net_price","category_name","subcategory_name"]')
wait_for_task "$response"
