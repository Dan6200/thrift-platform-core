-- Migration to update public.handle_new_user function to handle conflicts safely
-- This prevents "not-null constraint" violations by checking existence before inserting.

-- Drop the existing trigger function
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;

-- Recreate the function
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Check if the profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = new.id) THEN
    -- Update existing profile, merging new data (only if provided)
    -- We use COALESCE to keep existing values if new metadata is null
    UPDATE public.profiles
    SET
      first_name = COALESCE(new.raw_user_meta_data->>'first_name', first_name),
      last_name = COALESCE(new.raw_user_meta_data->>'last_name', last_name),
      email = COALESCE(new.email, email),
      phone = COALESCE(new.phone, phone),
      -- Only update DOB if provided in metadata, otherwise keep existing
      dob = COALESCE((new.raw_user_meta_data->>'dob')::date, dob),
      country = COALESCE(new.raw_user_meta_data->>'country', country),
      is_customer = COALESCE((new.raw_user_meta_data->>'is_customer')::boolean, is_customer),
      is_vendor = COALESCE((new.raw_user_meta_data->>'is_vendor')::boolean, is_vendor),
      updated_at = now()
    WHERE id = new.id;
  ELSE
    -- Insert new profile
    -- Note: This will still fail if required fields (like DOB) are missing in metadata, which is expected for new users
    INSERT INTO public.profiles (id, first_name, last_name, email, phone, dob, country, is_customer, is_vendor)
    VALUES (
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
  END IF;
  return new;
end;
$$ language plpgsql security definer;

-- Ensure the trigger exists
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
    END IF;
END $$;
