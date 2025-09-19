drop schema if exists public cascade;
create schema if not exists public;

-- function to update updated_at column
create or replace function trigger_set_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- update landing image or display image for all rows when one row is changed
create or replace function product_media_display_landing_trigger () 
returns trigger as $$

begin 
    if (tg_op='insert' or tg_op='update') then
        if new.is_display_image=true then
            update product_media
            set is_display_image = false
            where product_id = new.product_id
              and filename != new.filename
              and is_display_image = true;
        end if;
        if new.is_landing_image=true then
            update product_media
            set is_landing_image = false
            where product_id = new.product_id
              and filename != new.filename
              and is_landing_image = true;
        end if;
    end if;
    return new;
end;
$$ language plpgsql;

-- Function to handle new user creation in auth.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
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
  set deleted_at = now() -- <- Soft Delete. Set cronjob to delete after 30 days
  where id = old.id;
  return old;
end;
$$ language plpgsql security definer;

/**************************************************************************************************************************************************************************
////////////////////////////////////////////////////////////////////--PLATFORM-WIDE TABLES--///////////////////////////////////////////////////////////////////////////////
**************************************************************************************************************************************************************************/

create table if not exists profiles (
  id 		 uuid                    primary    key, -- Get from Firebase
  first_name   varchar(30)               not        null,
	check				 (first_name ~* '^[a-zA-Z]+$'),
  last_name    varchar(30)               not        null,
	check				 (last_name ~* '^[a-zA-Z]+([-'']*[a-zA-Z]+)+$'),
  email        varchar(320)              unique,
  check        (email ~* '^(([^<> ()[\]\\.,;:\s@"]+(\.[^< > ()[\]\\.,;'
							 ':\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1'
							 ',3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$'),  
  phone        varchar(40)               unique,
  check        (phone ~* '^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$'),  
	check				 (email is not null and phone is not null 
							 or email is null and phone is not null 
							 or email is not null and phone is null),
  dob          date                      not        null,
  country      varchar                   not        null 			default  		'Nigeria',
	is_customer  boolean 									 not 				null 			default 		true,
	is_vendor    boolean 									 not 				null 			default 		false,
  check        (current_date - dob > 18),
  deleted_at   timestamptz,
  created_at   timestamptz               not 				null 			default      now(),
  updated_at   timestamptz               not 				null 			default      now()
);


-- create a trigger to update the updated_at column for profiles
create trigger set_timestamp
before update on profiles
for each row
execute procedure trigger_set_timestamp();

create table if not exists address (
  address_id              serial        primary   key,
  address_line_1          varchar       not       null,
  address_line_2          varchar,
  city                    varchar       not       null,
  state                   varchar       not       null,
  zip_postal_code         varchar       not       null,
  country							varchar       not       null,
  created_at        			timestamptz     		not 			null 			default     now(),
  updated_at        			timestamptz     		not 			null 			default     now()
);

-- create a trigger to update the updated_at column for address
create trigger set_timestamp
before update on address
for each row
execute procedure trigger_set_timestamp();

create table if not exists categories (
	category_id					serial					primary 	key,
	category_name 			varchar,
  created_at          timestamptz     not 			null 				default     now(),
  updated_at          timestamptz     not 			null 				default     now()
);

-- create a trigger to update the updated_at column for categories
create trigger set_timestamp
before update on categories
for each row
execute procedure trigger_set_timestamp();

create table if not exists subcategories (
	subcategory_id			serial				primary 		key,
	category_id 				int					not 				null			references		categories			on 		delete	cascade,
	subcategory_name		varchar,
  created_at          timestamptz     not 			null 			default     now(),
  updated_at          timestamptz     not 			null 			default     now()
);

-- create a trigger to update the updated_at column for subcategories
create trigger set_timestamp
before update on subcategories
for each row
execute procedure trigger_set_timestamp();

create table if not exists payment_info (
	payment_id 				serial 				primary 				key,
	payment_token 				varchar 				not 					null,
  created_at        timestamptz     not 			null 			default     now(),
  updated_at        timestamptz     not 			null 			default     now()
);

