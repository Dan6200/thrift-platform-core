# Thrift API

Backend for **Thrift** — an online e-commerce, resale, and social marketplace for
new, used, and antique items.

- [Website](https://thrift-web-client.vercel.app)
- [API docs](https://thrift-api-lac.vercel.app/api-docs/)

## Stack

- **Node 20+** (the tests use `Array.prototype.toSpliced`; CI runs Node 22)
- TypeScript + Express
- Knex + PostgreSQL (Supabase)
- Supabase Auth (registration/sign-in)
- Paystack (payments)
- Upstash QStash (async jobs + domain events)
- Cloudinary (media uploads)

## Architecture

The service is **Functional DDD + Hexagonal (ports & adapters)**: a pure domain
core, curried use cases, and thin HTTP/infra adapters.

Each bounded context lives under `src/context/<name>/` with the same shape:

```
src/context/<context>/
  domain/       pure aggregates, value objects, invariants (no express/knex)
  application/  use cases returning Result<…, DomainError> (no I/O)
  ports/        interfaces for repositories and external services
  infra/        knex adapters and external-service adapters
  http/         Express handlers (transport ⇄ application)
```

Bounded contexts: `catalog`, `orders`, `cart`, `identity`, `fulfillment`,
`store-management`, `reviews`, `analytics`, `media`, `payments`.
Cross-cutting primitives live in `src/shared/` (`result`, `domain-error`,
`money`, `to-http-error`, `event`).

External services are behind ports (`AuthGateway`, `MediaStorage`,
`PaymentGateway`, `EventPublisher`) so the core stays testable and the adapters
are swappable.

See [`docs/architecture.md`](./docs/architecture.md) for the full reference.

## Getting started

Run from `packages/thrift-api`:

```bash
pnpm install
# configure the local env (see .env.testing.local / .env.development):
#   SUPABASE_*, PAYSTACK_*, CLOUDINARY_*, QSTASH_*
pnpm dev        # tsx watch, NODE_ENV=development
```

The `dev` script starts the API with `QSTASH_URL=http://localhost:8080`, so run
the QStash dev server alongside it if you exercise the payment/job flow:

```bash
pnpm dlx @upstash/qstash-cli dev   # :8080
```

## Testing

```bash
pnpm build          # tsc -> built/
pnpm test-server    # API on localhost:1027 (foreground)
pnpm test           # full suite (expects the API on localhost:1027)
```

Agents/automation use the `:agent` variants instead (`pnpm test-server:agent`
on port 1037, then `pnpm test:agent`); they are not the recommended path for
humans.

The suite mixes:

- **Unit** tests — pure domain invariants and use cases against fake ports.
- **Integration / adversarial** tests — real HTTP + Postgres, covering the
  contract, authorization, ownership, uniqueness, pagination and state machines.

Current size: **434 tests** — 150 unit and 284 integrated (101 adversarial).

For the QStash-dependent payment tests:

```bash
pnpm dlx @upstash/qstash-cli dev   # :8080; prints the signing keys
pnpm test-server                   # sets QSTASH_URL/APP_URL, server on :1027
pnpm test
```

The API verifies QStash job signatures, so `QSTASH_CURRENT_SIGNING_KEY` /
`QSTASH_NEXT_SIGNING_KEY` (from the dev server output) must be in the env or
passed to the server.

See [`docs/testing-strategy.md`](./docs/testing-strategy.md) for the test
pyramid and the blind-agent contract, and
[`docs/review-guide.md`](./docs/review-guide.md) for the architecture review
guide.

## Database schema

The schema is a **single consolidated migration**:
[`supabase/migrations/20250702000000_initial_schema.sql`](./supabase/migrations/20250702000000_initial_schema.sql).
New changes are folded into it rather than added as separate migrations.
`pnpm reset-db` (`supabase db reset`) replays it and then runs
[`supabase/seed.sql`](./supabase/seed.sql).

See [`docs/schema.md`](./docs/schema.md) for the generated table, function, enum,
and ER-diagram reference, [`docs/catalog-model.md`](./docs/catalog-model.md) for
the catalogue model, and [`docs/pricing-model.md`](./docs/pricing-model.md) for
the pricing pipeline.

## Docs

| Doc                                                        | Contents                             |
| ---------------------------------------------------------- | ------------------------------------ |
| [`docs/architecture.md`](./docs/architecture.md)           | Layers, patterns, contexts, status   |
| [`docs/schema.md`](./docs/schema.md)                       | Generated tables, functions, ER      |
| [`docs/catalog-model.md`](./docs/catalog-model.md)         | Products, variants, options, pricing |
| [`docs/pricing-model.md`](./docs/pricing-model.md)         | base price → modifiers → overrides   |
| [`docs/testing-strategy.md`](./docs/testing-strategy.md)   | Test pyramid + contracts             |
| [`docs/review-guide.md`](./docs/review-guide.md)           | How to review the refactor           |
| [`docs/test-style-review.md`](./docs/test-style-review.md) | Adversarial suite style review       |
| [`ddd_refactor_plan.md`](./ddd_refactor_plan.md)           | Refactor plan + drift register       |
