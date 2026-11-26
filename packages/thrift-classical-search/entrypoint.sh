#!/bin/sh
set -eu
: "${API_KEY:?API_KEY is required}"
: "${APP_API_URL:?APP_API_URL is required}"
export MEILI_MASTER_KEY="$API_KEY"
export MEILISEARCH_SERVER=http://127.0.0.1:7701
export MEILI_DB_PATH="${MEILI_DB_PATH:-/meili_data/data.ms}"

# Keep Cloud Run's public startup port closed until the index is usable.
meilisearch --http-addr 127.0.0.1:7701 &
bootstrap_pid=$!
cleanup() {
  if kill -0 "$bootstrap_pid" 2>/dev/null; then
    kill "$bootstrap_pid"
    wait "$bootstrap_pid" || true
  fi
}
trap cleanup EXIT
trap 'exit 143' TERM INT
attempt=0
until curl -fsS --connect-timeout 1 --max-time 2 "$MEILISEARCH_SERVER/health" >/dev/null 2>&1; do
  kill -0 "$bootstrap_pid"
  attempt=$((attempt + 1))
  [ "$attempt" -lt 60 ] || { echo 'Private search startup timed out' >&2; exit 1; }
  sleep 1
done
/opt/src/fetch_products.sh
/opt/src/populate_search.sh
/opt/src/set_searchable_fields.sh
expected=$(jq 'length' /opt/src/products.json)
actual=$(curl -fsS --max-time 15 -H "Authorization: Bearer $API_KEY" "$MEILISEARCH_SERVER/indexes/products/stats" | jq -er '.numberOfDocuments')
[ "$actual" -eq "$expected" ] || { echo "Indexed count $actual differs from catalog count $expected" >&2; exit 1; }
echo "Search index ready: $actual products"
cleanup
trap - EXIT TERM INT
exec meilisearch --http-addr "0.0.0.0:${PORT:-7700}"
