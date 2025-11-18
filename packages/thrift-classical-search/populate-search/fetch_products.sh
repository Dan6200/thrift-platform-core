#!/bin/sh

curl "$APP_API_URL/v1/products?sort=-created_at"|jq '.products' > /opt/src/products.json
