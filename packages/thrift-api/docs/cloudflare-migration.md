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

## Migration sequence

1. Add Worker runtime adapters and local preview configuration for the API and
   web. Keep the existing Vercel deployment definitions until Cloudflare preview
   deployments pass validation.
2. Configure the API Worker to use the Hyperdrive binding for Supabase and
   Cloudflare secrets/vars for runtime configuration. Preserve the existing
   Express routes and Upstash integrations.
3. Move both production workflows to Cloudflare deploys. Preserve the API's
   test-success deployment gate and the web's `main` branch trigger.
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

The web Worker needs its existing `NEXT_PUBLIC_*` build-time values and any
server-side secrets used by Next.js. Cloudflare production and preview
configurations must be kept distinct.

GitHub Actions will need a Cloudflare API token with Workers deployment
permissions and the Cloudflare account ID. Configure these as repository
secrets before enabling automatic production deployment.

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
- Cut over DNS only after the above checks pass. Keep Vercel deployments
  available through the rollback window.

## Current status

- [x] Existing Vercel deployment workflows and configuration identified.
- [x] Existing Cloud Run search deployment identified and retained.
- [x] Push the pre-migration commits before starting changes.
- [ ] Configure Cloudflare Workers for the web application with OpenNext.
- [ ] Configure Cloudflare Workers for the API, Hyperdrive, and runtime bindings.
- [ ] Update CI deployment workflows and repository secrets.
- [ ] Validate preview deployments and complete production cutover.
