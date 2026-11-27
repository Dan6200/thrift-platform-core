# Cart and catalog navigation troubleshooting

## Symptoms and causes

- Anonymous Add to Cart redirected to login, and both cart surfaces explicitly hid the cart without a user. Guest carts now persist in browser local storage (`thrift:guest-cart:v1`). Checkout continues to require an account.
- Signed-in cart requests failed in the browser because the separate API Worker did not answer Authorization preflights with CORS headers. A direct authenticated request could succeed while the browser failed. API CORS now runs before database initialization and routing, permits the production web origin and local development origins, and preserves headers on authentication errors. Unknown origins cannot preflight. JWT and customer authorization remain enforced.
- Server auth cookies lost their nested options, middleware discarded refreshed cookies, and login ignored its requested return page. These paths now preserve cookies and use a validated local redirect. The login form explicitly uses POST to prevent a native fallback from putting credentials in the URL.
- Cart queries shared one cache key between accounts. They now include the account ID; guest and account views are separate. Cart failures are visible with a retry action instead of being shown as an empty cart.
- Category pages queried Meilisearch directly with unconfigured filters and unnormalized data. Subcategory links had no route, and several navbar links treated subcategories as categories. Both route families now use the public catalog API with server pagination.
- The API accepted category/subcategory parameters but ignored them and counted the entire catalog. The repository now binds both predicates into the products query and matching count query. Exact names and normalized slugs (including apostrophes) work. A response-schema requirement on each array member also rejected empty filtered results; empty arrays are now valid while malformed members remain invalid.

## Guest transfer and authority

Guest prices and media are previews only. The API receives variant IDs and quantities and calculates authoritative prices and stock. On login, guest quantities are added to existing account quantities. A transfer plan is persisted before sending writes, retaining absolute target quantities until the server confirms them. Retrying an uncertain write uses the same target, rather than incrementing again. Confirmed guest items are removed individually. Failed transfers retain the unconfirmed items for retry.

Account requests capture that account's access token, and fail if the current session no longer belongs to it. Only one transfer runs per account at a time in the browser runtime. This is not a server-side cross-tab transaction: simultaneous edits from separate devices or tabs can race with an absolute quantity update.

## Verification

1. Rebuild the API with `pnpm --filter thrift-api build`; confirm `built/src/index.js` installs `storefrontCors` and the compiled catalog repository contains the normalized category predicate.
2. Start the real local Supabase stack and QStash dev server, then the canonical `pnpm --filter thrift-api test-server:agent`. Run the complete `pnpm --filter thrift-api test:agent`; use both debug variants when investigating failures.
3. Verify OPTIONS `/v1/cart` from the web origin returns 204 and allows Authorization. Verify unauthenticated GET still returns 401 with CORS headers. No token is needed for the preflight.
4. Compare `/v1/products?category=electronics&limit=1` against the complete catalog: one matching row, with a count of all matching Electronics products. Check a nonexistent filter returns an empty array/count zero.
5. Run the browser regressions under `tests/browser/`: guest add/edit/remove/reload, all five navbar catalog routes, and account transfer through the real login form. The account test uses a disposable confirmed diagnostic account from a private fixture and verifies POST/PUT writes and quantities after reload. Never commit that fixture or print tokens/passwords.
6. Build and deploy API before web, then run the runtime smoke tests against the deployed services. Confirm actual persisted cart quantities, not only HTTP statuses. No payment or order placement is needed to verify cart behavior.

## Routes

- `/categories/electronics`
- `/subcategories/computers`
- `/subcategories/electronic-accessories` (Electronics + Accessories)
- `/subcategories/mens-fashion`
- `/subcategories/womens-fashion`

Old category URLs for these subcategories redirect to the canonical routes. Category browsing no longer depends on Meilisearch availability.

## Verified deployment (27 November 2026)

API deployment `45945531324` and web deployment `45945845196` succeeded. GitHub API checks passed all 480 tests; the unit coverage check passed 171 tests. The complete local API debug suite also passed 480 tests after rebuilding/restarting with the empty-result schema fix (the first run exposed that bug: 479 passed, one failed).

Production browser checks passed guest add/increase/decrease/remove and reload persistence; real sign-in returned to the cart, transferred the guest item, and issued successful POST 201, PUT 200 and DELETE 204 calls. Quantity remained two after reloading, and direct database inspection confirmed zero cart items after removal. Session cookie path and persistence were verified without exposing cookie contents. All five catalog destinations rendered products. A 390-pixel mobile check confirmed no category overflow and preserved the checkout return URL when redirecting guests to sign-in.

Local `next build` failed downloading Google Fonts; the deployed OpenNext build compiled and typechecked successfully in GitHub. Local web runtime smoke attempts also intermittently failed with Node `fetch failed` against the live Workers. These failures were retained and assertions were not relaxed; browser verification checked the actual deployed behavior independently.

The final complete web run (serial, with every test included) finished at **17 passed, one failed out of 18**. The sole failure was the deployed cart preflight smoke request: Node could not connect to Cloudflare's IPv4 addresses (`ETIMEDOUT`), and IPv6 returned `ENETUNREACH`. A separate diagnostic captured those connection causes. The same request contract passed locally and through the real authenticated browser flow. No assertion, external dependency, or service wiring was replaced to obtain a pass. The temporary diagnostic auth user, profile, cart and private fixture were removed after confirming persisted cart removal.