-- create a trigger to update the updated_at column for payment_info
create trigger set_timestamp
before update on payment_info
for each row
execute procedure trigger_set_timestamp();

create table if not exists delivery_info (
  delivery_info_id        serial        primary   key,
  customer_id             uuid           not      null    references   profiles   on   delete   cascade,
  recipient_full_name    	varchar(30)   not       null,
  address_id              int           not       null    references   address    on   delete   cascade,
  phone_number 		        varchar       not       null,
  created_at        			timestamptz     		not 			null 			default     now(),
  updated_at        			timestamptz     		not 			null 			default     now(),
  delivery_instructions   varchar
);

-- create a trigger to update the updated_at column for delivery_info
create trigger set_timestamp
before update on delivery_info
for each row
execute procedure trigger_set_timestamp();

create table if not exists featured_product_collections (
  collection_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- create a trigger to update the updated_at column for featured_product_collections
create trigger set_timestamp
before update on featured_product_collections
for each row
execute procedure trigger_set_timestamp();

/**************************************************************************************************************************************************************************
////////////////////////////////////////////////////////////////////--STORE-WIDE TABLES--///////////////////////////////////////////////////////////////////////////////
**************************************************************************************************************************************************************************/

create table if not exists stores (
  store_id           serial        primary key,   -- Unique identifier for the store
  store_name         varchar       not null,
  custom_domain      varchar       unique,        -- Custom domain must be unique
  vendor_id          uuid          not null references profiles (id) on delete cascade,
  favicon            varchar,
  global_styles      jsonb,                       -- Store global styles (fonts, colors) as JSONB
  address_id         int           references address (address_id) on delete cascade,
  created_at         timestamptz   not null default now(),
  updated_at         timestamptz   default now()
);

-- create a trigger to update the updated_at column for stores
create trigger set_timestamp
before update on stores
for each row
execute procedure trigger_set_timestamp();

-- 2. `pages` table: Each page is now its own separate record.
-- This is the key change. Now you can query, update, or delete a single page
-- without affecting any other page.
create table if not exists pages (
  page_id            serial        primary key,   -- Unique identifier for the page
  store_id           int           not null references stores (store_id) on delete cascade,
  page_slug          varchar       not null,      -- e.g., 'about-us'
  page_title         varchar       not null,
  page_type          varchar       not null,      -- e.g., 'homepage', 'standard', 'product_list', 'custom'
  seo_data           jsonb 				 not null,                       -- Store SEO information as JSONB
  created_at         timestamptz   not null default now(),
  updated_at         timestamptz   not null default now(),
  -- This ensures a unique slug per store, preventing URL conflicts
  unique (store_id, page_slug)
);

-- create a trigger to update the updated_at column for pages
create trigger set_timestamp
before update on pages
for each row
execute procedure trigger_set_timestamp();

-- 3. `page_sections` table: The building blocks of a page.
-- This table stores the modular, "scriptable" content of each page.
-- The `sort_order` allows vendors to rearrange sections on a page.
create table if not exists page_sections (
  section_id         serial        primary key,   -- Unique identifier for the section
  page_id            int           not null references pages (page_id) on delete cascade,
  section_title      varchar,      -- The title of the section
  section_type       varchar       not null,      -- e.g., 'hero', 'product_grid', 'text_block'
  section_data       jsonb,                       -- JSONB for the section-specific content and styling
  sort_order         int           not null,      -- The order in which the section should appear on the page
  styles      			 jsonb,                       -- Section styles (fonts, colors) as JSONB
  created_at         timestamptz   not null default now(),
  updated_at         timestamptz   not null default now()
);

-- create a trigger to update the updated_at column for page_sections
create trigger set_timestamp
before update on page_sections
for each row
execute procedure trigger_set_timestamp();

create table if not exists store_categories (
    store_category_id SERIAL PRIMARY KEY,
    store_id INT NOT NULL REFERENCES stores ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (store_id, name)
);

-- create a trigger to update the updated_at column for store_categories
create trigger set_timestamp
before update on store_categories
for each row
execute procedure trigger_set_timestamp();

create table if not exists products (
  product_id           serial           primary   key,
  title                varchar					not 			null,
  description          text[] 					not 			null,
  list_price           numeric(19,4) 		not 			null,
  net_price            numeric(19,4),
  vendor_id            uuid             not       null    references			profiles        on   delete   cascade,
	store_id 					 	 int 							not 			null 		references 			stores 					on 	 delete 	cascade,
  category_id          int           		not    		null    references   		categories      on   delete   cascade,
  subcategory_id       int           		not    		null    references   		subcategories   on   delete   cascade,
  created_at           timestamptz      not 			null 			default      now(),
  updated_at           timestamptz      not 			null 			default      now()
);

-- create a trigger to update the updated_at column for products
create trigger set_timestamp
before update on products
for each row
execute procedure trigger_set_timestamp();

create table if not exists product_options (
  option_id            serial        primary key,
  product_id           int           not null references products (product_id) on delete cascade,
  option_name          varchar       not null,
  created_at           timestamptz   not null default now(),
  updated_at           timestamptz   not null default now(),
  unique (product_id, option_name)
);

-- create a trigger to update the updated_at column for product_options
create trigger set_timestamp
before update on product_options
for each row
execute procedure trigger_set_timestamp();

create table if not exists product_option_values (
  value_id             serial        primary key,
  option_id            int           not null references product_options (option_id) on delete cascade,
  value                varchar       not null,
  created_at           timestamptz   not null default now(),
  updated_at           timestamptz   not null default now(),
  unique (option_id, value)
);

-- create a trigger to update the updated_at column for product_option_values
create trigger set_timestamp
before update on product_option_values
for each row
execute procedure trigger_set_timestamp();

create table if not exists product_variants (
  variant_id           serial           primary   key,
  product_id           int              not       null    references   products   on   delete   cascade,
  sku                  varchar          not       null    unique,
  list_price           numeric(19,4),
  net_price            numeric(19,4),
  quantity_available   int,
  created_at           timestamptz      not       null    default      now(),
  updated_at           timestamptz      not       null    default      now()
);

-- create a trigger to update the updated_at column for product_variants
create trigger set_timestamp
before update on product_variants
for each row
execute procedure trigger_set_timestamp();

create table if not exists variant_to_option_values (
  variant_id           int           not null references product_variants (variant_id) on delete cascade,
  value_id             int           not null references product_option_values (value_id) on delete cascade,
  created_at           timestamptz   not null default now(),
  updated_at           timestamptz   not null default now(),
  primary key (variant_id, value_id)
);

-- create a trigger to update the updated_at column for variant_to_option_values
create trigger set_timestamp
before update on variant_to_option_values
for each row
execute procedure trigger_set_timestamp();

create table if not exists product_store_category_links (
    product_id INT NOT NULL REFERENCES products ON DELETE CASCADE,
    store_category_id INT NOT NULL REFERENCES store_categories ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product_id, store_category_id)
);

