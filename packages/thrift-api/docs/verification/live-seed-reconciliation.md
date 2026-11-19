# Live seed-data reconciliation — 2026-11-19

Authorized in the conversation after confirming production used `SKU-...`
while the current seed generates `THR-...`. This was a targeted data correction,
not a schema migration or a full seed reset.

## Scope and safeguards

- Matched all 110 products against current seed titles **and vendor IDs**.
- Targeted only variant SKUs matching `SKU-<that product's ID>` with an optional
  suffix: 273 variants. Replaced the `SKU-` prefix with `THR-`, preserving the
  suffix and row IDs. This does not recreate the seed's variant combinations.
- Preserved the other 11 variant SKUs and their base prices.
- Recomputed target base prices using the current seed's category anchors,
  per-product spread and kobo conversion. Applied the seed's 85% clearance rule
  once to the highest targeted variant ID.
- Updated 160 associated option-value defaults and 363 target variant-option
  links from the seed's modifier CASE expression, with naira converted to kobo.
- Updated three existing exact 25%-off seed-style price overrides to follow the
  corrected base. Created no new sale periods.
- Did not reseed profiles/auth, upload media, recreate products, change IDs, or
  modify historical orders or their purchase snapshots.

The transaction used serializable isolation, row locks, lock/statement timeouts,
a SKU collision check, and an exact expected target count. A complete rehearsal
executed the mutations and verification, then rolled back. Its pre-change row
snapshot was saved locally with mode 0600. Application was guarded by a checksum
of the target variant rows to reject changes since rehearsal. The applied
transaction's pre-change snapshots were saved separately as well.

Backups are on the operator machine under
`~/.local/state/thrift/backups/seed-reconcile-{rehearsal,applied}-*.json`.
They include target variants, associated option values/links, and price overrides.
They are deliberately not committed to Git. For rollback, review these snapshots
and restore affected columns by primary key in a transaction; do not reset the
database or replay the seed. Check for newer edits before restoring anything.

## Execution and verification

Local database TCP connections and the Supabase connector became unavailable.
Execution used a temporary authenticated Worker against the already verified
production Hyperdrive binding. Its random admin credential was stored as a
Worker secret; requests required that bearer credential. The Worker and local
credential file were removed after verification.

An initial apply request received an HTML error response. Before retrying, a
separate database check confirmed all 273 original `SKU-...` rows remained and
product 82 was unchanged. The second request committed successfully. Post-commit
checks used both a new read-only database transaction and the public API:

- 273 `THR-...` variants, zero `SKU-...` variants, 11 other SKUs.
- Target base prices ranged from 840,000 to 20,550,000 kobo.
- `/v1/products/82`: HTTP 200, SKU `THR-82`, base price 3,500,000 kobo (₦35,000).

Product detail requests fetch current data without a response cache. Product
listings still use the existing one-hour Next.js data cache and may show older
prices until revalidation. Hyperdrive query caching remains disabled.

The seed-file correction was separately covered by two real PostgreSQL
expression checks and the full **474-test** API CI run. The production operation
was verified by its transaction checks and actual persisted/API values; that
CI run did not itself mutate or validate the live database.
