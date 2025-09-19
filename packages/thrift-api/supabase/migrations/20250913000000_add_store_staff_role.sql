-- Create the store_staff table
create table if not exists store_staff (
  store_id int not null references stores(store_id) on delete cascade,
  staff_id uuid not null references profiles(id) on delete cascade,
  role varchar not null default 'viewer', -- e.g., 'admin', 'editor', 'viewer'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (store_id, staff_id)
);

-- Add RLS to the new table
alter table store_staff enable row level security;

-- Policies for store_staff table
-- Owners can insert staff
create policy "Store owners can insert staff." on store_staff
  for insert with check (
    auth.uid() = (select vendor_id from stores where store_id = store_staff.store_id)
  );

-- Owners can update staff
create policy "Store owners can update staff." on store_staff
  for update using (
    auth.uid() = (select vendor_id from stores where store_id = store_staff.store_id)
  );

-- Owners can delete staff
create policy "Store owners can delete staff." on store_staff
  for delete using (
    auth.uid() = (select vendor_id from stores where store_id = store_staff.store_id)
  );

-- Owners and staff can view staff
create policy "Allow owners and staff to view store staff" on store_staff
  for select using (
    auth.uid() = (select vendor_id from stores where store_id = store_staff.store_id) OR
    EXISTS (SELECT 1 FROM store_staff ss WHERE ss.store_id = store_staff.store_id AND ss.staff_id = auth.uid())
  );

-- create a trigger to update the updated_at column for store_staff
create trigger set_timestamp
before update on store_staff
for each row
execute procedure trigger_set_timestamp();

-- Function to check if a user has access to a store with specified roles
create or replace function has_store_access(p_user_id uuid, p_store_id int, p_roles text[])
returns boolean as $$
begin
  return exists (
    -- Check if user is the vendor of the store
    select 1 from stores
    where store_id = p_store_id and vendor_id = p_user_id
  ) or exists (
    -- Check if user is a staff member with one of the specified roles
    select 1 from store_staff
    where store_id = p_store_id
      and staff_id = p_user_id
      and role = any(p_roles)
  );
end;
$$ language plpgsql security definer;

-- Drop old policies from initial_schema.sql and add_store_staff_role.sql

-- Policies for stores
drop policy if exists "Vendors can view their own stores." on stores;
drop policy if exists "Vendors can insert their own stores." on stores;
drop policy if exists "Vendors can update their own stores." on stores;
drop policy if exists "Vendors can delete their own stores." on stores;
drop policy if exists "Vendors and staff can view their stores." on stores;
drop policy if exists "Vendors and staff can update their stores." on stores;
drop policy if exists "Vendors and admins can delete their stores." on stores;

-- Policies for store_categories
drop policy if exists "Vendors can view their own store_categories." on store_categories;
drop policy if exists "Vendors can insert their own store_categories." on store_categories;
drop policy if exists "Vendors can update their own store_categories." on store_categories;
drop policy if exists "Vendors can delete their own store_categories." on store_categories;
drop policy if exists "Vendors and admins can delete their store_categories." on store_categories;

-- Policies for products
drop policy if exists "Vendors can view their own products." on products;
drop policy if exists "Vendors can insert their own products." on products;
drop policy if exists "Vendors can update their own products." on products;
drop policy if exists "Vendors can delete their own products." on products;
drop policy if exists "Vendors and staff can insert their products." on products;

-- Policies for product_options
drop policy if exists "Vendors can view their own product_options." on product_options;
drop policy if exists "Vendors can insert their own product_options." on product_options;
drop policy if exists "Vendors can update their own product_options." on product_options;
drop policy if exists "Vendors can delete their own product_options." on product_options;
drop policy if exists "Vendors and admins can delete their product_options." on product_options;

-- Policies for product_option_values
drop policy if exists "Vendors can view their own product_option_values." on product_option_values;
drop policy if exists "Vendors can insert their own product_option_values." on product_option_values;
drop policy if exists "Vendors can update their own product_option_values." on product_option_values;
drop policy if exists "Vendors can delete their own product_option_values." on product_option_values;
drop policy if exists "Vendors and staff can update their product_option_values." on product_option_values;

-- Policies for product_variants
drop policy if exists "Vendors can view their own product_variants." on product_variants;
drop policy if exists "Vendors can insert their own product_variants." on product_variants;
drop policy if exists "Vendors can update their own product_variants." on product_variants;
drop policy if exists "Vendors can delete their own product_variants." on product_variants;
drop policy if exists "Vendors and admins can delete their product_variants." on product_variants;