-- create a trigger to update the updated_at column for product_store_category_links
create trigger set_timestamp
before update on product_store_category_links
for each row
execute procedure trigger_set_timestamp();

create type featured_product_type_enum as enum (
  'BEST_SELLER',
  'NEW_ARRIVAL',
  'FEATURED',
  'ON_SALE',
  'CLEARANCE'
);

-- This table stores various promotional or status features for products.
-- While some of these (e.g., BEST_SELLER, ON_SALE, CLEARANCE) could be computed,
-- storing them explicitly allows for better performance, business-driven overrides,
-- and historical tracking. A background job can be used to set or update these values
-- based on business rules or computed metrics.
create table if not exists featured_products (
  featured_product_id serial primary key,
  product_id int not null references products on delete cascade,
  feature_type featured_product_type_enum not null,
  start_date timestamptz default now(),
  end_date timestamptz,
  sort_order int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, feature_type)
);

-- create a trigger to update the updated_at column for featured_products
create trigger set_timestamp
before update on featured_products
for each row
execute procedure trigger_set_timestamp();

create table if not exists featured_product_links (
  collection_id INT NOT NULL REFERENCES featured_product_collections ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products ON DELETE CASCADE,
  sort_order INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection_id, product_id)
);

-- create a trigger to update the updated_at column for featured_product_links
create trigger set_timestamp
before update on featured_product_links
for each row
execute procedure trigger_set_timestamp();

