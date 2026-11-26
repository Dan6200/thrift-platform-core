#!/bin/sh
set -eu
: "${APP_API_URL:?APP_API_URL is required}"
response=$(mktemp)
trap 'rm -f "$response"' EXIT
curl -fsS --retry 2 --connect-timeout 5 --max-time 45 "${APP_API_URL%/}/v1/products?sort=-created_at" -o "$response"
jq -e '.products | if type == "array" and length > 0 then . else error("Catalog must contain products") end' "$response" > /opt/src/products.json
echo "Fetched $(jq 'length' /opt/src/products.json) products"
