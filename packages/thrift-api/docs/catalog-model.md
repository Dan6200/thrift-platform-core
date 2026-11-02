# Catalogue data model & pricing

Reference for how products, variants, options, and prices fit together.

---

## 1. Tables & relationships

```text
categories (category_id)
  └─< subcategories (subcategory_id, category_id)
        └─< products (product_id, category_id, subcategory_id, store_id, vendor_id)

products (product_id)
  ├─< product_variants (variant_id, product_id, sku, base_price)
  ├─< product_options (option_id, product_id, option_name)
  │     └─< product_option_values
  │           (option_value_id, option_id, value,
  │            default_price_modifier, default_modifier_type)
  ├─< product_availability (product_id, available_from, available_until, notes)
  ├─< product_store_category_links (product_id, store_category_id)
  └─< featured_products / featured_product_links

product_variants (variant_id)
  ├─< variant_to_option_values
  │     (variant_id, variant_value_id, price_modifier, modifier_type)
  │     PK = (variant_id, variant_value_id)
  │     variant_value_id → product_option_values.option_value_id
  ├─< variant_price_overrides
  │     (override_id, variant_id, absolute_price, start_date, end_date)
  ├─< inventory (inventory_id, variant_id, location_id, quantity_change, reason, notes)
  │     → product_variant_inventory view (sum by variant_id, location_id)
  └─< product_media_links (variant_id, media_id, is_display_image, is_thumbnail_image)
        >── media (media_id, filename, filepath, filetype, uploader_id)
```

Key cardinalities:

- `products` 1 ── n `product_variants`
- `products` 1 ── n `product_options` 1 ── n `product_option_values`
- `product_variants` n ── n `product_option_values` (via `variant_to_option_values`)
- `product_variants` 1 ── n `variant_price_overrides`
- `product_variants` 1 ── n `inventory` (append-only ledger of stock changes)

---

## 2. Variants ↔ options (the part that usually confuses)

`product_options` belong to a **product** (e.g. `COLOR`, `BAND`). Each option has
values (`COLOR → BLACK/WHITE`, `BAND → S/L`). A **variant** is a concrete
selection of **one value per option**, recorded as one row per value in
`variant_to_option_values`:

```text
product P (Fitbit)
  options:  COLOR → {BLACK, LUNAR WHITE}
            BAND  → {S/L}

variant FIT-CHG5-BLK
  vtov: (FIT-CHG5-BLK, COLOR=BLACK)
        (FIT-CHG5-BLK, BAND=S/L)      ← two rows, two different options
```

### Why the PK is `(variant_id, variant_value_id)`

- It is the natural key of the link row: one row per (variant, option value).
- It prevents linking the **same** value twice to a variant.
- `variant_id` alone would collapse a variant to a **single** option value and
  break every multi-option product.

### Known gap (not yet enforced)

The composite PK does **not** prevent a variant from holding two values for the
**same option** (`COLOR=BLACK` _and_ `COLOR=WHITE`). The missing invariant is
**one value per option per variant**. The fix is `UNIQUE (variant_id, option_id)`,
which requires `option_id` on `variant_to_option_values` (or a trigger, since
`option_id` is derivable from `product_option_values`).

---

## 3. Pricing model

Price is derived, never stored on the variant row (only `base_price` is). Three
layers, resolved by specificity:

```text
variant_price_overrides.absolute_price        (most specific — REPLACES the result)
        >
variant_to_option_values.price_modifier       (per-option-value override)
        >
product_option_values.default_price_modifier  (option-value default)
        >
product_variants.base_price                   (foundation)
```

For each option value the variant is linked to, pick the most specific modifier:

```sql
vtov.price_modifier  ??  pov.default_price_modifier  ?? 0
vtov.modifier_type   ??  pov.default_modifier_type   ?? 'absolute'
```

Then combine across the variant's option values:

```text
absolute_modifier      = Σ price_modifier            where modifier_type = 'absolute'
percentage_multiplier  = Π (1 + price_modifier/10000) where modifier_type = 'percentage'

effective_price = greatest(0, round(
    (base_price + absolute_modifier) * percentage_multiplier
))
```

- **Basis points**: `1000 → 1.10`, `10000 → 2.00`, `-2500 → 0.75`.
- Absolute modifiers are **additive**; percentage modifiers are **multiplicative**
  and applied after the additive total.
- An active override (`start_date <= now() < end_date`, latest `start_date`)
  replaces the whole computed price.

> `NULL` on `variant_to_option_values.price_modifier` / `modifier_type` means
> "inherit the option default". That is why those columns are nullable with **no
> default** — a `NOT NULL DEFAULT 0` would make every linked row look like an
> explicit zero and defeat the `COALESCE` fallback.
