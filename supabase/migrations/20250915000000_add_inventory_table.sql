-- Create the inventory table
create table if not exists inventory (
  inventory_id         serial           primary   key,
  variant_id           int              not       null    references   product_variants   on   delete   cascade,
  quantity_change      int              not       null, -- e.g., -1 for a sale, +10 for a restock
  reason               varchar          not       null, -- e.g., 'sale', 'restock', 'return', 'damage'
  notes                text,
  created_at           timestamptz      not       null    default      now()
);

-- Remove the quantity_available column from product_variants
alter table product_variants drop column if exists quantity_available;

-- Create a view to calculate the current quantity_available for each variant
create or replace view product_variant_inventory as
select
  variant_id,
  coalesce(sum(quantity_change), 0) as quantity_available
from
  inventory
group by
  variant_id;

-- Add RLS to the new table
alter table inventory enable row level security;

-- Policies for inventory table
create policy "Vendors can manage their own inventory." on inventory
  for all using (
    exists(
      select 1 from product_variants pv
      join products p on p.product_id = pv.product_id
      where pv.variant_id = inventory.variant_id and has_store_access(auth.uid(), p.store_id, ARRAY['admin', 'editor'])
    )
  );
