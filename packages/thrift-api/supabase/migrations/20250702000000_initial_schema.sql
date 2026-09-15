-- Consolidated Database Schema for Thrift API
-- Consolidates all DDL migrations into a single cohesive schema definition (excluding seed data).

-- Ensure public schema exists
create schema if not exists public;

-- Enable necessary extensions
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

/**************************************************************************************************************************************************************************
////////////////////////////////////////////////////////////////////--CUSTOM TYPES / ENUMS--///////////////////////////////////////////////////////////////////////////////
**************************************************************************************************************************************************************************/

create type featured_product_type_enum as enum ('carousel', 'grid');
create type gateway_provider_enum as enum ('stripe', 'paystack', 'flutterwave');
create type ledger_event as enum ('order_settlement', 'partial_refund', 'refund', 'vendor_payout', 'platform_fee_adjustment');
create type financial_account_type as enum ('asset', 'liability', 'revenue', 'expense');
create type modifier_type as enum ('absolute', 'percentage');

/**************************************************************************************************************************************************************************
////////////////////////////////////////////////////////////////////--FUNCTIONS--//////////////////////////////////////////////////////////////////////////////////////////
**************************************************************************************************************************************************************************/

-- Function to update updated_at column
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Function to handle new user creation in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Check if the profile already exists
  if exists (select 1 from public.profiles where id = new.id) then
    update public.profiles
    set
      first_name = coalesce(new.raw_user_meta_data->>'first_name', first_name),
      last_name = coalesce(new.raw_user_meta_data->>'last_name', last_name),
      email = coalesce(new.email, email),
      phone = coalesce(new.phone, phone),
      dob = coalesce((new.raw_user_meta_data->>'dob')::date, dob),
      country = coalesce(new.raw_user_meta_data->>'country', country),
      is_customer = coalesce((new.raw_user_meta_data->>'is_customer')::boolean, is_customer),
      is_vendor = coalesce((new.raw_user_meta_data->>'is_vendor')::boolean, is_vendor),
      updated_at = now()
    where id = new.id;
  else
    insert into public.profiles (id, first_name, last_name, email, phone, dob, country, is_customer, is_vendor)
    values (
      new.id,
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name',
      new.email,
      new.phone,
      (new.raw_user_meta_data->>'dob')::date,
      coalesce(new.raw_user_meta_data->>'country', 'Nigeria'),
      coalesce((new.raw_user_meta_data->>'is_customer')::boolean, true),
      coalesce((new.raw_user_meta_data->>'is_vendor')::boolean, false)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Function to handle user updates from auth.users
create or replace function public.handle_update_user()
returns trigger as $$
begin
  update public.profiles
  set
    first_name = new.raw_user_meta_data->>'first_name',
    last_name = new.raw_user_meta_data->>'last_name',
    email = new.email,
    phone = new.phone,
    dob = (new.raw_user_meta_data->>'dob')::date,
    country = coalesce(new.raw_user_meta_data->>'country', 'Nigeria'),
    is_customer = coalesce((new.raw_user_meta_data->>'is_customer')::boolean, true),
    is_vendor = coalesce((new.raw_user_meta_data->>'is_vendor')::boolean, false)
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

-- Function to handle user deletion from auth.users
create or replace function public.handle_delete_user()
returns trigger as $$
begin
  update public.profiles
  set deleted_at = now() -- Soft Delete. Set cronjob to delete after 30 days
  where id = old.id;
  return old;
end;
$$ language plpgsql security definer;

-- Function to check if a user has access to a store with specified roles
create or replace function has_store_access(p_user_id uuid, p_store_id int, p_roles text[])
returns boolean as $$
begin
  return exists (
    select 1 from stores
    where store_id = p_store_id and vendor_id = p_user_id
  ) or exists (
    select 1 from store_staff
    where store_id = p_store_id
      and staff_id = p_user_id
      and role = any(p_roles)
  );
end;
$$ language plpgsql security definer;

-- Function to validate filetype of display / thumbnail product media links
create or replace function check_product_media_links_filetype()
returns trigger as $$
declare
    v_filetype text;
begin
    select filetype into v_filetype from public.media where media_id = new.media_id;
    if (new.is_display_image = true or new.is_thumbnail_image = true) and v_filetype not in ('image/jpeg', 'image/png', 'image/jpg', 'image/webp') then
        raise exception 'Display and thumbnail images must be of type image/jpeg, image/png, image/jpg, or image/webp. Attempted to use filetype: %', v_filetype;
    end if;
    return new;
end;
$$ language plpgsql;

-- Function to ensure only a single display / thumbnail image per product variant
create or replace function enforce_single_special_image()
returns trigger as $$
begin
    if new.is_display_image = true then
        update public.product_media_links
        set is_display_image = false
        where variant_id = new.variant_id
          and media_id != new.media_id
          and is_display_image = true;
    end if;

    if new.is_thumbnail_image = true then
        update public.product_media_links
        set is_thumbnail_image = false
        where variant_id = new.variant_id
          and media_id != new.media_id
          and is_thumbnail_image = true;
    end if;

    return new;
end;
$$ language plpgsql;

-- Ensure Immutability of ledger lines
create or replace function prevent_accounting_ledger_modification()
returns trigger as $$
begin
    raise exception 'Ledger lines are immutable and cannot be updated or deleted.';
end;
$$ language plpgsql;

-- Deferred Double-Entry Zero Sum invariant. Ensures ledger balance always sums up to 0.
create or replace function verify_ledger_entry_balance()
returns trigger as $$
declare
    v_total_balance bigint;
begin
    select coalesce(sum(amount), 0) into v_total_balance
    from ledger_lines
    where entry_id = new.entry_id;

    if v_total_balance <> 0 then
        raise exception 'Unbalanced ledger entry %: net sum is % (must be 0)', new.entry_id, v_total_balance;
    end if;

    return new;
end;
$$ language plpgsql;

/**************************************************************************************************************************************************************************
////////////////////////////////////////////////////////////////////--PLATFORM-WIDE TABLES--///////////////////////////////////////////////////////////////////////////////
**************************************************************************************************************************************************************************/

create table if not exists profiles (
  id           uuid primary key,
  first_name   varchar(30) not null check (first_name ~* '^[a-zA-Z]+$'),
  last_name    varchar(30) not null check (last_name ~* '^[a-zA-Z]+([-'']*[a-zA-Z]+)+$'),
  email        varchar(320) unique check (email ~* '^(([^<> ()[\]\\.,;:\s@"]+(\.[^< > ()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$'),
  phone        varchar(20) unique check (phone ~* '^\+?[1-9]\d{1,14}$'),
  dob          date not null,
  country      varchar(30) not null default 'Nigeria',
  is_customer  boolean not null default true,
  is_vendor    boolean not null default false,
  deleted_at   timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists address (
  address_id       serial primary key,
  address_line_1   varchar(100) not null,
  address_line_2   varchar(100),
  city             varchar(50) not null,
  state            varchar(50) not null,
  zip_postal_code  varchar(20) not null,
  country          varchar(50) not null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists categories (
  category_id    serial primary key,
  category_name  varchar(50) unique not null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists subcategories (
  subcategory_id    serial primary key,
  category_id       int not null references categories(category_id) on delete cascade,
  subcategory_name  varchar(50),
  unique (category_id, subcategory_name),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table if not exists payment_info (
  payment_id          serial primary key,
  customer_id         uuid not null references profiles(id) on delete cascade,
  payment_type        varchar(20) not null,
  authorization_code  varchar unique not null,
  provider            varchar(50) not null,
  email               varchar(320),
  last4               varchar(4),
  brand               varchar(20),
  exp_month           varchar(2),
  exp_year            varchar(4),
  unique (customer_id, authorization_code),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table if not exists delivery_info (
  delivery_info_id       serial primary key,
  customer_id            uuid not null references profiles(id) on delete cascade,
  recipient_full_name    varchar(30) not null,
  address_id             int not null references address(address_id) on delete cascade,
  phone_number           varchar not null,
  delivery_instructions  varchar,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create table if not exists featured_product_collections (
  collection_id  serial primary key,
  name           varchar(255) unique not null,
  description    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists app_config (
  config_key    varchar primary key,
  config_value  varchar not null,
  description   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists media (
  media_id       serial primary key,
  filename       varchar not null unique,
  filepath       varchar not null,
  filetype       varchar(50) not null,
  description    text,
  uploader_id    uuid not null references profiles(id) on delete cascade,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint     valid_filetype check (filetype in ('image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/webp', 'image/webp', 'video/mkv'))
);

create table if not exists profile_media (
  profile_id  uuid primary key references profiles(id) on delete cascade,
  media_id    int not null unique references media(media_id) on delete cascade
);

/**************************************************************************************************************************************************************************
////////////////////////////////////////////////////////////////////--STORE-WIDE TABLES--/////////////////////////////////////////////////////////////////////////////////
**************************************************************************************************************************************************************************/

create table if not exists stores (
  store_id       serial primary key,
  store_name     varchar(50) not null,
  custom_domain  varchar(100) unique,
  vendor_id      uuid not null references profiles(id) on delete cascade,
  favicon        varchar(255),
  global_styles  jsonb,
  address_id     int references address(address_id) on delete cascade,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz default now()
);

create table if not exists store_staff (
  store_id    int not null references stores(store_id) on delete cascade,
  staff_id    uuid not null references profiles(id) on delete cascade,
  role        varchar not null default 'viewer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  primary key (store_id, staff_id)
);

create table if not exists locations (
  location_id    serial primary key,
  store_id       int not null references stores(store_id) on delete cascade,
  location_name  varchar not null,
  address_id     int references address(address_id) on delete cascade,
  is_primary     boolean default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists pages (
  page_id     serial primary key,
  store_id    int not null references stores(store_id) on delete cascade,
  page_slug   varchar not null,
  page_title  varchar not null,
  page_type   varchar not null,
  seo_data    jsonb not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (store_id, page_slug)
);

create table if not exists page_sections (
  section_id     serial primary key,
  page_id        int not null references pages(page_id) on delete cascade,
  section_title  varchar,
  section_type   varchar not null,
  section_data   jsonb,
  sort_order     int not null,
  styles         jsonb,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists store_categories (
  store_category_id  serial primary key,
  store_id           int not null references stores(store_id) on delete cascade,
  name               varchar(50) not null,
  description        text,
  unique (store_id, name),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists products (
  product_id      serial primary key,
  title           varchar(255) not null,
  description     text[] not null,
  vendor_id       uuid not null references profiles(id) on delete cascade,
  store_id        int not null references stores(store_id) on delete cascade,
  category_id     int not null references categories(category_id) on delete cascade,
  subcategory_id  int not null references subcategories(subcategory_id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists product_variants (
  variant_id     serial primary key,
  product_id     int not null references products(product_id) on delete cascade,
  sku            varchar(100) unique not null,
  base_price     bigint not null check (base_price >= 0),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists product_options (
  option_id    serial primary key,
  product_id   int not null references products(product_id) on delete cascade,
  option_name  varchar(50) not null,
  unique       (product_id, option_name),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists product_option_values (
  option_value_id           serial primary key,
  option_id                 int not null references product_options(option_id) on delete cascade,
  value                     varchar(50) not null,
  default_price_modifier    bigint not null default 0,
  default_modifier_type     modifier_type not null default 'absolute',
  unique                    (option_id, value),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create table if not exists variant_to_option_values (
  variant_id           int not null references product_variants(variant_id) on delete cascade,
  variant_value_id     int not null references product_option_values(option_value_id) on delete cascade,
  price_modifier       bigint not null default 0,
  modifier_type        modifier_type not null default 'absolute',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  primary key          (variant_id, value_id)
);

-- Promotional overrides table
create table if not exists variant_price_overrides (
  override_id     bigserial primary key,
  variant_id      int not null references product_variants(variant_id) on delete cascade,
  absolute_price  bigint not null check (absolute_price >= 0),
  start_date      timestamptz not null default now(),
  end_date        timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint      chk_override_dates check (end_date is null or end_date > start_date)
);

create table if not exists product_store_category_links (
  product_id         int not null references products(product_id) on delete cascade,
  store_category_id  int not null references store_categories(store_category_id) on delete cascade,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  primary key        (product_id, store_category_id)
);

create table if not exists featured_products (
  featured_product_id  serial primary key,
  product_id           int not null references products(product_id) on delete cascade,
  feature_type         featured_product_type_enum not null,
  start_date           timestamptz default now(),
  end_date             timestamptz,
  sort_order           int,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (product_id, feature_type)
);

create table if not exists featured_product_links (
  collection_id  int not null references featured_product_collections(collection_id) on delete cascade,
  product_id     int not null references products(product_id) on delete cascade,
  sort_order     int,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  primary key (collection_id, product_id)
);

create table if not exists product_media_links (
  variant_id          int not null references product_variants(variant_id) on delete cascade,
  media_id            int not null references media(media_id) on delete cascade,
  is_display_image    boolean default true,
  is_thumbnail_image  boolean default true,
  primary key (variant_id, media_id)
);

create table if not exists product_availability (
  availability_id  serial primary key,
  product_id       int not null references products(product_id) on delete cascade,
  available_from   timestamptz not null,
  available_until  timestamptz not null,
  notes            text,
  created_at       timestamptz not null default now()
);

create table if not exists inventory (
  inventory_id     serial primary key,
  variant_id       int not null references product_variants(variant_id) on delete cascade,
  location_id      int references locations(location_id) on delete cascade,
  quantity_change  int not null,
  reason           varchar not null,
  notes            text,
  created_at       timestamptz not null default now()
);

create table if not exists orders (
  order_id           serial primary key,
  customer_id        uuid not null references profiles(id) on delete cascade,
  store_id           int not null references stores(store_id) on delete cascade,
  delivery_info_id   int references delivery_info(delivery_info_id) on delete set null,
  order_date         timestamptz default now(),
  total_amount       bigint not null,
  status             text not null default 'pending',
  payment_reference  varchar(255) unique,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists order_items (
  order_item_id      serial primary key,
  order_id           int not null references orders(order_id) on delete cascade,
  variant_id         int not null references product_variants(variant_id) on delete cascade,
  quantity           int not null check (quantity > 0),
  price_at_purchase  numeric(19, 4) not null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists shopping_cart (
  cart_id      serial primary key,
  customer_id  uuid unique not null references profiles(id) on delete cascade,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists shopping_cart_item (
  item_id     serial primary key,
  cart_id     int not null references shopping_cart(cart_id) on delete cascade,
  variant_id  int not null references product_variants(variant_id) on delete cascade,
  quantity    int not null check (quantity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create table if not exists product_reviews (
  order_item_id    int primary key references order_items(order_item_id) on delete cascade,
  rating           numeric(3, 2) not null check (rating >= 0.00 and rating <= 5.00),
  customer_id      uuid not null references profiles(id) on delete cascade,
  customer_remark  varchar,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists vendor_reviews (
  vendor_id        uuid not null references profiles(id) on delete cascade,
  customer_id      uuid not null references profiles(id) on delete cascade,
  order_id         int not null references orders(order_id) on delete cascade,
  rating           numeric(3, 2) not null check (rating >= 0.00 and rating <= 5.00),
  customer_remark  varchar,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  primary key (vendor_id, order_id)
);

create table if not exists customer_reviews (
  customer_id    uuid not null references profiles(id) on delete cascade,
  vendor_id      uuid not null references profiles(id) on delete cascade,
  order_id       int not null references orders(order_id) on delete cascade,
  rating         numeric(3, 2) not null check (rating >= 0.00 and rating <= 5.00),
  vendor_remark  varchar,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  primary key (customer_id, order_id)
);

create table if not exists processed_webhooks (
  event_id    varchar(255) primary key,
  provider    varchar(50) not null default 'paystack',
  payload     jsonb,
  created_at  timestamptz not null default now()
);

/**************************************************************************************************************************************************************************
////////////////////////////////////////////////////////////////////--TRANSACTIONS & ACCOUNTING LEDGER--//////////////////////////////////////////////////////////////////
**************************************************************************************************************************************************************************/

create table if not exists transactions (
  transaction_id     uuid primary key default gen_random_uuid(),
  order_id           int not null references orders(order_id),
  customer_id        uuid not null references profiles(id),
  gateway_provider   gateway_provider_enum not null,
  gateway_reference  text unique not null,
  amount             bigint not null,
  currency           varchar(3) not null default 'NGN',
  status             text not null check (status in ('initiated', 'processing', 'succeeded', 'failed', 'refunded')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists financial_accounts (
  account_id    uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete restrict,
  account_type  text not null,
  name          text not null,
  created_at    timestamptz not null default now()
);

create table if not exists ledger_entries (
  entry_id        bigint generated always as identity primary key,
  transaction_id  uuid references transactions(transaction_id) on delete restrict,
  order_id        int references orders(order_id) on delete restrict,
  event_type      ledger_event not null,
  description     text,
  created_at      timestamptz not null default now()
);

create table if not exists ledger_lines (
  line_id     bigint generated always as identity primary key,
  entry_id    bigint not null references ledger_entries(entry_id) on delete restrict,
  account_id  uuid not null references financial_accounts(account_id),
  amount      bigint not null,
  created_at  timestamptz not null default now()
);

/**************************************************************************************************************************************************************************
////////////////////////////////////////////////////////////////////--VIEWS--//////////////////////////////////////////////////////////////////////////////////////////////
**************************************************************************************************************************************************************************/

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

/**************************************************************************************************************************************************************************
////////////////////////////////////////////////////////////////////--INDEXES--////////////////////////////////////////////////////////////////////////////////////////////
**************************************************************************************************************************************************************************/

create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_processed_webhooks_created_at on public.processed_webhooks(created_at);
create index if not exists idx_ledger_lines_account_created on public.ledger_lines(account_id, created_at desc);
create index if not exists idx_ledger_lines_entry on public.ledger_lines(entry_id);
create index if not exists idx_ledger_entries_transactions on public.ledger_entries(transaction_id);

/**************************************************************************************************************************************************************************
////////////////////////////////////////////////////////////////////--TRIGGERS--///////////////////////////////////////////////////////////////////////////////////////////
**************************************************************************************************************************************************************************/

-- Updated_at triggers
create trigger set_timestamp before update on profiles for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on address for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on categories for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on subcategories for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on payment_info for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on delivery_info for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on featured_product_collections for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on stores for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on store_staff for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on locations for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on pages for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on page_sections for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on store_categories for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on products for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on product_options for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on product_option_values for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on product_variants for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on variant_to_option_values for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on product_store_category_links for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on featured_products for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on featured_product_links for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on app_config for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on media for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on orders for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on order_items for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on shopping_cart for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on shopping_cart_item for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on product_reviews for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on vendor_reviews for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on customer_reviews for each row execute procedure trigger_set_timestamp();
create trigger set_timestamp before update on transactions for each row execute procedure trigger_set_timestamp();

-- Product media links triggers
create trigger trigger_check_product_media_links_filetype
before insert or update on public.product_media_links
for each row execute function check_product_media_links_filetype();

create trigger trigger_enforce_single_special_image
after insert or update on public.product_media_links
for each row execute function enforce_single_special_image();

-- Ledger immutability and balance verification triggers
create trigger trg_protect_ledger_lines
before update or delete on ledger_lines
for each row execute function prevent_accounting_ledger_modification();

create constraint trigger trg_verify_ledger_balance
after insert on ledger_entries
deferrable initially deferred
for each row execute function verify_ledger_entry_balance();

-- Auth triggers on auth.users
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create trigger on_auth_user_updated
after update on auth.users
for each row execute procedure public.handle_update_user();

create trigger on_auth_user_deleted
after delete on auth.users
for each row execute procedure public.handle_delete_user();

/**************************************************************************************************************************************************************************
////////////////////////////////////////////////////////////////////--ROW LEVEL SECURITY & POLICIES--//////////////////////////////////////////////////////////////////////
**************************************************************************************************************************************************************************/

-- profiles
alter table profiles enable row level security;
create policy "User can view their own profile." on profiles for select using (auth.uid() = id);
create policy "User can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "User can update their own profile." on profiles for update using (auth.uid() = id);
create policy "User can delete their own profile." on profiles for delete using (auth.uid() = id);

-- address
alter table address enable row level security;
create policy "Address are private." on address for select using (false);
create policy "Address cannot be inserted." on address for insert with check (false);
create policy "Address cannot be updated." on address for update using (false);
create policy "Address cannot be deleted." on address for delete using (false);

-- categories
alter table categories enable row level security;
create policy "Categories are private." on categories for select using (false);
create policy "Categories cannot be inserted." on categories for insert with check (false);
create policy "Categories cannot be updated." on categories for update using (false);
create policy "Categories cannot be deleted." on categories for delete using (false);

-- subcategories
alter table subcategories enable row level security;
create policy "Subcategories are private." on subcategories for select using (false);
create policy "Subcategories cannot be inserted." on subcategories for insert with check (false);
create policy "Subcategories cannot be updated." on subcategories for update using (false);
create policy "Subcategories cannot be deleted." on subcategories for delete using (false);

-- payment_info
alter table payment_info enable row level security;
create policy "Users can view their own payment info." on payment_info for select using (auth.uid() = customer_id);
create policy "Users can insert their own payment info." on payment_info for insert with check (auth.uid() = customer_id);
create policy "Users can update their own payment info." on payment_info for update using (auth.uid() = customer_id);
create policy "Users can delete their own payment info." on payment_info for delete using (auth.uid() = customer_id);

-- delivery_info
alter table delivery_info enable row level security;
create policy "User can view their own delivery_info." on delivery_info for select using (auth.uid() = customer_id);
create policy "Authenticated users can insert delivery_info." on delivery_info for insert with check (auth.uid() = customer_id);
create policy "Authenticated users can update their own delivery_info." on delivery_info for update using (auth.uid() = customer_id);
create policy "Authenticated users can delete their own delivery_info." on delivery_info for delete using (auth.uid() = customer_id);

-- stores
alter table stores enable row level security;
create policy "Allow vendors and staff to view stores" on stores for select using (has_store_access(auth.uid(), store_id, array['admin', 'editor', 'viewer']));
create policy "Allow owner to insert stores" on stores for insert with check (auth.uid() = vendor_id);
create policy "Allow vendors, admins and editors to update stores" on stores for update using (has_store_access(auth.uid(), store_id, array['admin', 'editor']));
create policy "Allow vendors and admins to delete stores" on stores for delete using (has_store_access(auth.uid(), store_id, array['admin']));

-- store_staff
alter table store_staff enable row level security;
create policy "Allow owners and staff to view store staff" on store_staff for select using (
  auth.uid() = (select vendor_id from stores where store_id = store_staff.store_id) or
  exists (select 1 from store_staff ss where ss.store_id = store_staff.store_id and ss.staff_id = auth.uid())
);
create policy "Store owners can insert staff." on store_staff for insert with check (
  auth.uid() = (select vendor_id from stores where store_id = store_staff.store_id)
);
create policy "Store owners can update staff." on store_staff for update using (
  auth.uid() = (select vendor_id from stores where store_id = store_staff.store_id)
);
create policy "Store owners can delete staff." on store_staff for delete using (
  auth.uid() = (select vendor_id from stores where store_id = store_staff.store_id)
);

-- locations
alter table locations enable row level security;
create policy "Vendors can manage their own locations." on locations for all using (auth.uid() = (select vendor_id from stores where store_id = locations.store_id));

-- pages
alter table pages enable row level security;
create policy "Allow vendors and staff to view pages" on pages for select using (has_store_access(auth.uid(), store_id, array['admin', 'editor', 'viewer']));
create policy "Allow vendors, admins and editors to insert pages" on pages for insert with check (has_store_access(auth.uid(), store_id, array['admin', 'editor']));
create policy "Allow vendors, admins and editors to update pages" on pages for update using (has_store_access(auth.uid(), store_id, array['admin', 'editor']));
create policy "Allow vendors and admins to delete pages" on pages for delete using (has_store_access(auth.uid(), store_id, array['admin']));

-- page_sections
alter table page_sections enable row level security;
create policy "Allow vendors and staff to view page_sections" on page_sections for select using (exists(select 1 from pages where pages.page_id = page_sections.page_id and has_store_access(auth.uid(), pages.store_id, array['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert page_sections" on page_sections for insert with check (exists(select 1 from pages where pages.page_id = page_sections.page_id and has_store_access(auth.uid(), pages.store_id, array['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update page_sections" on page_sections for update using (exists(select 1 from pages where pages.page_id = page_sections.page_id and has_store_access(auth.uid(), pages.store_id, array['admin', 'editor'])));
create policy "Allow vendors and admins to delete page_sections" on page_sections for delete using (exists(select 1 from pages where pages.page_id = page_sections.page_id and has_store_access(auth.uid(), pages.store_id, array['admin'])));

-- store_categories
alter table store_categories enable row level security;
create policy "Allow vendors and staff to view store_categories" on store_categories for select using (has_store_access(auth.uid(), store_id, array['admin', 'editor', 'viewer']));
create policy "Allow vendors, admins and editors to insert store_categories" on store_categories for insert with check (has_store_access(auth.uid(), store_id, array['admin', 'editor']));
create policy "Allow vendors, admins and editors to update store_categories" on store_categories for update using (has_store_access(auth.uid(), store_id, array['admin', 'editor']));
create policy "Allow vendors and admins to delete store_categories" on store_categories for delete using (has_store_access(auth.uid(), store_id, array['admin']));

-- products
alter table products enable row level security;
create policy "Allow vendors and staff to view products" on products for select using (has_store_access(auth.uid(), store_id, array['admin', 'editor', 'viewer']));
create policy "Allow vendors, admins and editors to insert products" on products for insert with check (has_store_access(auth.uid(), store_id, array['admin', 'editor']));
create policy "Allow vendors, admins and editors to update products" on products for update using (has_store_access(auth.uid(), store_id, array['admin', 'editor']));
create policy "Allow vendors and admins to delete products" on products for delete using (has_store_access(auth.uid(), store_id, array['admin']));

-- product_availability
alter table product_availability enable row level security;
create policy "Vendors can manage their own product availability." on product_availability for all using (exists(select 1 from products p where p.product_id = product_availability.product_id and has_store_access(auth.uid(), p.store_id, array['admin', 'editor'])));

-- product_options
alter table product_options enable row level security;
create policy "Allow vendors and staff to view product_options" on product_options for select using (exists(select 1 from products where products.product_id = product_options.product_id and has_store_access(auth.uid(), products.store_id, array['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert product_options" on product_options for insert with check (exists(select 1 from products where products.product_id = product_options.product_id and has_store_access(auth.uid(), products.store_id, array['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update product_options" on product_options for update using (exists(select 1 from products where products.product_id = product_options.product_id and has_store_access(auth.uid(), products.store_id, array['admin', 'editor'])));
create policy "Allow vendors and admins to delete product_options" on product_options for delete using (exists(select 1 from products where products.product_id = product_options.product_id and has_store_access(auth.uid(), products.store_id, array['admin'])));

-- product_option_values
alter table product_option_values enable row level security;
create policy "Allow vendors and staff to view product_option_values" on product_option_values for select using (exists(select 1 from product_options po join products p on p.product_id = po.product_id where po.option_id = product_option_values.option_id and has_store_access(auth.uid(), p.store_id, array['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert product_option_values" on product_option_values for insert with check (exists(select 1 from product_options po join products p on p.product_id = po.product_id where po.option_id = product_option_values.option_id and has_store_access(auth.uid(), p.store_id, array['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update product_option_values" on product_option_values for update using (exists(select 1 from product_options po join products p on p.product_id = po.product_id where po.option_id = product_option_values.option_id and has_store_access(auth.uid(), p.store_id, array['admin', 'editor'])));
create policy "Allow vendors and admins to delete product_option_values" on product_option_values for delete using (exists(select 1 from product_options po join products p on p.product_id = po.product_id where po.option_id = product_option_values.option_id and has_store_access(auth.uid(), p.store_id, array['admin'])));

-- product_variants
alter table product_variants enable row level security;
create policy "Allow vendors and staff to view product_variants" on product_variants for select using (exists(select 1 from products where products.product_id = product_variants.product_id and has_store_access(auth.uid(), products.store_id, array['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert product_variants" on product_variants for insert with check (exists(select 1 from products where products.product_id = product_variants.product_id and has_store_access(auth.uid(), products.store_id, array['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update product_variants" on product_variants for update using (exists(select 1 from products where products.product_id = product_variants.product_id and has_store_access(auth.uid(), products.store_id, array['admin', 'editor'])));
create policy "Allow vendors and admins to delete product_variants" on product_variants for delete using (exists(select 1 from products where products.product_id = product_variants.product_id and has_store_access(auth.uid(), products.store_id, array['admin'])));

-- inventory
alter table inventory enable row level security;
create policy "Vendors can manage their own inventory." on inventory for all using (exists(select 1 from product_variants pv join products p on p.product_id = pv.product_id where pv.variant_id = inventory.variant_id and has_store_access(auth.uid(), p.store_id, array['admin', 'editor'])));

-- variant_to_option_values
alter table variant_to_option_values enable row level security;
create policy "Allow vendors and staff to view variant_to_option_values" on variant_to_option_values for select using (exists(select 1 from product_variants pv join products p on p.product_id = pv.product_id where pv.variant_id = variant_to_option_values.variant_id and has_store_access(auth.uid(), p.store_id, array['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert variant_to_option_values" on variant_to_option_values for insert with check (exists(select 1 from product_variants pv join products p on p.product_id = pv.product_id where pv.variant_id = variant_to_option_values.variant_id and has_store_access(auth.uid(), p.store_id, array['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update variant_to_option_values" on variant_to_option_values for update using (exists(select 1 from product_variants pv join products p on p.product_id = pv.product_id where pv.variant_id = variant_to_option_values.variant_id and has_store_access(auth.uid(), p.store_id, array['admin', 'editor'])));
create policy "Allow vendors and admins to delete variant_to_option_values" on variant_to_option_values for delete using (exists(select 1 from product_variants pv join products p on p.product_id = pv.product_id where pv.variant_id = variant_to_option_values.variant_id and has_store_access(auth.uid(), p.store_id, array['admin'])));

-- product_store_category_links
alter table product_store_category_links enable row level security;
create policy "Allow vendors and staff to view product_store_category_links" on product_store_category_links for select using (exists(select 1 from products p where p.product_id = product_store_category_links.product_id and has_store_access(auth.uid(), p.store_id, array['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert product_store_category_links" on product_store_category_links for insert with check (exists(select 1 from products p where p.product_id = product_store_category_links.product_id and has_store_access(auth.uid(), p.store_id, array['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update product_store_category_links" on product_store_category_links for update using (exists(select 1 from products p where p.product_id = product_store_category_links.product_id and has_store_access(auth.uid(), p.store_id, array['admin', 'editor'])));
create policy "Allow vendors and admins to delete product_store_category_links" on product_store_category_links for delete using (exists(select 1 from products p where p.product_id = product_store_category_links.product_id and has_store_access(auth.uid(), p.store_id, array['admin'])));

-- featured_products
alter table featured_products enable row level security;
create policy "Allow vendors and staff to view featured_products" on featured_products for select using (exists(select 1 from products where products.product_id = featured_products.product_id and has_store_access(auth.uid(), products.store_id, array['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert featured_products" on featured_products for insert with check (exists(select 1 from products where products.product_id = featured_products.product_id and has_store_access(auth.uid(), products.store_id, array['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update featured_products" on featured_products for update using (exists(select 1 from products where products.product_id = featured_products.product_id and has_store_access(auth.uid(), products.store_id, array['admin', 'editor'])));
create policy "Allow vendors and admins to delete featured_products" on featured_products for delete using (exists(select 1 from products where products.product_id = featured_products.product_id and has_store_access(auth.uid(), products.store_id, array['admin'])));

-- featured_product_links
alter table featured_product_links enable row level security;
create policy "Allow vendors and staff to view featured_product_links" on featured_product_links for select using (exists(select 1 from products where products.product_id = featured_product_links.product_id and has_store_access(auth.uid(), products.store_id, array['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert featured_product_links" on featured_product_links for insert with check (exists(select 1 from products where products.product_id = featured_product_links.product_id and has_store_access(auth.uid(), products.store_id, array['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update featured_product_links" on featured_product_links for update using (exists(select 1 from products where products.product_id = featured_product_links.product_id and has_store_access(auth.uid(), products.store_id, array['admin', 'editor'])));
create policy "Allow vendors and admins to delete featured_product_links" on featured_product_links for delete using (exists(select 1 from products where products.product_id = featured_product_links.product_id and has_store_access(auth.uid(), products.store_id, array['admin'])));

-- media
alter table media enable row level security;
create policy "Users can view all media." on media for select using (true);
create policy "Authenticated users can insert media." on media for insert with check (auth.uid() = uploader_id);
create policy "Users can update their own media." on media for update using (auth.uid() = uploader_id);
create policy "Users can delete their own media." on media for delete using (auth.uid() = uploader_id);

-- profile_media
alter table profile_media enable row level security;
create policy "Users can view their own profile media." on profile_media for select using (auth.uid() = profile_id);
create policy "Authenticated users can insert their own profile media." on profile_media for insert with check (auth.uid() = profile_id);
create policy "Users can update their own profile media." on profile_media for update using (auth.uid() = profile_id);
create policy "Users can delete their own profile media." on profile_media for delete using (auth.uid() = profile_id);

-- product_media_links
alter table product_media_links enable row level security;
create policy "Vendors can view their own product media links." on product_media_links for select using (exists (select 1 from products p join product_variants pv on p.product_id = pv.product_id where pv.variant_id = product_media_links.variant_id and p.vendor_id = auth.uid()));
create policy "Vendors can insert their own product media links." on product_media_links for insert with check (exists (select 1 from products p join product_variants pv on p.product_id = pv.product_id where pv.variant_id = product_media_links.variant_id and p.vendor_id = auth.uid()));
create policy "Vendors can update their own product media links." on product_media_links for update using (exists (select 1 from products p join product_variants pv on p.product_id = pv.product_id where pv.variant_id = product_media_links.variant_id and p.vendor_id = auth.uid()));
create policy "Vendors can delete their own product media links." on product_media_links for delete using (exists (select 1 from products p join product_variants pv on p.product_id = pv.product_id where pv.variant_id = product_media_links.variant_id and p.vendor_id = auth.uid()));

-- orders
alter table orders enable row level security;
create policy "Customers can manage their own orders" on orders for all using (auth.uid() = customer_id) with check (auth.uid() = customer_id);
create policy "Allow vendors and staff to view orders" on orders for select using (has_store_access(auth.uid(), store_id, array['admin', 'editor', 'viewer']));
create policy "Allow vendors, admins and editors to update orders" on orders for update using (has_store_access(auth.uid(), store_id, array['admin', 'editor']));

-- order_items
alter table order_items enable row level security;
create policy "Customers can manage their own order_items" on order_items for all using (exists(select 1 from orders where orders.order_id = order_items.order_id and orders.customer_id = auth.uid())) with check (exists(select 1 from orders where orders.order_id = order_items.order_id and orders.customer_id = auth.uid()));
create policy "Allow vendors and staff to view order_items" on order_items for select using (exists(select 1 from orders where orders.order_id = order_items.order_id and has_store_access(auth.uid(), orders.store_id, array['admin', 'editor', 'viewer'])));

-- shopping_cart
alter table shopping_cart enable row level security;
create policy "Users can view their own shopping_cart." on shopping_cart for select using (auth.uid() = customer_id);
create policy "Users can insert their own shopping_cart." on shopping_cart for insert with check (auth.uid() = customer_id);
create policy "Users can update their own shopping_cart." on shopping_cart for update using (auth.uid() = customer_id);
create policy "Users can delete their own shopping_cart." on shopping_cart for delete using (auth.uid() = customer_id);

-- shopping_cart_item
alter table shopping_cart_item enable row level security;
create policy "Users can view their own shopping_cart_item." on shopping_cart_item for select using (exists (select 1 from shopping_cart where shopping_cart.cart_id = shopping_cart_item.cart_id and shopping_cart.customer_id = auth.uid()));
create policy "Users can insert their own shopping_cart_item." on shopping_cart_item for insert with check (exists (select 1 from shopping_cart where shopping_cart.cart_id = shopping_cart_item.cart_id and shopping_cart.customer_id = auth.uid()));
create policy "Users can update their own shopping_cart_item." on shopping_cart_item for update using (exists (select 1 from shopping_cart where shopping_cart.cart_id = shopping_cart_item.cart_id and shopping_cart.customer_id = auth.uid()));
create policy "Users can delete their own shopping_cart_item." on shopping_cart_item for delete using (exists (select 1 from shopping_cart where shopping_cart.cart_id = shopping_cart_item.cart_id and shopping_cart.customer_id = auth.uid()));

-- product_reviews
alter table product_reviews enable row level security;
create policy "Users can view their own product_reviews." on product_reviews for select using (auth.uid() = customer_id);
create policy "Users can insert their own product_reviews." on product_reviews for insert with check (auth.uid() = customer_id);
create policy "Users can update their own product_reviews." on product_reviews for update using (auth.uid() = customer_id);
create policy "Users can delete their own product_reviews." on product_reviews for delete using (auth.uid() = customer_id);

-- vendor_reviews
alter table vendor_reviews enable row level security;
create policy "Users can view their own vendor_reviews." on vendor_reviews for select using (auth.uid() = customer_id);
create policy "Users can insert their own vendor_reviews." on vendor_reviews for insert with check (auth.uid() = customer_id);
create policy "Users can update their own vendor_reviews." on vendor_reviews for update using (auth.uid() = customer_id);
create policy "Users can delete their own vendor_reviews." on vendor_reviews for delete using (auth.uid() = customer_id);

-- customer_reviews
alter table customer_reviews enable row level security;
create policy "Allow vendors and staff to view customer_reviews" on customer_reviews for select using (exists(select 1 from orders where orders.order_id = customer_reviews.order_id and has_store_access(auth.uid(), orders.store_id, array['admin', 'editor', 'viewer'])));
create policy "Allow vendors, admins and editors to insert customer_reviews" on customer_reviews for insert with check (exists(select 1 from orders where orders.order_id = customer_reviews.order_id and has_store_access(auth.uid(), orders.store_id, array['admin', 'editor'])));
create policy "Allow vendors, admins and editors to update customer_reviews" on customer_reviews for update using (exists(select 1 from orders where orders.order_id = customer_reviews.order_id and has_store_access(auth.uid(), orders.store_id, array['admin', 'editor'])));
create policy "Allow vendors and admins to delete customer_reviews" on customer_reviews for delete using (exists(select 1 from orders where orders.order_id = customer_reviews.order_id and has_store_access(auth.uid(), orders.store_id, array['admin'])));
