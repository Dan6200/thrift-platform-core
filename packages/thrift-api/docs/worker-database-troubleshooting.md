# Troubleshooting Worker database stalls

This guide documents the November 18, 2026 incident following the migration
from Vercel to Cloudflare Workers. Start here if `/v1/products` hangs and returns:

```text
Knex: Timeout acquiring a connection. The pool is probably full.
Are you missing a .transacting(trx) call?
```

- Tracking: [GitHub issue #36](https://github.com/Dan6200/thrift-platform-core/issues/36).
- Measurements and limitations: [runtime verification report](verification/worker-db-lifecycle.md).
- Raw sanitized outcomes: [baseline](verification/worker-db-baseline.jsonl),
  [successful diagnostic run](verification/worker-db-direct.jsonl).

## What the error means

Knex waited for a usable connection and hit its acquisition deadline. The wait
accounts for the apparent hang. The transaction suggestion is generic: the
products read did not start a transaction. Do not infer a transaction leak or a
need for a larger pool from this message alone.

The incident had two observed problems:

1. Knex and pg pools were created once and reused across Worker invocations.
   Tail logs showed a promise resolving in a different request context after
   its creating request had completed or been canceled, with a stack inside
   Knex/Tarn's `PendingOperation.resolve`.
2. Hyperdrive connected to Supabase's transaction pooler on port 6543.
   Connection creation returned FATAL PostgreSQL protocol error `58000`,
   `Timed out while waiting for an open slot in the pool`, and sometimes
   `Connection terminated unexpectedly`. Scoping clients alone did not remove
   these failures. The same scoped implementation succeeded after changing
   Hyperdrive's origin to the direct Postgres endpoint on port 5432.

This implicates the pooled origin path, but we did not establish exactly why
that internal pool stopped supplying slots. Database activity was not captured
continuously, and Hyperdrive aggregate capacity metrics were not collected.

Vercel supports sharing a module-level pool between requests. Workers require
request-owned database connections; Hyperdrive supplies the persistent origin
pool. This runtime difference explains why a working Node deployment was not
sufficient evidence of Worker compatibility.

## How the investigation progressed

| Step                                                                           | Observation                                                           | Decision                                                         |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Limit Worker pools to max 3                                                    | Intermittent timeouts continued                                       | Pool sizing alone was insufficient.                              |
| Deploy a separate diagnostic Worker                                            | Both real product reads and `SELECT 1` failed                         | Investigate acquisition/lifecycle before rewriting products SQL. |
| Capture Worker logs and isolate IDs                                            | Cross-request promise warning in Knex/Tarn                            | Introduce request-owned database handles.                        |
| Scope handles and cleanup                                                      | Some successes, but failures continued                                | Avoid declaring the first plausible fix sufficient.              |
| Use each invocation's Hyperdrive binding and explicitly bridge Express context | Pooled-origin failures still occurred; creation logs included `58000` | Inspect the upstream pool path.                                  |
| Provision a separate direct-origin Hyperdrive                                  | All 60 probes succeeded                                               | Apply direct-origin configuration and scoped clients together.   |
| Deploy production and verify actual payloads                                   | 10/10 product reads succeeded                                         | Record bounded success, retain broader monitoring work.          |

The diagnostic run alternated `SELECT 1` and the actual Express product route.
It tested 20 sequential requests, 20 after a 15-second idle gap, and 20 at
concurrency five. The successful run reused 12 isolates, created 30 distinct
product database contexts, and logged 90 query completions and 90 successful
context cleanups. The extra 60 scopes were diagnostic wrappers, not additional
product requests. Full CI passed 471 tests. See the report for latency numbers
and why the baseline concurrency phase was excluded.

## How the implemented fix works

The production path is:

```text
Worker fetch(current Hyperdrive binding)
  → opaque request ID and invocation settings in workerRequests
  → Node HTTP adapter
  → Express middleware retrieves settings and removes the internal header
  → AsyncLocalStorage holds this request's Knex/pg handles
  → repository imports resolve through the shared database proxies
  → response finish/close triggers knex.destroy() and pg pool.end()
  → ExecutionContext.waitUntil keeps cleanup alive
```

Implementation references:

- [Worker entry](../src/worker.ts): registers the current binding and cleanup
  callback, overwrites the internal request-ID header, and removes the map entry
  in `finally`.
- [Express middleware](../src/index.ts): resolves that ID, starts the request
  context, and registers cleanup on response finish or disconnect. It fails
  explicitly if invocation settings are missing.
- [Request context](../src/db/request-context.ts): constructs handles from the
  current binding, isolates asynchronous work, emits lifecycle events, and
  attempts cleanup of both pools even if one cleanup fails.
- [Database exports](../src/db/index.ts): proxies route repository operations to
  the active handles. Ordinary Node execution retains shared default handles;
  Workers fail explicitly when database access lacks a request context.
- [Regression tests](../src/tests/unit/db/request-context.ts): cover overlapping
  contexts, proxy routing and Node fallback, per-invocation configuration, and
  cleanup after success and failure.

The explicit request-ID bridge avoids relying on async-context propagation
through the Node HTTP adapter. Do not replace it with a mutable global
“current connection” variable: overlapping requests would overwrite each other.
Do not cache the first invocation's Hyperdrive connection string in new pool
instances. Preserve the pg ESM driver assignment needed by the Worker bundle.

The persistent production Hyperdrive is `thrift-api-supabase`, ID
`1f80573318e5432381da2a8fe5a048e3`. Its verified origin is
`db.dfxpzyudbrgvltwipofj.supabase.co:5432`, user `postgres`, query caching disabled,
origin connection limit 20. These identifiers are configuration, not passwords.
The GitHub `SUPABASE_DB_URL` provisioning secret was changed to the direct URL;
local Node environment files were not rewritten. The deploy workflow substitutes
`CLOUDFLARE_HYPERDRIVE_ID` into Wrangler's placeholder.

## If it happens again

Run these read-only checks from the repository root. Keep the production probe
small; the API has a rate limiter. Validate the returned JSON as well as HTTP
status. Do not repeatedly retry a stalled endpoint without collecting logs.

```sh
# Bound the wait and save the response for inspection.
curl --silent --show-error --max-time 20 \
  --output /tmp/thrift-products-check.json \
  --write-out 'HTTP %{http_code}; total %{time_total}s\n' \
  'https://api.thrift-commerce.workers.dev/v1/products?limit=1'

# Read configuration back: check direct host/port, cache setting, and limits.
pnpm --filter thrift-api exec wrangler hyperdrive get \
  1f80573318e5432381da2a8fe5a048e3

# Run in another terminal, then make one bounded request.
pnpm --filter thrift-api exec wrangler tail api \
  --config wrangler.jsonc --format json
```

Look for `db-connection-create-failed` (including its code), `db-query-start`,
`db-query-complete`, `db-query-error`, and `db-cleanup` with `complete: true`.
Correlate by `dbContextId`. Raw pg queries also emit `db-pg-connect`; Knex query
logging does not cover every raw pg call. Query logs intentionally omit SQL and
parameters. A query start without completion needs investigation; it does not
alone distinguish a slow query, disconnect, or canceled request.

| Evidence                                     | Next check                                                                                                                         |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Cross-request promise or I/O-context warning | Ensure handles are created inside the current request and the adapter bridge/cleanup still works.                                  |
| `58000` / waiting for a slot                 | Inspect Hyperdrive origin and metrics, database connection capacity, and any additional pooler. Do not automatically raise limits. |
| Acquisition timeout without query start      | Inspect connection-create failures, TLS/authentication/reachability, and pending acquisitions.                                     |
| Long-running query or idle transaction       | Inspect database activity/locks and transaction boundaries before changing SQL or indexes.                                         |
| HTTP 429                                     | Account for rate limiting in the workload; do not count it as a database error.                                                    |
| Client timeout without a response            | Correlate server logs; this may include network delay and is not an HTTP 500.                                                      |

For a deeper reproduction, redeploy `src/worker/diagnostic.ts` only as a separate
temporary Worker with the same runtime flags, YAML text rule, required secrets,
and Hyperdrive binding. Its `/__db-check` endpoint and diagnostic headers are not
production routes. Never direct the main production Worker at that entry point.
Use `DB_DIAGNOSTIC=true` only there to expose the product context ID header.

Keep a deployment unchanged throughout each comparison. Record version IDs,
client deadlines, every result, payload validity, isolate reuse, and cleanup.
Separate aborted or overlapping runs. Query cache settings must match. Test a
longer idle gap or another region when the symptoms require it. Remove temporary
Workers and unused Hyperdrive configurations afterward; both temporary resources
from this incident were removed.

After code changes, rebuild and confirm the emitted artifact before testing.
Use the canonical local scripts after starting the required Supabase and QStash
services, or use the repository's full CI workflow (which provisions both):

```sh
pnpm --filter thrift-api build
pnpm --filter thrift-api test-server:agent
pnpm --filter thrift-api test:agent
```

When a local test fails, use the corresponding `:debug` scripts and server logs.
Do not weaken the tests or change service wiring to obtain a passing run. A green
Node test suite cannot establish Worker request-lifecycle correctness; repeat the
runtime probes and verify real database payloads after deployment.

## Sources and remaining limits

- [Cloudflare connection lifecycle](https://developers.cloudflare.com/hyperdrive/concepts/connection-lifecycle/).
- [Cloudflare Supabase connection guidance](https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-database-providers/supabase/).
- [Vercel connection pooling guidance](https://vercel.com/kb/guide/connection-pooling-with-functions).
- [Knex acquisition timeout](https://knexjs.org/guide/#acquireconnectiontimeout).

The successful probes do not establish behavior under long idle periods, all
regions, sustained load, or authenticated writes/transactions. Revisit those
paths if new symptoms appear; do not assume every future Knex timeout has the
same cause.
