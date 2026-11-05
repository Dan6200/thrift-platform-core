# Testing Strategy — thrift-api

This document is the source of truth for _how_ and _where_ to test the
application. It is written so it can be handed to a testing agent that is
**blind to the source code** (it may read only `src/tests/` and this document).

---

## 1. Philosophy: the testing pyramid

Prefer many fast, precise tests at the bottom and few slow, coarse tests at the
top:

```
      ▲   adversarial e2e      contract, authz, ownership (few)
      │   integration          adapters + wiring + boundary mapping
      │   unit                 pure domain rules + use-case orchestration (many)
```

The application is **Functional DDD** (see `docs/architecture.md`): business
rules are **pure functions** (`domain/`), orchestration is **curried use cases**
(`application/`), and all I/O is behind **ports** (`infra/` adapters). That shape
is what makes unit testing cheap — the pure core needs no DB, no network, and
no mocks beyond a plain fake object.

> **"More unit, less e2e" is correct.** Unit tests pin the exact rule and run in
> milliseconds; a black-box e2e test tells you only "something returned 4xx/5xx"
> and needs the full stack (DB, Supabase, Paystack, QStash, Cloudinary).

---

## 2. What each layer tests

| Layer                    | Test type        | Targets                                                               | Why                      |
| ------------------------ | ---------------- | --------------------------------------------------------------------- | ------------------------ |
| `shared/` + `domain/`    | unit             | invariants, money arithmetic, state transitions, every boundary value | pure, no I/O             |
| `application/`           | unit (fake repo) | orchestration, error mapping, "invalid input never reaches the repo"  | depends on ports only    |
| `infra/` (knex adapters) | integration      | SQL correctness, camelCase→snake_case, transactions                   | needs the DB             |
| `http/` + `routes/`      | integration      | Joi schemas, route wiring, status codes, boundary mapping             | needs the running server |
| whole app                | adversarial e2e  | contract, authz, ownership, replay/state-machine, query injection     | cross-layer seams        |

**Rule of thumb:** a business rule should be tested once as a unit (in
`domain/`/`application/`) and once as a thin integration check (does the
endpoint surface it with the right status). Do **not** enumerate boundary values
through HTTP — that belongs in unit tests.

---

## 3. Blind-agent unit-test contract

The following pure functions and use cases are the unit-test surface. Their
signatures and invariants are given here so tests can be written against them
**without reading the source**. Import them with the `#src/...` alias; the
existing `src/tests/unit/` files show the exact import + fake-repo pattern.

### 3.1 Shared primitives

- `#src/shared/result.ts`
  - `Result<T, E> = { kind: 'ok'; value: T } | { kind: 'err'; error: E }`
  - `ok`, `err`, `map`, `flatMap`, `mapError`
- `#src/shared/domain-error.ts`
  - `DomainErrorCode = 'INVALID_INPUT' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'UNAUTHENTICATED' | 'CONFLICT' | 'INTERNAL'`
  - `domainError(code, message)`, `domainErrorStatusCode(error)`
- `#src/shared/money.ts`
  - `Money = number` (integer **kobo**); `isNonNegativeMoney(v): v is Money`
    (integer and ≥ 0)
- `#src/shared/to-http-error.ts`
  - `toHttpError(error: DomainError): Error` — maps code → HTTP error class:
    `INVALID_INPUT`→400, `NOT_FOUND`→404, `UNAUTHORIZED`→403,
    `UNAUTHENTICATED`→401, `CONFLICT`→409, `INTERNAL`→500.

### 3.2 Catalog

- `#src/context/catalog/domain/product.ts`
  - `createProduct(draft: ProductDraft): Result<Product, DomainError>`
  - `Product` = `{ title, categoryId, subcategoryId, description: string[], variants: Variant[] }`
  - `Variant` = `{ sku, basePrice: Money, quantityAvailable, options: { optionName, value }[] }`
  - Invariants: title non-empty; `categoryId`/`subcategoryId` positive int;
    ≥1 variant; SKU non-empty + unique within the draft; `basePrice` non-neg int;
    `quantityAvailable` non-neg int; ≥1 option. SKUs are **trimmed** on output.
- `#src/context/catalog/domain/variant.ts`
  - `createVariant(variant): Result<Variant, DomainError>` — same per-variant
    rules as above.
  - `validateVariantUpdate(update): Result<VariantUpdate, DomainError>` where
    `VariantUpdate = { sku?, basePrice?, quantityAvailable?, inventoryChangeReason?, inventoryChangeNotes?, options? }`.
    Invariants: `basePrice` non-neg int; `quantityAvailable` non-neg int;
    **if `quantityAvailable` is present, `inventoryChangeReason` is required.**
