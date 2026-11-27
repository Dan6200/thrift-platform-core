# Hero and navigation audit

Audited on 22 November 2026 against the deployed Cloudflare web Worker.

## Findings and changes

The navbar-only fix left other surfaces dependent on the video frame underneath. The full audit covered the hero, both calls to action, desktop menus, theme selection, mobile navigation/search, and the cart drawer.

- The headline had no `h1`, and the video could extend a pixel past the viewport. The hero now uses a labelled section, a semantic heading, a positioned frame, and a small-viewport-height layout with enough minimum height for short screens to scroll safely.
- The Browse CTA inherited pale text on light purple in dark mode. Both CTAs now have explicit theme-aware foregrounds and surfaces, 48px minimum height, visible keyboard focus, and short transitions. Links contain no nested buttons.
- A 60% black video overlay keeps the white headline readable even over a white frame (approximately 5.74:1). Menus and action surfaces use solid theme colors instead of relying on blur for contrast.
- Welcome, categories, theme selection, search results, mobile navigation, and the cart drawer now have opaque backgrounds. Cart and mobile search have named close controls; mobile navigation has an accessible title and scrolls on short screens.
- Mobile search now uses the existing Radix dialog for focus containment, Escape handling, and return focus. Search results are keyboard-accessible links, and search loading/error messages have status/alert roles.
- The background video has a working Play/Pause control and a static poster fallback. A browser media-query hook reads reduced-motion preferences after hydration, responds to changes, and cleans up its listener. The initial implementation using the motion library's hook left autoplay disabled on the deployed site; the live playback check caught this and prompted the replacement. Playback is explicitly requested after the preference resolves; setting the autoplay attribute alone after media has loaded was insufficient in the deployed browser.
- The loading fallback shares the hero's heading, layout, overlay, font, poster and CTAs to avoid a visually different loading state.

## Regression checks

`tests/browser/hero.playwright.js` is an async function for Playwright MCP's `browser_run_code_unsafe` tool (`filename` argument, relative to the repository root). It exercises the actual deployed site without mocked API, search or video responses.

The checks cover both themes at phone, tablet and desktop sizes, CTA text contrast (at least 4.5:1, including hover), target size, focus, heading semantics, overflow, opaque menus/cart, theme switching, video pause/resume, mobile search focus restoration, and reduced motion. Wait for hydration before clicking server-rendered controls.

Run all web Node tests with the workspace's `tsx` runner, including `app/products/[id]/page.test.ts`. Escape brackets in paths passed to Node's test runner: otherwise it treats `[id]` as a glob and silently leaves that test out. Set `SMOKE_WEB_URL` and `SMOKE_API_URL` to the deployed services for the live image check. Do not replace failed network checks with mocks.

Build before verification. Local `next build` timed out fetching Google Fonts in this environment; the Cloudflare workflow performs the real Next/OpenNext build and type check before deployment. After deployment, inspect actual rendering and playback instead of relying only on a successful workflow status.

## External service finding

The browser reported `ERR_NAME_NOT_RESOLVED` for the configured search hostname, `thrift-search.danielnyo.ng`. Search-result retrieval could not be verified while that endpoint was unavailable. The audit leaves search infrastructure configuration unchanged; it verifies dialog presentation and keyboard behavior against the actual configured service.

## Verified result

