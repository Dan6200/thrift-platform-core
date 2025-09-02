
-- Seed product_variants with a default variant for each product

insert into public.product_variants (product_id, sku, list_price, net_price, quantity_available)
select
  p.product_id,
  'SKU-' || p.product_id,
  p.list_price,
  p.net_price,
  100 -- Default quantity
from
  public.products p;