create table if not exists orders (
    order_id 							serial						primary 				key,
    customer_id 					uuid						references 			profiles 						on delete cascade not null,
    store_id 							int 						references 			stores 						on delete cascade not null,
    delivery_info_id 			int 						references 			delivery_info 			on delete set null,
    order_date 						timestamptz				default 				now(),
    total_amount 					numeric(10, 2)		not null,
    status 								text						default 				'pending' 				not null,
    created_at 						timestamptz				not 						null 							default 				now(),
    updated_at 						timestamptz				not 						null 							default 				now()
);

-- create a trigger to update the updated_at column for orders
create trigger set_timestamp
before update on orders
for each row
execute procedure trigger_set_timestamp();

create table if not exists order_items (
    order_item_id       serial          primary     key,
    order_id            int          not         null    references  orders          on  delete  cascade,
    variant_id          int             not         null    references  product_variants on  delete  cascade,
    quantity            int             not         null    check       (quantity > 0),
    price_at_purchase   numeric(19,4)   not         null,
    created_at          timestamptz     not 				null 			default     now(),
    updated_at          timestamptz     not 				null 			default     now()
);

-- create a trigger to update the updated_at column for order_items
create trigger set_timestamp
before update on order_items
for each row
execute procedure trigger_set_timestamp();

create table if not exists product_media (
  product_id					int					not null   references   products   on   delete   cascade,
  filename						varchar			primary    key,
  filepath						varchar			not        null,
  description						varchar,
	is_display_image			boolean			default		 false,
	is_landing_image			boolean			default		 false,
	filetype            varchar     not        null    default    'image',
  created_at          timestamptz     not  	 null 				default     now(),
  updated_at          timestamptz     not  	 null 				default     now(),
  check (filetype in ('image', 'video')),
  check (not (is_display_image = true and filetype != 'image')),
  check (not (is_landing_image = true and filetype != 'image'))
);

-- create a trigger to update the updated_at column for product_media
create trigger set_timestamp
before update on product_media
for each row
execute procedure trigger_set_timestamp();

create table if not exists shopping_cart (
  cart_id       serial        primary   key,
  customer_id   uuid           not       null   references   profiles   on   delete   cascade,
  created_at    timestamptz   not       null   default      now(),
  updated_at    timestamptz   not       null   default      now()
);

-- create a trigger to update the updated_at column for shopping_cart
create trigger set_timestamp
before update on shopping_cart
for each row
execute procedure trigger_set_timestamp();

create table if not exists shopping_cart_item (
  item_id      serial   primary   key,
  cart_id      int      not       null   references   shopping_cart   on   delete   cascade,
  variant_id   int      not       null   references   product_variants on   delete   cascade,
  quantity     int      not       null   check        (quantity > 0),
  created_at    timestamptz   not       null   default      now(),
  updated_at    timestamptz   not       null   default      now(),
  unique(cart_id, variant_id)
);

-- create a trigger to update the updated_at column for shopping_cart_item
create trigger set_timestamp
before update on shopping_cart_item
for each row
execute procedure trigger_set_timestamp();

create table if not exists product_reviews (
	order_item_id 				int 						primary key 	 references order_items 				on 			delete 	 cascade,
  rating            numeric(3,2)   not       null    check (rating >= 0.00 and rating <= 5.00),
  customer_id       uuid            not       null    references   profiles             on   delete   cascade,
  customer_remark   varchar,
  created_at    timestamptz   not       null   default      now(),
  updated_at    timestamptz   not       null   default      now()
);

-- create a trigger to update the updated_at column for product_reviews
create trigger set_timestamp
before update on product_reviews
for each row
execute procedure trigger_set_timestamp();

