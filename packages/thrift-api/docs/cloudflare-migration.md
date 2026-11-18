# Cloudflare migration plan

This document tracks the migration of Thrift's API and web application from
Vercel to Cloudflare. Search remains on Google Cloud Run for this migration.

## Target deployment

- **Web:** `thrift-web`, Next.js 15, deployed to Cloudflare Workers with
  `@opennextjs/cloudflare`.
- **API:** `thrift-api`, Express deployed to Cloudflare Workers through
  Cloudflare's Node HTTP server adapter.
- **Database:** existing Supabase Postgres, reached through Cloudflare
  Hyperdrive. This changes the connection path, not the database provider.
- **Queue and cache:** Upstash QStash and Upstash Redis remain external services.
- **Search:** keep the existing Cloud Build → Artifact Registry → Cloud Run
  deployment for `thrift-classical-search`.
- **Media and payments:** Cloudinary and Paystack remain external integrations.

The Vercel deployment workflow files are currently commented out, so pushes no
longer trigger Vercel deployments. To roll back before Cloudflare cutover,
remove the comment prefix from those files and restore their prior triggers.
The Cloudflare workflows are present but automatic deployment remains gated
until Cloudflare resources and credentials are configured.

## Migration sequence

1. Add Worker runtime adapters and local preview configuration for the API and
   web. Keep the commented Vercel workflow definitions available for rollback.
2. Configure the API Worker to use the Hyperdrive binding for Supabase and
   Cloudflare secrets/vars for runtime configuration. Preserve the existing
   Express routes and Upstash integrations.
3. Configure the Cloudflare production workflows. Preserve the API's
   test-success deployment gate and the web's API-deploy-success trigger.
4. Validate the production-equivalent Worker previews, database transactions,
   payment callbacks and QStash callbacks before changing public DNS or removing
   the Vercel project configuration.
5. After cutover is confirmed, remove Vercel-only deployment configuration and
   analytics dependencies, and document rollback steps.

## Runtime configuration to provision

The API Worker needs a Hyperdrive binding named `HYPERDRIVE` pointing at the
Supabase Postgres connection string, plus the existing production secrets and
variables used by the API. Do not commit secret values. QStash callback URLs and
Paystack callback URLs must point at the production API hostname after cutover.

The API Wrangler config currently uses the marker
`REPLACE_WITH_CLOUDFLARE_HYPERDRIVE_ID`. The manual GitHub Actions workflow
`.github/workflows/provision-api-hyperdrive.yml` creates or verifies the
`thrift-api-supabase` configuration and reports its ID. It reads
`SUPABASE_DB_URL` from a GitHub Actions secret and leaves the database URL and
password out of logs. Add the returned ID as the repository variable
`CLOUDFLARE_HYPERDRIVE_ID`; the API deploy workflow substitutes it into the
Wrangler config. The Worker entry maps the binding to the existing
`SUPABASE_DB_URL` setting before importing the Express application.

The Cloudflare account ID is public configuration and is stored in the API and
web Wrangler configs. Before running the provisioning workflow, configure
repository secrets `SUPABASE_DB_URL` and `CLOUDFLARE_API_TOKEN`. The Cloudflare
API token needs account-scoped **Hyperdrive Read** and **Hyperdrive Write**
permissions as well as the permissions needed to deploy Workers. To provision
the web cache bucket, it also needs account-scoped **Workers R2 Storage Write**.
R2 must first be activated for the account in the Cloudflare dashboard. The
workflow disables Hyperdrive query caching initially because cached reads are
not invalidated by database writes; revisit caching after validating the API's
read-after-write behavior.

The web Worker needs its existing `NEXT_PUBLIC_*` build-time values and any
server-side secrets used by Next.js. Cloudflare production and preview
configurations must be kept distinct.

GitHub Actions will need a Cloudflare API token with Workers deployment
permissions and the Cloudflare account ID. Configure these as repository
secrets before enabling automatic production deployment. The API workflow also
uses the `CLOUDFLARE_HYPERDRIVE_ID` repository variable. Set
`CLOUDFLARE_DEPLOY_ENABLED=true` only after the API and web bindings, secrets,
and R2 cache bucket are provisioned.

