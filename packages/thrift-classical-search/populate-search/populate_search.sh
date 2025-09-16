#!/bin/sh

curl \
  -X POST "$MEILISEARCH_SERVER/indexes/products/documents?primaryKey=product_id" \
  -H 'Content-Type: application/json' \
	-H "Authorization: Bearer $API_KEY" \
  --data-binary @/opt/src/products.json
