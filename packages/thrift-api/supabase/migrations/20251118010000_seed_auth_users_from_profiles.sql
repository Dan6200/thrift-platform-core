-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Seeding auth.users from existing public.profiles
-- This ensures that for every profile, there is a login capability.

DO $$
DECLARE
    r RECORD;
    default_password text := 'password123'; -- CHANGE THIS IF YOU WANT A DIFFERENT DEFAULT
    existing_auth_user_id uuid;
    existing_auth_user_email text;
BEGIN
    -- Iterate over profiles that have an email
    FOR r IN SELECT * FROM public.profiles WHERE email IS NOT NULL
    LOOP
        -- Check if a user with this ID already exists
        SELECT id, email INTO existing_auth_user_id, existing_auth_user_email FROM auth.users WHERE id = r.id;

        IF existing_auth_user_id IS NOT NULL THEN
            -- User with this ID already exists in auth.users
            IF existing_auth_user_email IS DISTINCT FROM r.email THEN
                RAISE WARNING 'Auth user ID % already exists, but with a different email (%). Skipping profile % with email % to avoid conflict.',
                              r.id, existing_auth_user_email, r.id, r.email;
            ELSE
                RAISE NOTICE 'Auth user already exists for % (ID: %)', r.email, r.id;
            END IF;
            CONTINUE; -- Skip to next profile
        END IF;

        -- Check if a user with this email already exists (but with a different ID, handled above)
        IF EXISTS (SELECT 1 FROM auth.users WHERE email = r.email) THEN -- Removed AND id IS DISTINCT FROM r.id as it's handled by first IF
            RAISE WARNING 'Auth user with email % already exists. Skipping profile % to avoid unique constraint violation.',
                          r.email, r.id;
            CONTINUE; -- Skip to next profile
        END IF;

        -- If neither ID nor email conflicts, proceed with insert
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at,
            is_super_admin
        )
        VALUES (
            '00000000-0000-0000-0000-000000000000', -- Standard Supabase UUID
            r.id,
            'authenticated',
            'authenticated',
            r.email,
            crypt(default_password, gen_salt('bf')), -- Securely hash the password
            now(), -- Mark email as confirmed
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            jsonb_build_object(
                'first_name', r.first_name,
                'last_name', r.last_name,
                'phone', r.phone, -- Include phone in metadata
                'dob', r.dob,     -- Include DOB in metadata
                'country', r.country,
                'is_customer', r.is_customer,
                'is_vendor', r.is_vendor
            ),
            now(),
            now(),
            r.phone,
            now(), -- Mark phone as confirmed
            false
        );

        RAISE NOTICE 'Created auth user for % (ID: %)', r.email, r.id;
    END LOOP;
END $$;