- `#src/context/catalog/infra/sort.ts`
  - `handleSortQuery(queryString: string): string` — comma-separated fields,
    `-` prefix = DESC; allowed columns `product_id, title, base_price,
created_at, updated_at, average_rating, review_count, products_sold`;
    invalid columns are ignored; returns `''` if none valid, else `ORDER BY …`.

### 3.3 Cart

- `#src/context/cart/domain/cart.ts`
  - `validateQuantity(quantity, availableStock): Result<number, DomainError>`
    — quantity must be a positive integer and ≤ availableStock.

### 3.4 Orders

- `#src/context/orders/domain/order.ts`
  - `OrderStatus = 'pending' | 'processing' | 'failed' | 'cancelled' | 'shipped' | 'delivered' | 'refunded'`
  - `createOrder(draft, priceOf, stockOf): Result<Order, DomainError>` — status `'pending'`
  - `buildOrderItems(items, priceOf, stockOf): Result<{ items, totalAmount }, DomainError>` — the shared validation + price-snapshot loop used by both create and amend
  - `draft.items` = `{ variantId, quantity }[]`
  - `priceOf: (variantId) => Money | undefined` (injected price lookup)
  - `stockOf: (variantId) => number` (injected stock lookup)
  - Invariants: ≥1 item; quantity positive int; `priceOf` defined (variant
    exists); `stockOf ≥ quantity`; `totalAmount = Σ(price × quantity)`.
  - **State machine**: amendment and cancellation are only legal while
    `status === 'pending'`.

### 3.5 Application use cases (unit-test with a fake repository)

The fake is a plain object implementing the port. See the templates:
`src/tests/unit/catalog/create-product.ts` and
`src/tests/unit/orders/create-order.ts`. For each use case, assert the **error
mapping** (a rule violation returns the right `DomainError` code and _does not_
call the write method) and the **happy path** (valid input reaches the repo).

- `createProductUseCase(repo)(command)` — `command = { title, categoryId,
subcategoryId, description: string[], variants: Variant[], vendorId, storeId }`.
  Validates via `createProduct`; rejects any variant whose SKU already exists
  globally (`repo.getVariantBySku(sku)` → `CONFLICT`); then `repo.create`.
- `createVariantUseCase(repo)(command)` — `command = { productId, storeId,
variant: Variant }`. Validates via `createVariant`; rejects duplicate SKU
  (`getVariantBySku` → `CONFLICT`); then `repo.createVariant`.
- `updateVariantUseCase(repo)(input)` — `input = { productId, variantId,
storeId, changes: VariantUpdate }`. **The payload field is `changes`** (not
  `update`/`variant`). Validates via `validateVariantUpdate(input.changes)`;
  then `repo.updateVariant({ ...input, changes })`.
- `createOrderUseCase(repo)(command)` — `command = { customerId, storeId,
deliveryInfoId?, items: { variantId, quantity }[] }`. `repo.storeExists` →
  `NOT_FOUND`; `repo.deliveryInfoBelongsTo` → `INVALID_INPUT`; every variant must
  belong to `storeId` (`repo.getVariantStoreIds` → `INVALID_INPUT` on mismatch);
  then `createOrder` with prices/stock from `repo.getVariantPrices` /
  `repo.getAvailableStock`; then `repo.create`.
- `createReviewUseCase(repo)(command)` — `command = { orderItemId, customerId,
rating, customerRemark? }`. `repo.getOrderItemOwner(orderItemId)` →
  `NOT_FOUND` / `UNAUTHORIZED`; `repo.getById(orderItemId)` (existing) →
  `CONFLICT`; then `repo.create`.
- `updateReviewUseCase(repo)(command)` — `command = { orderItemId, customerId,
rating, customerRemark? }`. `getById` → `NOT_FOUND`; ownership mismatch →
  `UNAUTHORIZED`; then `repo.update`.
- `deleteReviewUseCase(repo)(command)` — `command = { orderItemId, customerId }`.
  `getById` → `NOT_FOUND`; ownership → `UNAUTHORIZED`; then `repo.remove`.
- Cart use cases:
  - `addItemUseCase(repo)(command)` — `command = { customerId, variantId,
quantity }`. `repo.getStock(variantId)` → `validateQuantity`; then
    `repo.addItem`.
  - `updateItemUseCase(repo)(command)` — `command = { customerId, itemId,
quantity }`. `repo.getCartId` → `NOT_FOUND`; `repo.getCartItem` →
    `NOT_FOUND`; `getStock` → `validateQuantity`; then `repo.updateItem`.
  - `removeItemUseCase(repo)(command)` — `command = { customerId, itemId }`.
    `getCartId` → `NOT_FOUND`; `repo.removeItem` (0 rows → `NOT_FOUND`).