create table if not exists vendor_reviews (
  vendor_id         uuid            not       null    references   profiles               on   delete   cascade,
  customer_id       uuid            not       null    references   profiles             on   delete   cascade,
  order_id    int            not       null    references   orders				  on   delete   cascade,
  rating            numeric(3,2)   not       null    check (rating >= 0.00 and rating <= 5.00),
  customer_remark   varchar,
  created_at    timestamptz   not       null   default      now(),
  updated_at    timestamptz   not       null   default      now(),
  primary key (vendor_id, order_id)
);

-- create a trigger to update the updated_at column for vendor_reviews
create trigger set_timestamp
before update on vendor_reviews
for each row
execute procedure trigger_set_timestamp();

create table if not exists customer_reviews (
  customer_id      uuid            not       null    references   profiles             on   delete   cascade,
  vendor_id        uuid            not       null    references   profiles               on   delete   cascade,
  order_id   int            not       null    references   orders   on   delete   cascade,
  rating           numeric(3,2)   not       null    check (rating >= 0.00 and rating <= 5.00),
  vendor_remark    varchar,
  created_at    timestamptz   not       null   default      now(),
  updated_at    timestamptz   not       null   default      now(),
  primary key (customer_id, order_id)
);

-- create a trigger to update the updated_at column for customer_reviews
create trigger set_timestamp
before update on customer_reviews
for each row
execute procedure trigger_set_timestamp();

-- #################################################################
-- RLS
-- #################################################################

-- Enable RLS for tables and create basic select policies
alter table profiles enable row level security;
create policy "User can view their own profile." on profiles for select using (auth.uid() = id);
create policy "User can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "User can update their own profile." on profiles for update using (auth.uid() = id);
create policy "User can delete their own profile." on profiles for delete using (auth.uid() = id);

alter table address enable row level security;
create policy "Address are private." on address for select using (false);
create policy "Address cannot be inserted." on address for insert with check (false);
create policy "Address cannot be updated." on address for update using (false);
create policy "Address cannot be deleted." on address for delete using (false);

alter table delivery_info enable row level security;
create policy "User can view their own delivery_info." on delivery_info for select using (auth.uid() = customer_id);
create policy "Authenticated users can insert delivery_info." on delivery_info for insert with check (auth.uid() = customer_id);
create policy "Authenticated users can update their own delivery_info." on delivery_info for update using (auth.uid() = customer_id);
create policy "Authenticated users can delete their own delivery_info." on delivery_info for delete using (auth.uid() = customer_id);

alter table payment_info enable row level security;
create policy "Payment info are private." on payment_info for select using (false);
create policy "Payment info cannot be inserted." on payment_info for insert with check (false);
create policy "Payment info cannot be updated." on payment_info for update using (false);
create policy "Payment info cannot be deleted." on payment_info for delete using (false);

alter table stores enable row level security;
create policy "Vendors can view their own stores." on stores for select using (auth.uid() = vendor_id);
create policy "Vendors can insert their own stores." on stores for insert with check (auth.uid() = vendor_id);
create policy "Vendors can update their own stores." on stores for update using (auth.uid() = vendor_id);
create policy "Vendors can delete their own stores." on stores for delete using (auth.uid() = vendor_id);

alter table categories enable row level security;
create policy "Categories are private." on categories for select using (false);
create policy "Categories cannot be inserted." on categories for insert with check (false);
create policy "Categories cannot be updated." on categories for update using (false);
create policy "Categories cannot be deleted." on categories for delete using (false);

alter table subcategories enable row level security;
create policy "Subcategories are private." on subcategories for select using (false);
create policy "Subcategories cannot be inserted." on subcategories for insert with check (false);
create policy "Subcategories cannot be updated." on subcategories for update using (false);
create policy "Subcategories cannot be deleted." on subcategories for delete using (false);

