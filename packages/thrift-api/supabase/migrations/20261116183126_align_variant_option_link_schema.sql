-- Align legacy local databases with the deployed schema, which keys variant
-- option links by variant_value_id and derives option_id through the value.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'variant_to_option_values'
      and column_name = 'option_value_id'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'variant_to_option_values'
      and column_name = 'variant_value_id'
  ) then
    alter table public.variant_to_option_values
      drop constraint if exists variant_to_option_values_pkey;
    alter table public.variant_to_option_values
      drop constraint if exists variant_to_option_values_option_id_option_value_id_fkey;
    alter table public.variant_to_option_values
      drop constraint if exists variant_to_option_values_option_id_fkey;
    alter table public.variant_to_option_values
      rename column option_value_id to variant_value_id;
    alter table public.variant_to_option_values
      drop column option_id;
    alter table public.variant_to_option_values
      add constraint variant_to_option_values_pkey
      primary key (variant_id, variant_value_id);
    alter table public.variant_to_option_values
      add constraint variant_to_option_values_variant_value_id_fkey
      foreign key (variant_value_id)
      references public.product_option_values(option_value_id)
      on delete cascade;
  end if;
end;
$$;

update public.variant_to_option_values
set price_modifier = 0
where price_modifier is null;

update public.variant_to_option_values
set modifier_type = 'absolute'::modifier_type
where modifier_type is null;

alter table public.variant_to_option_values
  alter column price_modifier set default 0,
  alter column price_modifier set not null,
  alter column modifier_type set default 'absolute'::modifier_type,
  alter column modifier_type set not null;
