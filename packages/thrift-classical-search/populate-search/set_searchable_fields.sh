#!/bin/sh
curl \
-X PUT "$MEILISEARCH_SERVER/indexes/products/settings/searchable-attributes" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $API_KEY" \
--data-binary '["title","description","list_price","net_price"]'