alter table store_categories enable row level security;
create policy "Vendors can view their own store_categories." on store_categories for select using (auth.uid() = (SELECT vendor_id FROM stores WHERE store_id = store_categories.store_id));
create policy "Vendors can insert their own store_categories." on store_categories for insert with check (auth.uid() = (SELECT vendor_id FROM stores WHERE store_id = store_categories.store_id));
create policy "Vendors can update their own store_categories." on store_categories for update using (auth.uid() = (SELECT vendor_id FROM stores WHERE store_id = store_categories.store_id));
create policy "Vendors can delete their own store_categories." on store_categories for delete using (auth.uid() = (SELECT vendor_id FROM stores WHERE store_id = store_categories.store_id));

alter table product_store_category_links enable row level security;
create policy "Vendors can view their own product_store_category_links." on product_store_category_links for select using (EXISTS ( SELECT 1 FROM products WHERE products.product_id = product_store_category_links.product_id AND products.vendor_id = auth.uid() ));
create policy "Vendors can insert their own product_store_category_links." on product_store_category_links for insert with check (EXISTS ( SELECT 1 FROM products WHERE products.product_id = product_store_category_links.product_id AND products.vendor_id = auth.uid() ));
create policy "Vendors can update their own product_store_category_links." on product_store_category_links for update using (EXISTS ( SELECT 1 FROM products WHERE products.product_id = product_store_category_links.product_id AND products.vendor_id = auth.uid() ));
create policy "Vendors can delete their own product_store_category_links." on product_store_category_links for delete using (EXISTS ( SELECT 1 FROM products WHERE products.product_id = product_store_category_links.product_id AND products.vendor_id = auth.uid() ));

alter table products enable row level security;
create policy "Vendors can view their own products." on products for select using (auth.uid() = vendor_id);
create policy "Vendors can insert their own products." on products for insert with check (auth.uid() = vendor_id);
create policy "Vendors can update their own products." on products for update using (auth.uid() = vendor_id);
create policy "Vendors can delete their own products." on products for delete using (auth.uid() = vendor_id);

alter table product_variants enable row level security;
create policy "Vendors can view their own product_variants." on product_variants for select using (EXISTS ( SELECT 1 FROM products WHERE products.product_id = product_variants.product_id AND products.vendor_id = auth.uid() ));
create policy "Vendors can insert their own product_variants." on product_variants for insert with check (EXISTS ( SELECT 1 FROM products WHERE products.product_id = product_variants.product_id AND products.vendor_id = auth.uid() ));
create policy "Vendors can update their own product_variants." on product_variants for update using (EXISTS ( SELECT 1 FROM products WHERE products.product_id = product_variants.product_id AND products.vendor_id = auth.uid() ));
create policy "Vendors can delete their own product_variants." on product_variants for delete using (EXISTS ( SELECT 1 FROM products WHERE products.product_id = product_variants.product_id AND products.vendor_id = auth.uid() ));

alter table product_options enable row level security;
create policy "Vendors can view their own product_options." on product_options for select using (EXISTS (SELECT 1 FROM products WHERE products.product_id = product_options.product_id AND products.vendor_id = auth.uid()));
create policy "Vendors can insert their own product_options." on product_options for insert with check (EXISTS (SELECT 1 FROM products WHERE products.product_id = product_options.product_id AND products.vendor_id = auth.uid()));
create policy "Vendors can update their own product_options." on product_options for update using (EXISTS (SELECT 1 FROM products WHERE products.product_id = product_options.product_id AND products.vendor_id = auth.uid()));
create policy "Vendors can delete their own product_options." on product_options for delete using (EXISTS (SELECT 1 FROM products WHERE products.product_id = product_options.product_id AND products.vendor_id = auth.uid()));

