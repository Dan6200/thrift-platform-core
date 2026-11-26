#!/bin/sh
# Sourced by indexing scripts; a queued task is not a completed index update.
wait_for_task() {
  task=$(printf '%s' "$1" | jq -er '.taskUid')
  attempt=0
  while [ "$attempt" -lt 120 ]; do
    result=$(curl -fsS --connect-timeout 5 --max-time 15 -H "Authorization: Bearer $API_KEY" "$MEILISEARCH_SERVER/tasks/$task")
    status=$(printf '%s' "$result" | jq -er '.status')
    case "$status" in
      succeeded) return 0 ;;
      failed|canceled) printf '%s\n' "$result" >&2; return 1 ;;
      enqueued|processing) sleep 1 ;;
      *) echo "Unexpected indexing task status: $status" >&2; return 1 ;;
    esac
    attempt=$((attempt + 1))
  done
  echo "Indexing task $task timed out" >&2
  return 1
}