The web deployment workflow reads its public build-time configuration from
repository variables (`NEXT_PUBLIC_SERVER`, Cloudinary values, Supabase public
values, search URL and key, and the Upstash Redis URL). It reads
`UPSTASH_REDIS_REST_TOKEN` from a repository secret. The production values from
both package `.env.production` files have been uploaded to their Cloudflare
Workers with `wrangler secret bulk`; the web build variables and Upstash token
are also configured in GitHub. `NEXT_PUBLIC_SERVER` points at
`https://thrift-api.thrift-commerce.workers.dev`. Wrangler deploy does not copy
GitHub secrets into Worker secrets, so keep these configurations in sync when
they change.

## Verification and cutover checklist

- Build and preview each Worker using the production runtime adapter.
- Verify API reads and writes against Supabase through Hyperdrive, including
  transactions and concurrent stock updates.
- Verify authentication, cookies, CORS, multipart media uploads, Cloudinary,
  Upstash Redis, QStash signature validation and callback delivery, and Paystack
  callbacks.
- Verify web server rendering, server actions/route handlers, authentication,
  image delivery, search requests, and environment-specific values.
- Confirm deployment side effects in Cloudflare and confirm QStash/Paystack
  callbacks reach the deployed API.
- Cut over DNS only after the above checks pass. Keep the Vercel project
  configuration and commented workflow files available through the rollback
  window; restore the Vercel workflows if a rollback is needed.

## Current status

- [x] Existing Vercel deployment workflows and configuration identified.
- [x] Existing Cloud Run search deployment identified and retained.
- [x] Push the pre-migration commits before starting changes.
- [x] Add OpenNext/Wrangler tooling and initial Worker config for the web.
- [x] Add the API Worker entry, Hyperdrive mapping, and Cloudflare-safe logging.
- [x] Add gated Cloudflare API/web deployment workflows alongside the existing
      Vercel workflows.
- [x] Add manual, rerunnable Hyperdrive provisioning through GitHub Actions.
- [x] Comment out both Vercel production workflow files; retain their contents
      for manual rollback.
- [x] Provision the Cloudflare API and web Worker secrets from each package's
      `.env.production`; API and web secret names have been verified in
      Wrangler without exposing their values.
- [x] Validate product response types and make product detail pages render
      dynamically at request time.
- [x] Provision Hyperdrive from the `SUPABASE_DB_URL` GitHub secret and set the
      `CLOUDFLARE_HYPERDRIVE_ID` repository variable.
- [x] Upload API and web production Worker secrets from their `.env.production`
      files and configure the web build variables in GitHub.
- [x] Deploy the API Worker. The latest GitHub deployment workflow, including
      its API smoke checks, passed after limiting Worker database pools.
- [ ] Continue validating product reads through Hyperdrive; direct production
      reads return Knex pool acquisition timeouts, and the web homepage request
      timed out while waiting for product data.
- [x] Set the GitHub `NEXT_PUBLIC_SERVER` variable to
      `https://thrift-api.thrift-commerce.workers.dev`.
- [x] Enable R2 and create `thrift-web-opennext-cache`.
- [x] Build and deploy the web Worker at
      `https://thrift-web.thrift-commerce.workers.dev`; the deployment passed
      and Cloudflare published the Worker.
- [x] Skip initial OpenNext remote cache prepopulation during deploy because
      its helper stalls in CI; runtime R2 caching remains enabled and fills on
      cache misses.
- [ ] Verify the web homepage and product flows after fixing the API's
      intermittent Hyperdrive/Knex connection-pool failures.
- [ ] Configure production QStash token and signing keys as API Worker secrets.
      They are absent from the API `.env.production` and GitHub secret inventory.
      CI starts a QStash dev server for tests; local dev-server installation was
      blocked by an artifact download timeout.
- [ ] Keep automatic deployments gated until the web Worker and integrations
      are validated; manual workflow dispatches are available meanwhile.
- [ ] Validate preview deployments and complete production cutover.
