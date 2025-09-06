-- Seed product_variants with a default variant for each product
insert into public.product_variants (product_id, sku, list_price, net_price, quantity_available, variation_attributes)
select
  p.product_id,
  'SKU-' || p.product_id,
  p.list_price,
  p.net_price,
  100, -- Default quantity
  '{}'::jsonb
from
  public.products p
where
  p.title not in (
    'Classic Leather Jacket',
    'Wireless Headphones',
    'Women''s Summer Dress',
    'Men''s Casual Shirt',
    'Running Shoes Men''s',
    'Ankle Boots Women''s',
    'Women''s Denim Jeans',
    'Men''s Polo Shirt'
  );

-- Seed variants for Classic Leather Jacket
insert into public.product_variants (product_id, sku, list_price, net_price, quantity_available, variation_attributes)
select
  p.product_id,
  'SKU-' || p.product_id || '-' || size || '-' || color,
  p.list_price,
  p.net_price,
  25, -- Quantity for each variant
  jsonb_build_object('size', size, 'color', color)
from
  public.products p,
  unnest(array['S', 'M', 'L', 'XL']) as size,
  unnest(array['Black', 'Brown']) as color
where
  p.title = 'Classic Leather Jacket';

-- Seed variants for Wireless Headphones
insert into public.product_variants (product_id, sku, list_price, net_price, quantity_available, variation_attributes)
select
  p.product_id,
  'SKU-' || p.product_id || '-' || color,
  p.list_price,
  p.net_price,
  50,
  jsonb_build_object('color', color)
from
  public.products p,
  unnest(array['Black', 'White', 'Blue']) as color
where
  p.title = 'Wireless Headphones';

-- Seed variants for Women's Summer Dress
insert into public.product_variants (product_id, sku, list_price, net_price, quantity_available, variation_attributes)
select
  p.product_id,
  'SKU-' || p.product_id || '-' || size || '-' || color,
  p.list_price,
  p.net_price,
  30,
  jsonb_build_object('size', size, 'color', color)
from
  public.products p,
  unnest(array['S', 'M', 'L', 'XL']) as size,
  unnest(array['Red', 'Blue', 'Green']) as color
where
  p.title = 'Women''s Summer Dress';

-- Seed variants for Men's Casual Shirt
insert into public.product_variants (product_id, sku, list_price, net_price, quantity_available, variation_attributes)
select
  p.product_id,
  'SKU-' || p.product_id || '-' || size || '-' || color,
  p.list_price,
  p.net_price,
  40,
  jsonb_build_object('size', size, 'color', color)
from
  public.products p,
  unnest(array['S', 'M', 'L', 'XL']) as size,
  unnest(array['White', 'Blue', 'Black']) as color
where
  p.title = 'Men''s Casual Shirt';

-- Seed variants for Running Shoes Men's
insert into public.product_variants (product_id, sku, list_price, net_price, quantity_available, variation_attributes)
select
  p.product_id,
  'SKU-' || p.product_id || '-' || size || '-' || color,
  p.list_price,
  p.net_price,
  20,
  jsonb_build_object('size', size, 'color', color)
from
  public.products p,
  unnest(array['8', '9', '10', '11', '12']) as size,
  unnest(array['Black', 'White', 'Red']) as color
where
  p.title = 'Running Shoes Men''s';

-- Seed variants for Ankle Boots Women's
insert into public.product_variants (product_id, sku, list_price, net_price, quantity_available, variation_attributes)
select
  p.product_id,
  'SKU-' || p.product_id || '-' || size || '-' || color,
  p.list_price,
  p.net_price,
  15,
  jsonb_build_object('size', size, 'color', color)
from
  public.products p,
  unnest(array['6', '7', '8', '9']) as size,
  unnest(array['Black', 'Brown']) as color
where
  p.title = 'Ankle Boots Women''s';

-- Seed variants for Women's Denim Jeans
insert into public.product_variants (product_id, sku, list_price, net_price, quantity_available, variation_attributes)
select
  p.product_id,
  'SKU-' || p.product_id || '-' || size || '-' || color,
  p.list_price,
  p.net_price,
  35,
  jsonb_build_object('size', size, 'color', color)
from
  public.products p,
  unnest(array['26', '28', '30', '32']) as size,
  unnest(array['Blue', 'Black']) as color
where
  p.title = 'Women''s Denim Jeans';

-- Seed variants for Men's Polo Shirt
insert into public.product_variants (product_id, sku, list_price, net_price, quantity_available, variation_attributes)
select
  p.product_id,
  'SKU-' || p.product_id || '-' || size || '-' || color,
  p.list_price,
  p.net_price,
  50,
  jsonb_build_object('size', size, 'color', color)
from
  public.products p,
  unnest(array['S', 'M', 'L', 'XL']) as size,
  unnest(array['Red', 'White', 'Navy']) as color
where
  p.title = 'Men''s Polo Shirt';