- Final build/deployment: [Cloudflare workflow 45020987069](https://github.com/Dan6200/thrift-platform-core/actions/runs/45020987069), Worker version `3d1cde3b-ba05-4f4a-9958-c9c1397e5855`.
- Deployed Playwright audit: passed in light/dark at 390, 768 and 1440px. Additional live checks confirmed the 320px layout, mobile theme buttons, and pausing/resuming playback when the reduced-motion preference changes.
- Full web suite: **6 passed, 0 failed, 0 skipped**, including the bracketed product route and the real API/page/image smoke test. An earlier complete run failed on a live network fetch; the final complete rerun passed without mocks or relaxed assertions.
- API CI for the deployed implementation: [45020987657](https://github.com/Dan6200/thrift-platform-core/actions/runs/45020987657) passed.
- Visual inspection included light/dark hero states, desktop dropdowns, and mobile navigation. Successful search results remain unverified because of the DNS finding above.

## Search endpoint replacement — 24 November 2026

The `thrift` gcloud configuration selects `thrift-ecommerce-project`. Cloud Run service `thrift-classical-search` in `us-central1` is ready, publicly invokable, and responds to `/health` with HTTP 200 and `{"status":"available"}`.

Replaced the web `NEXT_PUBLIC_SEARCH` URL with `https://thrift-classical-search-stajxdef6a-uc.a.run.app` in the GitHub repository variable and local web environment files. The deployment workflow now validates this variable and synchronizes the Worker runtime binding after building/deploying, so browser and runtime configuration use the same endpoint.

A real search request with the existing search key reached this service but returned HTTP 404, code `index_not_found`, message `Index products not found`. This is separate from the old hostname's DNS failure: the service is available, but its product index must be restored/reindexed before successful product search can be verified. The service description reports no configured volumes. The new `tests/browser/search.playwright.js` checks the actual search endpoint and rendered results without mocking these failures.

After rollout, the browser sends requests to the direct Cloud Run URL and receives HTTP 200. A subsequent empty query returned `hits: []` and `estimatedTotalHits: 0`: the index is now present but empty. The strict live-results regression remains failing (`Live search returned no products for dress`); its assertions were not relaxed. The complete web Node suite passed **6/6**, with no skips. Deployment [45490220521](https://github.com/Dan6200/thrift-platform-core/actions/runs/45490220521) completed successfully, including runtime endpoint synchronization. Product indexing is the remaining search-data issue, outside the URL replacement.

## Search layout and startup repair — 26 November 2026

The open results panel was in the navbar's flex layout. At the reported viewport, opening it moved the input from `y=43` to `y=-19`. Desktop results now anchor absolutely below the input; mobile dialog results remain in normal flow. `tests/browser/search-layout.playwright.js` reproduced the failure before the fix and passed against the deployed fix at 1024, 1318 and 1440px.

The search service's `APP_API_URL` still pointed to the retired Vercel API. Cloud Run logs showed a JSON parse error, an empty document upload (`missing_payload`), and an index created only by the later settings task. Updated Cloud Run and the ignored local search environment file to the Cloudflare API.

There was a second startup defect: the public TCP port opened before the catalog fetch/index tasks completed. Request-based CPU allocation then slowed the background initialization, and new instances could answer health checks while returning missing-index errors. Startup now builds the index on a private loopback listener, fails on HTTP/JSON/indexing errors, awaits document/settings tasks, verifies the indexed count, and then restarts the same database on the public port. Every cold start rebuilds from the live API; no one-off manual upload is required. The Meilisearch version is pinned to the deployed version, 1.26.0.

`node --test packages/thrift-classical-search/test/startup.test.mjs` runs the actual Meilisearch container with the live catalog and a deliberately unreachable catalog. Both tests failed on the original startup (first public search 404; failed fetch left the container running), then passed after the fix: **2 passed, 0 failed**. The complete web Node suite also passed **6/6** after the rebuilt web deployment.

### Deployed verification

Cloud Build `e13903cc-82ed-42e4-9a4a-2f9d86931ba7` built image digest `sha256:0b437f95a36f55aa19ee921baa5c40f3893c8751779b68bc09ff3b061ec1bfcd`. Cloud Run revision `thrift-classical-search-00009-v8c` serves 100% of traffic. Its log records `Search index ready: 110 products` before the public listener starts.

The previously failing live browser regression now passes: the `dress` request returns HTTP 200 with **2 hits**, and the results render with images. The reported 1318×728 viewport keeps the input at `y=43` with results open. Mobile search at 390px also returns the dress result and navigates to its product page. The full hero audit passes in both themes at 390/768/1440px. The layout regression passes at 1024/1318/1440px; both container startup tests and all six web Node tests pass without mocks or skipped checks.

## Theme and dropdown alignment refinement

The background-video Play/Pause control now uses the existing background/foreground/accent tokens, matching light and dark mode while retaining a solid surface and visible focus indication. Desktop search results are horizontally centered beneath the full search field rather than aligned to its left edge. Results remain absolutely positioned below the field; the mobile dialog keeps its existing layout.

Regression checks in `tests/browser/video-control.playwright.js` compare the control's actual rendered colors with the active theme. The search-layout regression now also checks matching horizontal centers, in addition to input stability and viewport bounds. Both new assertions failed against the preceding deployment before implementation.

Verification: web deployment [45850108230](https://github.com/Dan6200/thrift-platform-core/actions/runs/45850108230) succeeded. The theme-color and centered-dropdown browser regressions pass, as do the complete hero browser audit and live search-results check. Visual inspection at 1318×728 confirms the light/dark video control and software-results panel positioning. Type checking passes. The full web Node suite reported **5 passed, 1 failed, 0 skipped** on both runs: its live product-image check failed fetching the API; a direct Node probe reported `ETIMEDOUT`. No test, endpoint, timeout, or assertion was loosened to hide that failure.

## Softer translucent surfaces

Following the request to reduce the harshness of solid theme backgrounds, hero controls and the navbar now use 85% background opacity; menus/results/drawers use 90%, with backdrop blur. Primary actions use 90% theme color and increase to 95% on hover. Text, icons, focus indicators and the content itself retain full opacity. The navigation-menu viewport is transparent so it does not cancel out the translucent content surface.

The earlier solid-surface assertion was updated for this explicitly requested design change. `tests/browser/surfaces.playwright.js` now checks background transparency, blur, full component opacity and minimum 4.5:1 foreground contrast composited over both pure black and pure white in both themes. The new test failed on the previous solid styling before implementation. Existing theme, layout, keyboard and playback checks remain in place.

The navbar blur lives on a background pseudo-element: putting backdrop blur on the navigation root prevented an overflowing dropdown from sampling the page behind it. A regression now rejects such clipped ancestor backdrops. Also verify a manually dispatched deployment's `headSha` matches the intended commit: one follow-up run captured an earlier main snapshot, so its success alone did not establish that the correction was live.

Final deployment [45854707997](https://github.com/Dan6200/thrift-platform-core/actions/runs/45854707997) uses commit `d54c0aeb`. All surface-opacity/contrast, theme-color, alignment, full hero and live search browser checks passed. Desktop light/dark visual checks confirm blurred backgrounds rather than sharp headline bleed-through. The final complete web Node run reported **5 passed, 1 failed, 0 skipped** (live API image fetch failed); an earlier complete run in this change passed 6/6. API CI for the deployed source passed. No assertions or network wiring were changed to hide the fetch failure.

## Increased transparency and search skeletons

Interpreted the follow-up request as more visible transparency: neutral controls/navbar changed from 85% to 75% background opacity, and panels/drawers from 90% to 80%. Primary purple actions remain at 90% to preserve contrast over arbitrary video frames. Content stays fully opaque; the existing blur/background-layer separation is retained.

Loading and stalled searches now render `components/search/loading.tsx`: three thumbnail/title/description placeholder rows using the shared Skeleton component. The only loading message is screen-reader-only; the visible text loader and unreachable initial-state text block were removed. The loading region exposes `role="status"` and `aria-busy`, placeholders are hidden from assistive technology, and pulse animation is disabled under reduced motion.

`tests/browser/search-loading.playwright.js` holds a real search request briefly without substituting a response. It checks desktop/mobile and both themes, captures skeleton screenshots, checks reduced motion, releases the request and waits for actual results inside the popup. It failed against the old visible-text loader before implementation. Surface regressions also failed against the earlier higher-opacity backgrounds, while retaining the 4.5:1 contrast requirement.

Verification: deployment [45939362949](https://github.com/Dan6200/thrift-platform-core/actions/runs/45939362949) built commit `0bdefbb1`. Viewed captured loading-state screenshots in light/dark on desktop (1318px) and mobile (390px). The skeleton regression passes all four cases, reduced motion, and replacement with real upstream results. Surface/contrast, video-theme, centered-layout, full hero and live-results browser regressions pass. The full web Node suite passed **6/6**; API CI passed **171 unit and 474 integration tests**. No API response was mocked for the loading-state checks.
