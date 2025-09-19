create table if not exists media (
  media_id          serial        primary key,
  filename          varchar       not null unique,
  filepath          varchar       not null,
  filetype          varchar(50)   not null, -- e.g., 'image/jpeg', 'video/mp4'
  description       text,
  uploader_id       uuid          not null references profiles(id) on delete cascade,
  created_at        timestamptz   not null default now(),
  updated_at        timestamptz   not null default now(),
  check (filetype in ('image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'video/webp', 'image/webp', 'video/mkv'))
);

create trigger set_timestamp
before update on media
for each row
execute procedure trigger_set_timestamp();

create table if not exists profile_media (
  profile_id        uuid          primary key references profiles(id) on delete cascade,
  media_id          int           not null unique references media(media_id) on delete cascade
);

create table if not exists product_media_links (
  variant_id        int           not null references product_variants(variant_id) on delete cascade,
  media_id          int           not null references media(media_id) on delete cascade,
  is_display_image  boolean       default false,
  is_landing_image  boolean       default false,
  primary key (variant_id, media_id),
  check (not (is_display_image = true and (select filetype from media where media_id = product_media_links.media_id) not in ('image/jpeg', 'image/png'))),
  check (not (is_landing_image = true and (select filetype from media where media_id = product_media_links.media_id) not in ('image/jpeg', 'image/png')))
);

alter table product_media_links enable row level security;
create policy "Vendors can view their own product media links." on product_media_links for select using (EXISTS ( SELECT 1 FROM products p JOIN product_variants pv ON p.product_id = pv.product_id WHERE pv.variant_id = product_media_links.variant_id AND p.vendor_id = auth.uid() ));
create policy "Vendors can insert their own product media links." on product_media_links for insert with check (EXISTS ( SELECT 1 FROM products p JOIN product_variants pv ON p.product_id = pv.product_id WHERE pv.variant_id = product_media_links.variant_id AND p.vendor_id = auth.uid() ));
create policy "Vendors can update their own product media links." on product_media_links for update using (EXISTS ( SELECT 1 FROM products p JOIN product_variants pv ON p.product_id = pv.product_id WHERE pv.variant_id = product_media_links.variant_id AND p.vendor_id = auth.uid() ));
create policy "Vendors can delete their own product media links." on product_media_links for delete using (EXISTS ( SELECT 1 FROM products p JOIN product_variants pv ON p.product_id = pv.product_id WHERE pv.variant_id = product_media_links.variant_id AND p.vendor_id = auth.uid() ));
alter table media enable row level security;
create policy "Users can view all media." on media for select using (true);
create policy "Authenticated users can insert media." on media for insert with check (auth.uid() = uploader_id);
create policy "Users can update their own media." on media for update using (auth.uid() = uploader_id);
create policy "Users can delete their own media." on media for delete using (auth.uid() = uploader_id);

alter table profile_media enable row level security;
create policy "Users can view their own profile media." on profile_media for select using (auth.uid() = profile_id);
create policy "Authenticated users can insert their own profile media." on profile_media for insert with check (auth.uid() = profile_id);
create policy "Users can update their own profile media." on profile_media for update using (auth.uid() = profile_id);
create policy "Users can delete their own profile media." on profile_media for delete using (auth.uid() = profile_id);

-- Insert into media and product_media_links for each variant
DO $
DECLARE
    v_variant_record RECORD;
    v_media_id INT;
    v_filename TEXT;
    v_filepath TEXT;
    v_options_string TEXT;
BEGIN
    FOR v_variant_record IN
        SELECT
            pv.variant_id,
            p.title,
            p.vendor_id,
            (
                SELECT STRING_AGG(pov.value, '_' ORDER BY po.option_name)
                FROM public.variant_to_option_values vtov
                JOIN public.product_option_values pov ON vtov.value_id = pov.value_id
                JOIN public.product_options po ON pov.option_id = po.option_id
                WHERE vtov.variant_id = pv.variant_id
            ) as options
        FROM
            public.product_variants pv
        JOIN
            public.products p ON pv.product_id = p.product_id
    LOOP
        -- Sanitize title and options for filename
        v_filename := regexp_replace(v_variant_record.title, '[^a-zA-Z0-9_]+', '_', 'g');
        
        v_options_string := '';
        IF v_variant_record.options IS NOT NULL THEN
            v_options_string := '_' || regexp_replace(v_variant_record.options, '[^a-zA-Z0-9_]+', '_', 'g');
        END IF;

        v_filename := v_filename || v_options_string || '.jpg';
        v_filepath := 'sellit-media/' || v_filename;

        -- Insert into media table
        INSERT INTO public.media (filename, filepath, filetype, description, uploader_id)
        VALUES (v_filename, v_filepath, 'image/jpeg', v_variant_record.title, v_variant_record.vendor_id)
        ON CONFLICT (filename) DO UPDATE SET updated_at = NOW()
        RETURNING media_id INTO v_media_id;

        -- Link media to the product variant
        INSERT INTO public.product_media_links (variant_id, media_id, is_display_image, is_landing_image)
        VALUES (v_variant_record.variant_id, v_media_id, true, false)
        ON CONFLICT (variant_id, media_id) DO NOTHING;

    END LOOP;
END $;