alter table product_option_values enable row level security;
create policy "Vendors can view their own product_option_values." on product_option_values for select using (EXISTS (SELECT 1 FROM product_options po JOIN products p ON po.product_id = p.product_id WHERE po.option_id = product_option_values.option_id AND p.vendor_id = auth.uid()));
create policy "Vendors can insert their own product_option_values." on product_option_values for insert with check (EXISTS (SELECT 1 FROM product_options po JOIN products p ON po.product_id = p.product_id WHERE po.option_id = product_option_values.option_id AND p.vendor_id = auth.uid()));
create policy "Vendors can update their own product_option_values." on product_option_values for update using (EXISTS (SELECT 1 FROM product_options po JOIN products p ON po.product_id = p.product_id WHERE po.option_id = product_option_values.option_id AND p.vendor_id = auth.uid()));
create policy "Vendors can delete their own product_option_values." on product_option_values for delete using (EXISTS (SELECT 1 FROM product_options po JOIN products p ON po.product_id = p.product_id WHERE po.option_id = product_option_values.option_id AND p.vendor_id = auth.uid()));

alter table variant_to_option_values enable row level security;
create policy "Vendors can view their own variant_to_option_values." on variant_to_option_values for select using (EXISTS (SELECT 1 FROM product_variants pv JOIN products p ON pv.product_id = p.product_id WHERE pv.variant_id = variant_to_option_values.variant_id AND p.vendor_id = auth.uid()));
create policy "Vendors can insert their own variant_to_option_values." on variant_to_option_values for insert with check (EXISTS (SELECT 1 FROM product_variants pv JOIN products p ON pv.product_id = p.product_id WHERE pv.variant_id = variant_to_option_values.variant_id AND p.vendor_id = auth.uid()));
create policy "Vendors can update their own variant_to_option_values." on variant_to_option_values for update using (EXISTS (SELECT 1 FROM product_variants pv JOIN products p ON pv.product_id = p.product_id WHERE pv.variant_id = variant_to_option_values.variant_id AND p.vendor_id = auth.uid()));
create policy "Vendors can delete their own variant_to_option_values." on variant_to_option_values for delete using (EXISTS (SELECT 1 FROM product_variants pv JOIN products p ON pv.product_id = p.product_id WHERE pv.variant_id = variant_to_option_values.variant_id AND p.vendor_id = auth.uid()));

alter table featured_products enable row level security;
create policy "Vendors can view their own featured_products." on featured_products for select using (EXISTS ( SELECT 1 FROM products WHERE products.product_id = featured_products.product_id AND products.vendor_id = auth.uid() ));
create policy "Vendors can insert their own featured_products." on featured_products for insert with check (EXISTS ( SELECT 1 FROM products WHERE products.product_id = featured_products.product_id AND products.vendor_id = auth.uid() ));
create policy "Vendors can update their own featured_products." on featured_products for update using (EXISTS ( SELECT 1 FROM products WHERE products.product_id = featured_products.product_id AND products.vendor_id = auth.uid() ));
create policy "Vendors can delete their own featured_products." on featured_products for delete using (EXISTS ( SELECT 1 FROM products WHERE products.product_id = featured_products.product_id AND products.vendor_id = auth.uid() ));

alter table orders enable row level security;
create policy "Users can view their own orders." on orders for select using (auth.uid() = customer_id);
create policy "Users can insert their own orders." on orders for insert with check (auth.uid() = customer_id);
create policy "Users can update their own orders." on orders for update using (auth.uid() = customer_id);
create policy "Users can delete their own orders." on orders for delete using (auth.uid() = customer_id);

alter table order_items enable row level security;
create policy "Users can view their own order_items." on order_items for select using (EXISTS ( SELECT 1 FROM orders WHERE orders.order_id = order_items.order_id AND orders.customer_id = auth.uid() ));
create policy "Users can insert their own order_items." on order_items for insert with check (EXISTS ( SELECT 1 FROM orders WHERE orders.order_id = order_items.order_id AND orders.customer_id = auth.uid() ));
create policy "Users can update their own order_items." on order_items for update using (EXISTS ( SELECT 1 FROM orders WHERE orders.order_id = order_items.order_id AND orders.customer_id = auth.uid() ));
create policy "Users can delete their own order_items." on order_items for delete using (EXISTS ( SELECT 1 FROM orders WHERE orders.order_id = order_items.order_id AND orders.customer_id = auth.uid() ));

