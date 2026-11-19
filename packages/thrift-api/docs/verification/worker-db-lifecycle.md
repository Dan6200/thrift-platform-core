# Worker database runtime verification — 2026-11-18

Tracked in https://github.com/Dan6200/thrift-platform-core/issues/36.

For symptoms, implementation details, investigation history, and recurrence
commands, see the [troubleshooting guide](../worker-database-troubleshooting.md).

## Findings

The original API used isolate-global Knex/pg pools. Worker tail logs captured:

```
A promise was resolved or rejected from a different request context than the one
it was created in. However, the creating request has already been completed or
canceled. ... at PendingOperation.resolve
```

Request scoping alone did not eliminate failures. Connection creation also
returned PostgreSQL protocol FATAL `58000`:

```
Timed out while waiting for an open slot in the pool.
```

Hyperdrive's original origin was Supabase's transaction pooler, port 6543.
Cloudflare recommends the direct Supabase connection for Hyperdrive:
https://developers.cloudflare.com/hyperdrive/examples/connect-to-postgres/postgres-database-providers/supabase/

A diagnostic Hyperdrive connected directly to Postgres, port 5432, using the
same database credentials. Changing the diagnostic Worker to that origin
eliminated failures in the workload below. This strongly implicates the pooled
origin path in the remaining stalls; it does not prove the precise internal
reason that pool stopped providing slots.

## Workload and results

The diagnostic Worker ran the actual Express `/v1/products?limit=1` route and
`SELECT 1` on alternating requests. Hyperdrive query caching was disabled.
Each request had a 12-second client deadline. Every response was validated for
its expected JSON payload. A 15-second idle gap separated the sequential phases.

| Configuration / phase                        | Requests | Valid HTTP 200 | HTTP 500 | Client deadline |
| -------------------------------------------- | -------: | -------------: | -------: | --------------: |
| Original pools + pooled origin, sequential   |       20 |              3 |        1 |              16 |
| Original pools + pooled origin, after idle   |       20 |              0 |        1 |              19 |
| Request pools + direct origin, sequential    |       20 |             20 |        0 |               0 |
| Request pools + direct origin, after idle    |       20 |             20 |        0 |               0 |
| Request pools + direct origin, concurrency 5 |       20 |             20 |        0 |               0 |

Original concurrency results were excluded because a deployment overlapped that
phase. Intermediate scoped revisions using the pooled origin still failed;
those abbreviated exploratory runs are not presented as complete comparisons.
Client deadlines are not counted as server HTTP 500s and may include transport
latency. Tail logs independently confirmed database errors.

Direct-origin end-to-end p50/p95 latency in milliseconds:

- Sequential: 846 / 1157.
- After idle: 825 / 1474.
- Concurrent: 850 / 2152.

The successful run used 12 isolates more than once and had 30 distinct product
request database-context IDs. Tail logs showed query completion and successful
pool cleanup. The direct diagnostic Hyperdrive had an origin limit of 5; the
original production configuration had a limit of 20. A read-only database
snapshot during investigation showed 1 active, 8 idle, and 2 system/null-state
connections, not a sustained active-query backlog. Hyperdrive aggregate capacity
metrics were not captured; this snapshot does not replace them.

## Changes and scope

- Worker requests obtain their own Knex and pg handles through AsyncLocalStorage.
- The Node HTTP adapter receives an opaque request ID; Express uses its matching
  invocation settings instead of assuming adapter async-context propagation.
- Connections use the current invocation's Hyperdrive binding.
- Response finish/close triggers cleanup; `waitUntil` keeps cleanup alive.
- Normal Node execution retains its shared default pool.
- Production Hyperdrive now uses Supabase's direct endpoint, port 5432, retaining
  query caching disabled and origin connection limit 20. GitHub's provisioning
  secret was updated without logging its value.

Build/typecheck/coverage and the full CI suite passed with **471 tests**.
Four focused tests cover overlapping contexts, Knex routing/Node fallback,
invocation-specific connection settings, and cleanup after success/failure.

Evidence: `worker-db-baseline.jsonl` and `worker-db-direct.jsonl`. These contain
only probe outcomes and diagnostic IDs, not credentials, SQL parameters, or
customer records. The runtime diagnostic entry must only be deployed as the
separate diagnostic Worker; it is not part of the production Worker routes.

Longer idle periods, other regions, and authenticated write/transaction load
remain outside this bounded verification.

## Production verification and cleanup

Production deployment: https://github.com/Dan6200/thrift-platform-core/actions/runs/44408805946

Deployment and all smoke checks passed. A separate production check then made
5 sequential and 5 concurrent `/v1/products?limit=1` requests: **10/10 valid HTTP
200 responses**, with measured end-to-end latency **823–1588 ms**.

Tail evidence for the direct diagnostic revision contained all 60 requests,
90 query starts, 90 query completions, and **90 distinct successful cleanup
records, zero cleanup failures** (60 outer diagnostic scopes plus 30 Express
product scopes). Diagnostic traffic was stopped after verification and the
temporary Worker was removed.
