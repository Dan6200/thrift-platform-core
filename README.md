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

The schema below is generated with [`tbls`](https://github.com/k1LoW/tbls) from
the running local Supabase database. Regenerate it with `pnpm docs:schema` (see
[Regenerating the schema docs](#regenerating-the-schema-docs)).

#### Tables

| Name                                   | Columns | Comment | Type       |
| -------------------------------------- | ------- | ------- | ---------- |
| public.profiles                        | 12      |         | BASE TABLE |
| public.address                         | 9       |         | BASE TABLE |
| public.categories                      | 4       |         | BASE TABLE |
| public.subcategories                   | 5       |         | BASE TABLE |
| public.payment_info                    | 12      |         | BASE TABLE |
| public.delivery_info                   | 8       |         | BASE TABLE |
| public.featured_product_collections    | 5       |         | BASE TABLE |
| public.app_config                      | 5       |         | BASE TABLE |
| public.media                           | 8       |         | BASE TABLE |
| public.profile_media                   | 2       |         | BASE TABLE |
| public.stores                          | 9       |         | BASE TABLE |
| public.store_staff                     | 5       |         | BASE TABLE |
| public.locations                       | 7       |         | BASE TABLE |
| public.pages                           | 8       |         | BASE TABLE |
| public.page_sections                   | 9       |         | BASE TABLE |
| public.store_categories                | 6       |         | BASE TABLE |
| public.products                        | 9       |         | BASE TABLE |
| public.product_variants                | 6       |         | BASE TABLE |
| public.product_options                 | 5       |         | BASE TABLE |
| public.product_option_values           | 7       |         | BASE TABLE |
| public.variant_to_option_values        | 7       |         | BASE TABLE |
| public.variant_price_overrides         | 7       |         | BASE TABLE |
| public.product_store_category_links    | 4       |         | BASE TABLE |
| public.featured_products               | 8       |         | BASE TABLE |
| public.featured_product_links          | 5       |         | BASE TABLE |
| public.product_media_links             | 4       |         | BASE TABLE |
| public.product_availability            | 6       |         | BASE TABLE |
| public.inventory                       | 7       |         | BASE TABLE |
| public.orders                          | 10      |         | BASE TABLE |
| public.order_items                     | 7       |         | BASE TABLE |
| public.shopping_cart                   | 4       |         | BASE TABLE |
| public.shopping_cart_item              | 6       |         | BASE TABLE |
| public.product_reviews                 | 6       |         | BASE TABLE |
| public.vendor_reviews                  | 7       |         | BASE TABLE |
| public.customer_reviews                | 7       |         | BASE TABLE |
| public.processed_webhooks              | 4       |         | BASE TABLE |
| public.transactions                    | 10      |         | BASE TABLE |
| public.financial_accounts              | 5       |         | BASE TABLE |
| public.ledger_entries                  | 6       |         | BASE TABLE |
| public.ledger_lines                    | 5       |         | BASE TABLE |
| public.product_variant_inventory       | 3       |         | VIEW       |
| public.user_wallet_balance             | 2       |         | VIEW       |
| public.product_variant_effective_price | 6       |         | VIEW       |

#### Stored procedures and functions

| Name                                          | ReturnType | Arguments                                          | Type     |
| --------------------------------------------- | ---------- | -------------------------------------------------- | -------- |
| public.trigger_set_timestamp                  | trigger    |                                                    | FUNCTION |
| public.handle_new_user                        | trigger    |                                                    | FUNCTION |
| public.handle_update_user                     | trigger    |                                                    | FUNCTION |
| public.handle_delete_user                     | trigger    |                                                    | FUNCTION |
| public.has_store_access                       | bool       | p_user_id uuid, p_store_id integer, p_roles text[] | FUNCTION |
| public.check_product_media_links_filetype     | trigger    |                                                    | FUNCTION |
| public.enforce_single_special_image           | trigger    |                                                    | FUNCTION |
| public.prevent_accounting_ledger_modification | trigger    |                                                    | FUNCTION |
| public.verify_ledger_entry_balance            | trigger    |                                                    | FUNCTION |
| public.set_variant_to_option_value_option_id  | trigger    |                                                    | FUNCTION |

#### Enums

| Name                              | Values                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------- |
| public.featured_product_type_enum | carousel, grid                                                                   |
| public.financial_account_type     | asset, expense, liability, revenue                                               |
| public.gateway_provider_enum      | flutterwave, paystack, stripe                                                    |
| public.ledger_event               | order_settlement, partial_refund, platform_fee_adjustment, refund, vendor_payout |
| public.modifier_type              | absolute, percentage                                                             |
| public.order_status               | cancelled, delivered, failed, pending, processing, refunded, shipped             |

#### Relations

```mermaid
erDiagram

"public.subcategories" }o--|| "public.categories" : "FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE"
"public.payment_info" }o--|| "public.profiles" : "FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE"
"public.delivery_info" }o--|| "public.profiles" : "FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE"
"public.delivery_info" }o--|| "public.address" : "FOREIGN KEY (address_id) REFERENCES address(address_id) ON DELETE CASCADE"
"public.media" }o--|| "public.profiles" : "FOREIGN KEY (uploader_id) REFERENCES profiles(id) ON DELETE CASCADE"
"public.profile_media" |o--|| "public.profiles" : "FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE"
"public.profile_media" |o--|| "public.media" : "FOREIGN KEY (media_id) REFERENCES media(media_id) ON DELETE CASCADE"
"public.stores" }o--|| "public.profiles" : "FOREIGN KEY (vendor_id) REFERENCES profiles(id) ON DELETE CASCADE"
"public.stores" }o--o| "public.address" : "FOREIGN KEY (address_id) REFERENCES address(address_id) ON DELETE CASCADE"
"public.store_staff" }o--|| "public.profiles" : "FOREIGN KEY (staff_id) REFERENCES profiles(id) ON DELETE CASCADE"
"public.store_staff" }o--|| "public.stores" : "FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE"
"public.locations" }o--o| "public.address" : "FOREIGN KEY (address_id) REFERENCES address(address_id) ON DELETE CASCADE"
"public.locations" }o--|| "public.stores" : "FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE"
"public.pages" }o--|| "public.stores" : "FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE"
"public.page_sections" }o--|| "public.pages" : "FOREIGN KEY (page_id) REFERENCES pages(page_id) ON DELETE CASCADE"
"public.store_categories" }o--|| "public.stores" : "FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE"
"public.products" }o--|| "public.profiles" : "FOREIGN KEY (vendor_id) REFERENCES profiles(id) ON DELETE CASCADE"
"public.products" }o--|| "public.categories" : "FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE"
"public.products" }o--|| "public.subcategories" : "FOREIGN KEY (subcategory_id) REFERENCES subcategories(subcategory_id) ON DELETE CASCADE"
"public.products" }o--|| "public.stores" : "FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE"
"public.product_variants" }o--|| "public.products" : "FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE"
"public.product_options" }o--|| "public.products" : "FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE"
"public.product_option_values" }o--|| "public.product_options" : "FOREIGN KEY (option_id) REFERENCES product_options(option_id) ON DELETE CASCADE"
"public.variant_to_option_values" }o--|| "public.product_variants" : "FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE"
"public.variant_to_option_values" }o--|| "public.product_options" : "FOREIGN KEY (option_id) REFERENCES product_options(option_id) ON DELETE CASCADE"
"public.variant_to_option_values" }o--|| "public.product_option_values" : "FOREIGN KEY (variant_value_id) REFERENCES product_option_values(option_value_id) ON DELETE CASCADE"
"public.variant_price_overrides" }o--|| "public.product_variants" : "FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE"
"public.product_store_category_links" }o--|| "public.store_categories" : "FOREIGN KEY (store_category_id) REFERENCES store_categories(store_category_id) ON DELETE CASCADE"
"public.product_store_category_links" }o--|| "public.products" : "FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE"
"public.featured_products" }o--|| "public.products" : "FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE"
"public.featured_product_links" }o--|| "public.featured_product_collections" : "FOREIGN KEY (collection_id) REFERENCES featured_product_collections(collection_id) ON DELETE CASCADE"
"public.featured_product_links" }o--|| "public.products" : "FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE"
"public.product_media_links" }o--|| "public.media" : "FOREIGN KEY (media_id) REFERENCES media(media_id) ON DELETE CASCADE"
"public.product_media_links" }o--|| "public.product_variants" : "FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE"
"public.product_availability" }o--|| "public.products" : "FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE"
"public.inventory" }o--o| "public.locations" : "FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE"
"public.inventory" }o--|| "public.product_variants" : "FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE"
"public.orders" }o--|| "public.profiles" : "FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE"
"public.orders" }o--o| "public.delivery_info" : "FOREIGN KEY (delivery_info_id) REFERENCES delivery_info(delivery_info_id) ON DELETE SET NULL"
"public.orders" }o--|| "public.stores" : "FOREIGN KEY (store_id) REFERENCES stores(store_id) ON DELETE CASCADE"
"public.order_items" }o--|| "public.product_variants" : "FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE"
"public.order_items" }o--|| "public.orders" : "FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE"
"public.shopping_cart" |o--|| "public.profiles" : "FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE"
"public.shopping_cart_item" }o--|| "public.product_variants" : "FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE"
"public.shopping_cart_item" }o--|| "public.shopping_cart" : "FOREIGN KEY (cart_id) REFERENCES shopping_cart(cart_id) ON DELETE CASCADE"
"public.product_reviews" }o--|| "public.profiles" : "FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE"
"public.product_reviews" |o--|| "public.order_items" : "FOREIGN KEY (order_item_id) REFERENCES order_items(order_item_id) ON DELETE CASCADE"
"public.vendor_reviews" }o--|| "public.profiles" : "FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE"
"public.vendor_reviews" }o--|| "public.profiles" : "FOREIGN KEY (vendor_id) REFERENCES profiles(id) ON DELETE CASCADE"
"public.vendor_reviews" }o--|| "public.orders" : "FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE"
"public.customer_reviews" }o--|| "public.profiles" : "FOREIGN KEY (customer_id) REFERENCES profiles(id) ON DELETE CASCADE"
"public.customer_reviews" }o--|| "public.profiles" : "FOREIGN KEY (vendor_id) REFERENCES profiles(id) ON DELETE CASCADE"
"public.customer_reviews" }o--|| "public.orders" : "FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE"
"public.transactions" }o--|| "public.profiles" : "FOREIGN KEY (customer_id) REFERENCES profiles(id)"
"public.transactions" }o--|| "public.orders" : "FOREIGN KEY (order_id) REFERENCES orders(order_id)"
"public.financial_accounts" }o--o| "public.profiles" : "FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE RESTRICT"
"public.ledger_entries" }o--o| "public.orders" : "FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE RESTRICT"
"public.ledger_entries" }o--o| "public.transactions" : "FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id) ON DELETE RESTRICT"
"public.ledger_lines" }o--|| "public.financial_accounts" : "FOREIGN KEY (account_id) REFERENCES financial_accounts(account_id)"
"public.ledger_lines" }o--|| "public.ledger_entries" : "FOREIGN KEY (entry_id) REFERENCES ledger_entries(entry_id) ON DELETE RESTRICT"

"public.profiles" {
  uuid id
  varchar_30_ first_name
  varchar_30_ last_name
  varchar_320_ email
  varchar_20_ phone
  date dob
  varchar_30_ country
  boolean is_customer
  boolean is_vendor
  timestamp_with_time_zone deleted_at
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.address" {
  integer address_id
  varchar_100_ address_line_1
  varchar_100_ address_line_2
  varchar_50_ city
  varchar_50_ state
  varchar_20_ zip_postal_code
  varchar_50_ country
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.categories" {
  integer category_id
  varchar_50_ category_name
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.subcategories" {
  integer subcategory_id
  integer category_id FK
  varchar_50_ subcategory_name
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.payment_info" {
  integer payment_id
  uuid customer_id FK
  varchar_20_ payment_type
  varchar authorization_code
  varchar_50_ provider
  varchar_320_ email
  varchar_4_ last4
  varchar_20_ brand
  varchar_2_ exp_month
  varchar_4_ exp_year
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.delivery_info" {
  integer delivery_info_id
  uuid customer_id FK
  varchar_30_ recipient_full_name
  integer address_id FK
  varchar phone_number
  varchar delivery_instructions
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.featured_product_collections" {
  integer collection_id
  varchar_255_ name
  text description
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.app_config" {
  varchar config_key
  varchar config_value
  text description
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.media" {
  integer media_id
  varchar filename
  varchar filepath
  varchar_50_ filetype
  text description
  uuid uploader_id FK
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.profile_media" {
  uuid profile_id FK
  integer media_id FK
}
"public.stores" {
  integer store_id
  varchar_50_ store_name
  varchar_100_ custom_domain
  uuid vendor_id FK
  varchar_255_ favicon
  jsonb global_styles
  integer address_id FK
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.store_staff" {
  integer store_id FK
  uuid staff_id FK
  varchar role
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.locations" {
  integer location_id
  integer store_id FK
  varchar location_name
  integer address_id FK
  boolean is_primary
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.pages" {
  integer page_id
  integer store_id FK
  varchar page_slug
  varchar page_title
  varchar page_type
  jsonb seo_data
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.page_sections" {
  integer section_id
  integer page_id FK
  varchar section_title
  varchar section_type
  jsonb section_data
  integer sort_order
  jsonb styles
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.store_categories" {
  integer store_category_id
  integer store_id FK
  varchar_50_ name
  text description
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.products" {
  integer product_id
  varchar_255_ title
  text__ description
  uuid vendor_id FK
  integer store_id FK
  integer category_id FK
  integer subcategory_id FK
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.product_variants" {
  integer variant_id
  integer product_id FK
  varchar_100_ sku
  bigint base_price
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.product_options" {
  integer option_id
  integer product_id FK
  varchar_50_ option_name
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.product_option_values" {
  integer option_value_id
  integer option_id FK
  varchar_50_ value
  bigint default_price_modifier
  modifier_type default_modifier_type
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.variant_to_option_values" {
  integer variant_id FK
  integer variant_value_id FK
  integer option_id FK
  bigint price_modifier
  modifier_type modifier_type
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.variant_price_overrides" {
  bigint override_id
  integer variant_id FK
  bigint absolute_price
  timestamp_with_time_zone start_date
  timestamp_with_time_zone end_date
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.product_store_category_links" {
  integer product_id FK
  integer store_category_id FK
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.featured_products" {
  integer featured_product_id
  integer product_id FK
  featured_product_type_enum feature_type
  timestamp_with_time_zone start_date
  timestamp_with_time_zone end_date
  integer sort_order
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.featured_product_links" {
  integer collection_id FK
  integer product_id FK
  integer sort_order
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.product_media_links" {
  integer variant_id FK
  integer media_id FK
  boolean is_display_image
  boolean is_thumbnail_image
}
"public.product_availability" {
  integer availability_id
  integer product_id FK
  timestamp_with_time_zone available_from
  timestamp_with_time_zone available_until
  text notes
  timestamp_with_time_zone created_at
}
"public.inventory" {
  integer inventory_id
  integer variant_id FK
  integer location_id FK
  integer quantity_change
  varchar reason
  text notes
  timestamp_with_time_zone created_at
}
"public.orders" {
  integer order_id
  uuid customer_id FK
  integer store_id FK
  integer delivery_info_id FK
  timestamp_with_time_zone order_date
  bigint total_amount
  order_status status
  text payment_reference
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.order_items" {
  integer order_item_id
  integer order_id FK
  integer variant_id FK
  integer quantity
  numeric_19_4_ price_at_purchase
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.shopping_cart" {
  integer cart_id
  uuid customer_id FK
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.shopping_cart_item" {
  integer item_id
  integer cart_id FK
  integer variant_id FK
  integer quantity
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.product_reviews" {
  integer order_item_id FK
  numeric_3_2_ rating
  uuid customer_id FK
  varchar customer_remark
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.vendor_reviews" {
  uuid vendor_id FK
  uuid customer_id FK
  integer order_id FK
  numeric_3_2_ rating
  varchar customer_remark
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.customer_reviews" {
  uuid customer_id FK
  uuid vendor_id FK
  integer order_id FK
  numeric_3_2_ rating
  varchar vendor_remark
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.processed_webhooks" {
  varchar_255_ event_id
  varchar_50_ provider
  jsonb payload
  timestamp_with_time_zone created_at
}
"public.transactions" {
  uuid transaction_id
  integer order_id FK
  uuid customer_id FK
  gateway_provider_enum gateway_provider
  text gateway_reference
  bigint amount
  varchar_3_ currency
  text status
  timestamp_with_time_zone created_at
  timestamp_with_time_zone updated_at
}
"public.financial_accounts" {
  uuid account_id
  uuid user_id FK
  text account_type
  text name
  timestamp_with_time_zone created_at
}
"public.ledger_entries" {
  bigint entry_id
  uuid transaction_id FK
  integer order_id FK
  ledger_event event_type
  text description
  timestamp_with_time_zone created_at
}
"public.ledger_lines" {
  bigint line_id
  bigint entry_id FK
  uuid account_id FK
  bigint amount
  timestamp_with_time_zone created_at
}
"public.product_variant_inventory" {
  integer variant_id
  integer location_id
  bigint quantity_available
}
"public.user_wallet_balance" {
  uuid user_id
  numeric balance_in_cents
}
"public.product_variant_effective_price" {
  integer variant_id
  integer product_id
  varchar_100_ sku
  bigint base_price
  bigint override_price
  numeric effective_price
}
```

> Generated by [tbls](https://github.com/k1LoW/tbls)

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

## Regenerating the schema docs

The [Database](#database) section is generated by
[`tbls`](https://github.com/k1LoW/tbls) from the running local Supabase
database. Do not hand-edit the generated tables or ER diagram.

```bash
# Requires tbls: https://github.com/k1LoW/tbls#install
supabase start            # from packages/thrift-api
pnpm docs:schema          # from the repo root
```

This refreshes the per-table markdown and ER diagram in `doc/schema/` (ignored
by git) and rewrites the schema block in this README from the live schema. If
the database is not on the default local port, set `SUPABASE_DB_URL` to the
connection string you want `tbls` to read.
