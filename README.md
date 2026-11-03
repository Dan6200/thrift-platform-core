# Thrift E-Commerce Platform

Thrift is a full-stack e-commerce marketplace platform built on a modern technology stack. It provides a robust backend API for managing products, users, and orders, and a responsive web frontend for both customers and vendors. The platform includes features like product variant management, a shopping cart, and a vendor analytics dashboard.

## Tech Stack

- **Monorepo:** [pnpm](https://pnpm.io/) Workspaces
- **Backend (`thrift-api`):** [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [TypeScript](https://www.typescriptlang.org/), [PostgreSQL](https://www.postgresql.org/), [Supabase](https://supabase.com/), [Knex.js](https://knexjs.org/)
- **Frontend (`thrift-web`):** [Next.js](https://nextjs.org/), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Jotai](https://jotai.org/)
- **Testing:** [Mocha](https://mochajs.org/), [Chai](https://www.chaijs.com/)

## Project Structure

This project is a monorepo containing the following key packages:

- `packages/thrift-api`: The core backend service. A RESTful API that handles all business logic, data storage, and user authentication.
- `packages/thrift-web`: The primary web interface. A Next.js application providing the customer-facing storefront, product pages, shopping cart, and a dashboard for vendors.
- `packages/cron-jobs`: A service for running scheduled background tasks, such as database maintenance or report generation.
- `packages/thrift-classical-search`: A dedicated service for handling product search and indexing.

## Architecture

### Database

The database schema — tables, functions, enums, and an entity-relationship
diagram — is documented in
[`packages/thrift-api/docs/schema.md`](packages/thrift-api/docs/schema.md). It is
generated from the live Supabase schema; run `pnpm docs:schema` from the repo
root to refresh it after schema changes.

---

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/Dan6200/thrift-platform-core
    cd thrift-platform-core
    ```

2.  **Install dependencies:**
    Install all dependencies from the root of the monorepo using pnpm.

    ```bash
    pnpm install
    ```

3.  **Setup Backend Environment:**
    The backend relies on a Supabase instance managed via Docker.

    ```bash
    cd packages/thrift-api
    supabase start
    ```

4.  **Run Development Servers:**
    You can run the backend and frontend services concurrently from the root directory.
    - **Run the API:**
      ```bash
      pnpm --filter thrift-api dev
      ```
    - **Run the Web App:**
      ```bash
      pnpm --filter thrift-web dev
      ```

## Testing

The backend follows a **testing pyramid**: many fast unit tests over the pure
domain, fewer integration tests over adapters and wiring, and a small
adversarial end-to-end suite for cross-layer concerns.

```
      ▲   adversarial e2e   contract, authz, ownership, state machines (few)
      │   integration       HTTP handlers, Joi schemas, knex adapters
      │   unit              domain invariants + use-case orchestration (many)
```

| Layer                 | Type            | What it covers                                                             |
| --------------------- | --------------- | -------------------------------------------------------------------------- |
| `shared/` + `domain/` | unit            | invariants, money arithmetic, state transitions, boundary values           |
| `application/`        | unit (fakes)    | orchestration, error mapping, "invalid input never reaches the repository" |
| `infra/` + `http/`    | integration     | SQL correctness, camelCase⇄snake_case mapping, Joi schemas, route wiring   |
| whole app             | adversarial e2e | contract, authorization, ownership, replay/state-machine, query injection  |

External services are hidden behind ports, so unit tests use plain fakes: no
Paystack, no Cloudinary, no network. Integration tests run against the local
Supabase instance and the test server.

### Running the tests

The suite uses Mocha + Chai and lives in `packages/thrift-api/src/tests/`. Tests
run under Node 20+ (the suite uses `Array.prototype.toSpliced`).

```bash
# 1. Start the local database
cd packages/thrift-api
supabase start

# 2. Start the test server (port 1037, background)
pnpm test-server:agent

# 3. Run the full suite (unit + integration)
pnpm test:agent

# 4. Stop the test server
pnpm kill-server
```

Useful variants:

| Command                        | Purpose                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| `pnpm test:agent:debug`        | Full suite with debug logging                              |
| `pnpm test-server:watch:agent` | Rebuild test server on source changes (tsx watch)          |
| `pnpm test --grep "Catalog"`   | Filter by suite name (server on port 1027)                 |
| `pnpm coverage:agent`          | Unit-test coverage for `shared/` and `context/*/domain/`   |
| `pnpm typecheck:agent`         | Type-check without emitting                                |
| `pnpm build`                   | Compile to `built/` (run before trusting a green test run) |

The unit suite is also reachable inside the full run via
`pnpm test:agent --grep "Testing isolated utility functions"`.

Conventions: import through the `#src/...` alias, use snake_case at the HTTP/DB
boundary and camelCase inside the domain, and keep each test independent by
seeding and tearing down its own data. See
[`packages/thrift-api/docs/testing-strategy.md`](packages/thrift-api/docs/testing-strategy.md)
for the full strategy and the unit-test contract.

The architecture and its conventions are documented in
[`packages/thrift-api/docs/architecture.md`](packages/thrift-api/docs/architecture.md).
