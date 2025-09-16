curl \
-X POST "$MEILISEARCH_SERVER/indexes/products/search" \
-H 'Content-Type: application/json' \
-H "Authorization: Bearer $API_KEY" \
--data-binary "{ \"q\":\"$1\" }"