- Orders (amend/cancel):
  - `amendOrderUseCase(repo)(command)` — `command = { customerId, orderId,
items: { variantId, quantity }[] }`. `repo.getOrderForMutation(orderId,
customerId)` → `NOT_FOUND`; `status !== 'pending'` → `CONFLICT`; then
    `buildOrderItems` with **effective stock = available + this order's held
    quantity** (so a customer isn't blocked by their own reservation); then
    `repo.amendOrder`.
  - `cancelOrderUseCase(repo)(command)` — `command = { customerId, orderId }`.
    `getOrderForMutation` → `NOT_FOUND`; `status !== 'pending'` → `CONFLICT`;
    then `repo.cancelOrder`.
- Payments (use-case fakes: `PaymentRepository` + `PaymentGateway`):
  - `handleCallbackUseCase(repo, gateway)(command)` — `command = { reference }`.
    `repo.getOrderByReference(reference)` → `NOT_FOUND`; already non-`pending` →
    `ok({ already_processed: true })`; `gateway.verifyTransaction(reference)`;
    non-success → `repo.markOrderFailed(orderId)`; success →
    `repo.markOrderProcessingByOrderId(orderId)`.
- Media (use-case fakes: `MediaRepository` + `MediaStorage`):
  - `createAvatarUseCase(storage, repo)(input)` — `storage.upload(file,
'avatars')` → `repo.createAvatar`.
  - `updateAvatarUseCase(storage, repo)(input)` — upload only if `file` present,
    then `repo.updateAvatar`.
  - `createProductMediaUseCase(storage, repo)(input)` — `storage.upload` each
    file under `'products'`, then `repo.createProductMedia`.
  - `updateProductMediaUseCase(storage, repo)(input)` — upload only if `file`
    present, then `repo.updateProductMedia`.

> The port method names (`getVariantBySku`, `getOrderItemOwner`, `getById`,
> `getStock`, `getCartId`, `getCartItem`, `addItem`, `updateItem`, `removeItem`,
> `storeExists`, `deliveryInfoBelongsTo`, `getVariantPrices`,
> `getAvailableStock`, `getOrderForMutation`, `amendOrder`, `cancelOrder`,
> `getOrderByReference`, `markOrderFailed`, `markOrderProcessingByOrderId`, …)
> are the **contract** — the fake must expose exactly these names and shapes.
> When unsure, mirror the existing unit-test fakes.

### 3.6 External-service ports (mocking seams)

These ports wrap external HTTP services. **Never call the real service in unit
tests — fake the port.** The real adapter is exercised only by a thin,
env-gated integration/smoke test.

- `#src/context/payments/ports/payment-gateway.ts` — `PaymentGateway`
  - `initializeTransaction(input): Promise<{ status, message?, data: { reference, authorization_url, access_code } }>`
  - `verifySignature(rawBody, signature): boolean`
  - `verifyTransaction(reference): Promise<{ status, message?, data: { status } }>`
  - A fake returns canned `{ status: true, data: {…} }` values — no Paystack, no
    HMAC secrets. This is how you mock Paystack.
- `#src/context/media/ports/media-storage.ts` — `MediaStorage`
  - `upload(file: { buffer, originalname, mimetype }, folder: 'avatars' | 'products'): Promise<{ filename, filepath, filetype }>`
  - A fake returns `{ filename: 'fake-id', filepath: 'https://fake/fake.jpg',
filetype: file.mimetype }` — no Cloudinary. This is how you mock Cloudinary.

The payment and media **use cases depend on these ports**, so a plain fake
object removes the external dependency entirely (this unblocks the previously
`it.skip` webhook/callback/job tests and lets the media tests run without real
Cloudinary uploads).

---

## 4. Integration & adversarial coverage (already present)

These already exist and should be **maintained, not duplicated**:

- `src/tests/integrated/**` — the per-endpoint happy-path + negative tests.
- `src/tests/integrated/adversarial/**` — the strict contract suite
  (validation bypass, boundary/precision, uniqueness, authorization, ownership,
  state-machine, query injection, param coercion).

A blind agent adding integration coverage should:

- Assert **behavior** (rejected / accepted) and use the "one of several 4xx"
  tolerance helper rather than over-pinning exact codes where the app is
  legitimately flexible (see `adversarial/helpers.ts` `expectRejected`).
- Verify **money is integer kobo** and **arithmetic** (`total_amount`,
  `total_price`) exactly.
- Not re-seed data that the main fixtures already create — prefer self-contained
  seeding (see `adversarial/helpers.ts`).

---

## 5. Conventions

- **Run**: `pnpm test` from `packages/thrift-api`, under **Node 20+** (the suite
  uses `Array.prototype.toSpliced`; CI runs Node 22). Start the server first
  with `pnpm test-server` (port 1027, foreground). Agents/automation use the
  `:agent` variants instead: `pnpm test-server:agent` (port 1037, background)
  then `pnpm test:agent`.
- **Imports**: use the `#src/...` alias; snake_case in HTTP payloads/DB,
  camelCase in domain/application.
- **Fakes**: plain objects implementing the port; no mocking framework.
- **Isolation**: each test seeds and tears down its own data (reuse the helpers
  in `src/tests/integrated/helpers/`).
- **Naming**: `it('rejects a …')` / `it('returns … for …')` — name the rule, not
  the mechanics.

---

## 6. Current coverage & gaps

The last full run (Node 22) had **434 tests, all passing**, across 151 suites in
about 4m15s:

| Group                  | Tests |
| ---------------------- | ----- |
| Unit                   | 150   |
| Integrated             | 284   |
| — of which adversarial | 101   |
| **Total**              | 434   |

Unit by area: catalog 44, shared 29, orders 28, payments 17, cart 16, reviews 10,
media 6. Integrated by area: adversarial 101, reviews 30, store staff 24,
delivery info 21, media 21, cart 18, orders 18, stores 13, analytics 11,
profiles 8, products 7, payments 12 (2 callback + 10 module-scope tests in
`integrated/payments/index.ts`).

The unit suite (`src/tests/unit/`) now covers:

- **Shared**: `result`, `money`, `domain-error`, `to-http-error`.
- **Catalog**: `createProduct`, `createVariant`, `validateVariantUpdate`,
  `handleSortQuery`, and the create/update-variant use cases.
- **Orders**: `createOrder`, `buildOrderItems`, edge cases, amend, and cancel.
- **Cart**: `validateQuantity` plus the add/update/remove use cases.
- **Reviews**: create/update/delete use cases (ownership + duplicate).
- **Payments**: callback, webhook, and process-order job use cases against fake
  `PaymentGateway` / `PaymentRepository` ports.
- **Media**: the four media use cases against fake `MediaStorage` /
  `MediaRepository` ports.

The unit coverage gate (`pnpm coverage:agent` — currently the only coverage
script — also run in CI) enforces
**lines 65 / functions 70 / branches 75 / statements 65** over `src/shared/**`
and `src/context/*/domain/**`.

Remaining gaps:

1. **Integration isolation** — the legacy `integrated/cart/index.ts` still
   mutates a shared `cartItems` array across `it` blocks. A failure mid-suite
   can leave a stale server-side cart; the adversarial suite's self-contained
   seeding is the pattern to follow.
2. **Contract testing** — no consumer-driven contract tests (Pact). Response
   shapes are validated by Joi, but consumers are not part of the contract.
3. **Property-based testing** — `fast-check` would fit the money/stock
   invariants; it is not used yet.
4. **Mutation testing** — no Stryker run, so the suite's bug-catching power is
   unmeasured.
5. **Runtime / flake policy** — the e2e portion is the slow part and is not
   sharded. `test:ci` retries once (`--retries 1`), but there is no flake
   quarantine.
6. **Payment test registration** — `integrated/payments/index.ts` calls
   `describe('Payments')` at module scope, so Mocha's recursive loader runs its
   10 tests outside the main `Testing typical user actions` wrapper. Move them
   into the suite's `describe` for coherent grouping and teardown.

New endpoints covered by the integration surface: `PATCH /v1/orders/:order_id`
(amend), `POST /v1/orders/:order_id/cancel`, and `GET /v1/payments/callback`.

---

## 7. CI pipeline

Workflows live in `.github/workflows/`.

### `run-tests.yml` — "Thrift-api Testing"

Runs on every push and pull request targeting `main` or `dev`:

1. Start Supabase (`supabase/setup-cli`, pinned to `2.120.0`).
2. Install workspace dependencies (`pnpm install --frozen-lockfile`, pnpm 10).
3. `pnpm --filter thrift-api build` and `typecheck`.
4. Coverage gate: `pnpm --filter thrift-api coverage:agent`.
5. Start the QStash dev server (`2.40.12`) on `:8080`.
6. Start the API on `:1027` with `test-server`.
7. Run `pnpm --filter thrift-api test:ci` (full suite, `--retries 1`).
8. On failure, print `results.log`.

CI runs **Node 22**. Integration tests use the local Supabase instance; Cloudinary
and Paystack are the real services (repository secrets), while QStash is the
local dev server (`QSTASH_URL=http://localhost:8080`, `APP_URL=http://localhost:1027`).

### `deploy-api-to-prod.yml`

Runs when "Thrift-api Testing" completes successfully (or via manual dispatch)
and deploys `packages/thrift-api` to Vercel production.

### Other workflows

- `deploy-web-to-prod.yml` — deploys `packages/thrift-web` to Vercel on pushes to `main`.
- `db-backup.yaml` — Supabase backup (push/PR to `main`/`dev`, manual, and nightly).
- `db-keepalive.yaml` — pings the Supabase REST API every 3 days.
