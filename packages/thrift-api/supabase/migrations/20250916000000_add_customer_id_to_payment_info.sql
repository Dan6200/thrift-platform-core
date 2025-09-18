-- Add customer_id column to payment_info table
alter table payment_info add column customer_id uuid;

-- Add foreign key constraint
alter table payment_info add constraint fk_customer_id
foreign key (customer_id) references profiles(id) on delete cascade;

-- Add unique constraint for customer_id and payment_token
alter table payment_info add constraint unique_customer_payment unique (customer_id, payment_token);

-- Drop existing restrictive RLS policies
drop policy if exists "Payment info are private." on payment_info;
drop policy if exists "Payment info cannot be inserted." on payment_info;
drop policy if exists "Payment info cannot be updated." on payment_info;
drop policy if exists "Payment info cannot be deleted." on payment_info;

-- Add new RLS policies for payment_info
alter table payment_info enable row level security;

create policy "Users can view their own payment info." on payment_info
for select using (auth.uid() = customer_id);

create policy "Users can insert their own payment info." on payment_info
for insert with check (auth.uid() = customer_id);

create policy "Users can update their own payment info." on payment_info
for update using (auth.uid() = customer_id);

create policy "Users can delete their own payment info." on payment_info
for delete using (auth.uid() = customer_id);