-- Policies for variant_to_option_values
drop policy if exists "Vendors can view their own variant_to_option_values." on variant_to_option_values;
drop policy if exists "Vendors can insert their own variant_to_option_values." on variant_to_option_values;
drop policy if exists "Vendors can update their own variant_to_option_values." on variant_to_option_values;
drop policy if exists "Vendors can delete their own variant_to_option_values." on variant_to_option_values;
drop policy if exists "Vendors and admins can delete their variant_to_option_values." on variant_to_option_values;

-- Policies for product_store_category_links
drop policy if exists "Vendors can view their own product_store_category_links." on product_store_category_links;
drop policy if exists "Vendors can insert their own product_store_category_links." on product_store_category_links;
drop policy if exists "Vendors can update their own product_store_category_links." on product_store_category_links;
drop policy if exists "Vendors can delete their own product_store_category_links." on product_store_category_links;
drop policy if exists "Vendors and staff can insert their product_store_category_links." on product_store_category_links;

-- Policies for featured_products
drop policy if exists "Vendors can view their own featured_products." on featured_products;
drop policy if exists "Vendors can insert their own featured_products." on featured_products;
drop policy if exists "Vendors can update their own featured_products." on featured_products;
drop policy if exists "Vendors can delete their own featured_products." on featured_products;
drop policy if exists "Vendors and admins can delete their featured_products." on featured_products;

-- -- Policies for product_media
-- drop policy if exists "Vendors can view their own product_media." on product_media;
-- drop policy if exists "Vendors can insert their own product_media." on product_media;
-- drop policy if exists "Vendors can update their own product_media." on product_media;
-- drop policy if exists "Vendors can delete their own product_media." on product_media;
-- drop policy if exists "Vendors and admins can delete their product_media." on product_media;

-- Policies for orders
drop policy if exists "Users can view their own orders." on orders;
drop policy if exists "Users can insert their own orders." on orders;
drop policy if exists "Users can update their own orders." on orders;
drop policy if exists "Users can delete their own orders." on orders;

-- Policies for order_items
drop policy if exists "Users can view their own order_items." on order_items;
drop policy if exists "Users can insert their own order_items." on order_items;
drop policy if exists "Users can update their own order_items." on order_items;
drop policy if exists "Users can delete their own order_items." on order_items;

-- Policies for customer_reviews
drop policy if exists "Vendors can view their own customer_reviews." on customer_reviews;
drop policy if exists "Vendors can insert their own customer_reviews." on customer_reviews;
drop policy if exists "Vendors can update their own customer_reviews." on customer_reviews;
drop policy if exists "Vendors can delete their own customer_reviews." on customer_reviews;
drop policy if exists "Vendors and staff can view their customer_reviews." on customer_reviews;


-- New Comprehensive RLS Policies

-- stores
create policy "Allow vendors and staff to view stores" on stores
  for select using (has_store_access(auth.uid(), store_id, ARRAY['admin', 'editor', 'viewer']));
create policy "Allow owner to insert stores" on stores
  for insert with check (auth.uid() = vendor_id); -- Only vendor can create a store
create policy "Allow vendors, admins and editors to update stores" on stores
  for update using (has_store_access(auth.uid(), store_id, ARRAY['admin', 'editor']));
create policy "Allow vendors and admins to delete stores" on stores
  for delete using (has_store_access(auth.uid(), store_id, ARRAY['admin']));

-- pages
alter table pages enable row level security;
create policy "Allow vendors and staff to view pages" on pages
  for select using (has_store_access(auth.uid(), store_id, ARRAY['admin', 'editor', 'viewer']));
create policy "Allow vendors, admins and editors to insert pages" on pages
  for insert with check (has_store_access(auth.uid(), store_id, ARRAY['admin', 'editor']));
create policy "Allow vendors, admins and editors to update pages" on pages
  for update using (has_store_access(auth.uid(), store_id, ARRAY['admin', 'editor']));
create policy "Allow vendors and admins to delete pages" on pages
  for delete using (has_store_access(auth.uid(), store_id, ARRAY['admin']));

