-- Create the locations table
create table if not exists locations (
  location_id          serial           primary   key,
  store_id             int              not       null    references   stores   on   delete   cascade,
  location_name        varchar          not       null,
  address_id           int              references   address   on   delete   cascade,
  is_primary           boolean          default   false,
  created_at           timestamptz      not       null    default      now(),
  updated_at           timestamptz      not       null    default      now()
);

-- Add location_id to the inventory table
alter table inventory add column location_id int references locations(location_id) on delete cascade;

-- Update the product_variant_inventory view
drop view if exists product_variant_inventory;
create or replace view product_variant_inventory as
select
  variant_id,
  location_id,
  coalesce(sum(quantity_change), 0) as quantity_available
from
  inventory
group by
  variant_id,
  location_id;

-- Create the product_availability table
create table if not exists product_availability (
  availability_id      serial           primary   key,
  product_id           int              not       null    references   products   on   delete   cascade,
  available_from       timestamptz      not       null,
  available_until      timestamptz      not       null,
  notes                text,
  created_at           timestamptz      not       null    default      now()
);

-- Add RLS to the new tables
alter table locations enable row level security;
alter table product_availability enable row level security;

-- Policies for locations table
create policy "Vendors can manage their own locations." on locations
  for all using (
    auth.uid() = (select vendor_id from stores where store_id = locations.store_id)
  );

-- Policies for product_availability table
create policy "Vendors can manage their own product availability." on product_availability
  for all using (
    exists(
      select 1 from products p
      where p.product_id = product_availability.product_id and has_store_access(auth.uid(), p.store_id, ARRAY['admin', 'editor'])
    )
  );
