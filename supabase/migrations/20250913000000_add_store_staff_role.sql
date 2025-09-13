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

-- Policies for store_staff table (only store owner can manage staff)
create policy "Store owners can manage their own staff." on store_staff
  for all using (
    auth.uid() = (select vendor_id from stores where store_id = store_staff.store_id)
  );

-- create a trigger to update the updated_at column for store_staff
create trigger set_timestamp
before update on store_staff
for each row
execute procedure trigger_set_timestamp();