-- page_sections
alter table page_sections enable row level security;
create policy "Allow vendors and staff to view page_sections" on page_sections
  for select using (exists(select 1 from pages where pages.page_id = page_sections.page_id and has_store_access(auth.uid(), pages.store_id, ARRAY['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert page_sections" on page_sections
  for insert with check (exists(select 1 from pages where pages.page_id = page_sections.page_id and has_store_access(auth.uid(), pages.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update page_sections" on page_sections
  for update using (exists(select 1 from pages where pages.page_id = page_sections.page_id and has_store_access(auth.uid(), pages.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors and admins to delete page_sections" on page_sections
  for delete using (exists(select 1 from pages where pages.page_id = page_sections.page_id and has_store_access(auth.uid(), pages.store_id, ARRAY['admin'])));

-- store_categories
create policy "Allow vendors and staff to view store_categories" on store_categories
  for select using (has_store_access(auth.uid(), store_id, ARRAY['admin', 'editor', 'viewer']));
create policy "Allow vendors, admins and editors to insert store_categories" on store_categories
  for insert with check (has_store_access(auth.uid(), store_id, ARRAY['admin', 'editor']));
create policy "Allow vendors, admins and editors to update store_categories" on store_categories
  for update using (has_store_access(auth.uid(), store_id, ARRAY['admin', 'editor']));
create policy "Allow vendors and admins to delete store_categories" on store_categories
  for delete using (has_store_access(auth.uid(), store_id, ARRAY['admin']));

-- products
create policy "Allow vendors and staff to view products" on products
  for select using (has_store_access(auth.uid(), store_id, ARRAY['admin', 'editor', 'viewer']));
create policy "Allow vendors, admins and editors to insert products" on products
  for insert with check (has_store_access(auth.uid(), store_id, ARRAY['admin', 'editor']));
create policy "Allow vendors, admins and editors to update products" on products
  for update using (has_store_access(auth.uid(), store_id, ARRAY['admin', 'editor']));
create policy "Allow vendors and admins to delete products" on products
  for delete using (has_store_access(auth.uid(), store_id, ARRAY['admin']));

-- product_options
create policy "Allow vendors and staff to view product_options" on product_options
  for select using (exists(select 1 from products where products.product_id = product_options.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert product_options" on product_options
  for insert with check (exists(select 1 from products where products.product_id = product_options.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update product_options" on product_options
  for update using (exists(select 1 from products where products.product_id = product_options.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors and admins to delete product_options" on product_options
  for delete using (exists(select 1 from products where products.product_id = product_options.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin'])));

-- product_option_values
create policy "Allow vendors and staff to view product_option_values" on product_option_values
  for select using (exists(select 1 from product_options po join products p on p.product_id = po.product_id where po.option_id = product_option_values.option_id and has_store_access(auth.uid(), p.store_id, ARRAY['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert product_option_values" on product_option_values
  for insert with check (exists(select 1 from product_options po join products p on p.product_id = po.product_id where po.option_id = product_option_values.option_id and has_store_access(auth.uid(), p.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update product_option_values" on product_option_values
  for update using (exists(select 1 from product_options po join products p on p.product_id = po.product_id where po.option_id = product_option_values.option_id and has_store_access(auth.uid(), p.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors and admins to delete product_option_values" on product_option_values
  for delete using (exists(select 1 from product_options po join products p on p.product_id = po.product_id where po.option_id = product_option_values.option_id and has_store_access(auth.uid(), p.store_id, ARRAY['admin'])));

-- product_variants
create policy "Allow vendors and staff to view product_variants" on product_variants
  for select using (exists(select 1 from products where products.product_id = product_variants.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert product_variants" on product_variants
  for insert with check (exists(select 1 from products where products.product_id = product_variants.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update product_variants" on product_variants
  for update using (exists(select 1 from products where products.product_id = product_variants.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors and admins to delete product_variants" on product_variants
  for delete using (exists(select 1 from products where products.product_id = product_variants.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin'])));

-- variant_to_option_values
create policy "Allow vendors and staff to view variant_to_option_values" on variant_to_option_values
  for select using (exists(select 1 from product_variants pv join products p on p.product_id = pv.product_id where pv.variant_id = variant_to_option_values.variant_id and has_store_access(auth.uid(), p.store_id, ARRAY['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert variant_to_option_values" on variant_to_option_values
  for insert with check (exists(select 1 from product_variants pv join products p on p.product_id = pv.product_id where pv.variant_id = variant_to_option_values.variant_id and has_store_access(auth.uid(), p.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update variant_to_option_values" on variant_to_option_values
  for update using (exists(select 1 from product_variants pv join products p on p.product_id = pv.product_id where pv.variant_id = variant_to_option_values.variant_id and has_store_access(auth.uid(), p.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors and admins to delete variant_to_option_values" on variant_to_option_values
  for delete using (exists(select 1 from product_variants pv join products p on p.product_id = pv.product_id where pv.variant_id = variant_to_option_values.variant_id and has_store_access(auth.uid(), p.store_id, ARRAY['admin'])));

-- product_store_category_links
create policy "Allow vendors and staff to view product_store_category_links" on product_store_category_links
  for select using (exists(select 1 from products p where p.product_id = product_store_category_links.product_id and has_store_access(auth.uid(), p.store_id, ARRAY['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert product_store_category_links" on product_store_category_links
  for insert with check (exists(select 1 from products p where p.product_id = product_store_category_links.product_id and has_store_access(auth.uid(), p.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update product_store_category_links" on product_store_category_links
  for update using (exists(select 1 from products p where p.product_id = product_store_category_links.product_id and has_store_access(auth.uid(), p.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors and admins to delete product_store_category_links" on product_store_category_links
  for delete using (exists(select 1 from products p where p.product_id = product_store_category_links.product_id and has_store_access(auth.uid(), p.store_id, ARRAY['admin'])));

-- featured_products
create policy "Allow vendors and staff to view featured_products" on featured_products
  for select using (exists(select 1 from products where products.product_id = featured_products.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert featured_products" on featured_products
  for insert with check (exists(select 1 from products where products.product_id = featured_products.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update featured_products" on featured_products
  for update using (exists(select 1 from products where products.product_id = featured_products.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors and admins to delete featured_products" on featured_products
  for delete using (exists(select 1 from products where products.product_id = featured_products.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin'])));

-- featured_product_links
alter table featured_product_links enable row level security;
create policy "Allow vendors and staff to view featured_product_links" on featured_product_links
  for select using (exists(select 1 from products where products.product_id = featured_product_links.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert featured_product_links" on featured_product_links
  for insert with check (exists(select 1 from products where products.product_id = featured_product_links.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update featured_product_links" on featured_product_links
  for update using (exists(select 1 from products where products.product_id = featured_product_links.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors and admins to delete featured_product_links" on featured_product_links
  for delete using (exists(select 1 from products where products.product_id = featured_product_links.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin'])));

-- -- product_media
-- create policy "Allow vendors and staff to view product_media" on product_media
--   for select using (exists(select 1 from products where products.product_id = product_media.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor', 'viewer'])));
-- create policy "Allow vendors, admins and editors to insert product_media" on product_media
--   for insert with check (exists(select 1 from products where products.product_id = product_media.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor'])));
-- create policy "Allow vendors, admins and editors to update product_media" on product_media
--   for update using (exists(select 1 from products where products.product_id = product_media.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin', 'editor'])));
-- create policy "Allow vendors and admins to delete product_media" on product_media
--   for delete using (exists(select 1 from products where products.product_id = product_media.product_id and has_store_access(auth.uid(), products.store_id, ARRAY['admin'])));

-- orders
create policy "Customers can manage their own orders" on orders
  for all using (auth.uid() = customer_id)
  with check (auth.uid() = customer_id);
create policy "Allow vendors and staff to view orders" on orders
  for select using (has_store_access(auth.uid(), store_id, ARRAY['admin', 'editor', 'viewer']));
create policy "Allow vendors, admins and editors to update orders" on orders
  for update using (has_store_access(auth.uid(), store_id, ARRAY['admin', 'editor']));

-- order_items
create policy "Customers can manage their own order_items" on order_items
  for all using (exists(select 1 from orders where orders.order_id = order_items.order_id and orders.customer_id = auth.uid()))
  with check (exists(select 1 from orders where orders.order_id = order_items.order_id and orders.customer_id = auth.uid()));
create policy "Allow vendors and staff to view order_items" on order_items
  for select using (exists(select 1 from orders where orders.order_id = order_items.order_id and has_store_access(auth.uid(), orders.store_id, ARRAY['admin', 'editor', 'viewer'])));

-- customer_reviews
create policy "Allow vendors and staff to view customer_reviews" on customer_reviews
  for select using (exists(select 1 from orders where orders.order_id = customer_reviews.order_id and has_store_access(auth.uid(), orders.store_id, ARRAY['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert customer_reviews" on customer_reviews
  for insert with check (exists(select 1 from orders where orders.order_id = customer_reviews.order_id and has_store_access(auth.uid(), orders.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update customer_reviews" on customer_reviews
  for update using (exists(select 1 from orders where orders.order_id = customer_reviews.order_id and has_store_access(auth.uid(), orders.store_id, ARRAY['admin', 'editor'])));
create policy "Allow vendors and admins to delete customer_reviews" on customer_reviews
  for delete using (exists(select 1 from orders where orders.order_id = customer_reviews.order_id and has_store_access(auth.uid(), orders.store_id, ARRAY['admin'])));
