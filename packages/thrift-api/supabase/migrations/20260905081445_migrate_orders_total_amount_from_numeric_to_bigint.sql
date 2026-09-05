-- 2. Convert total_amount from NUMERIC decimal to BIGINT subunits (multiplies by 100)
alter table public.orders 
alter column total_amount type bigint 
using round(total_amount * 100)::bigint;