alter table product_media enable row level security;
create policy "Vendors can view their own product_media." on product_media for select using (EXISTS ( SELECT 1 FROM products WHERE products.product_id = product_media.product_id AND products.vendor_id = auth.uid() ));
create policy "Vendors can insert their own product_media." on product_media for insert with check (EXISTS ( SELECT 1 FROM products WHERE products.product_id = product_media.product_id AND products.vendor_id = auth.uid() ));
create policy "Vendors can update their own product_media." on product_media for update using (EXISTS ( SELECT 1 FROM products WHERE products.product_id = product_media.product_id AND products.vendor_id = auth.uid() ));
create policy "Vendors can delete their own product_media." on product_media for delete using (EXISTS ( SELECT 1 FROM products WHERE products.product_id = product_media.product_id AND products.vendor_id = auth.uid() ));

alter table shopping_cart enable row level security;
create policy "Users can view their own shopping_cart." on shopping_cart for select using (auth.uid() = customer_id);
create policy "Users can insert their own shopping_cart." on shopping_cart for insert with check (auth.uid() = customer_id);
create policy "Users can update their own shopping_cart." on shopping_cart for update using (auth.uid() = customer_id);
create policy "Users can delete their own shopping_cart." on shopping_cart for delete using (auth.uid() = customer_id);

alter table shopping_cart_item enable row level security;
create policy "Users can view their own shopping_cart_item." on shopping_cart_item for select using (EXISTS ( SELECT 1 FROM shopping_cart WHERE shopping_cart.cart_id = shopping_cart_item.cart_id AND shopping_cart.customer_id = auth.uid() ));
create policy "Users can insert their own shopping_cart_item." on shopping_cart_item for insert with check (EXISTS ( SELECT 1 FROM shopping_cart WHERE shopping_cart.cart_id = shopping_cart_item.cart_id AND shopping_cart.customer_id = auth.uid() ));
create policy "Users can update their own shopping_cart_item." on shopping_cart_item for update using (EXISTS ( SELECT 1 FROM shopping_cart WHERE shopping_cart.cart_id = shopping_cart_item.cart_id AND shopping_cart.customer_id = auth.uid() ));
create policy "Users can delete their own shopping_cart_item." on shopping_cart_item for delete using (EXISTS ( SELECT 1 FROM shopping_cart WHERE shopping_cart.cart_id = shopping_cart_item.cart_id AND shopping_cart.customer_id = auth.uid() ));

alter table product_reviews enable row level security;
create policy "Users can view their own product_reviews." on product_reviews for select using (auth.uid() = customer_id);
create policy "Users can insert their own product_reviews." on product_reviews for insert with check (auth.uid() = customer_id);
create policy "Users can update their own product_reviews." on product_reviews for update using (auth.uid() = customer_id);
create policy "Users can delete their own product_reviews." on product_reviews for delete using (auth.uid() = customer_id);

alter table vendor_reviews enable row level security;
create policy "Users can view their own vendor_reviews." on vendor_reviews for select using (auth.uid() = customer_id);
create policy "Users can insert their own vendor_reviews." on vendor_reviews for insert with check (auth.uid() = customer_id);
create policy "Users can update their own vendor_reviews." on vendor_reviews for update using (auth.uid() = customer_id);
create policy "Users can delete their own vendor_reviews." on vendor_reviews for delete using (auth.uid() = customer_id);

alter table customer_reviews enable row level security;
create policy "Vendors can view their own customer_reviews." on customer_reviews for select using (auth.uid() = vendor_id);
create policy "Vendors can insert their own customer_reviews." on customer_reviews for insert with check (auth.uid() = vendor_id);
create policy "Vendors can update their own customer_reviews." on customer_reviews for update using (auth.uid() = vendor_id);
create policy "Vendors can delete their own customer_reviews." on customer_reviews for delete using (auth.uid() = vendor_id);

-- Trigger to call handle_new_user on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger to call handle_update_user on auth.users update
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_update_user();

-- Trigger to call handle_delete_user on auth.users delete
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute procedure public.handle_delete_user();
