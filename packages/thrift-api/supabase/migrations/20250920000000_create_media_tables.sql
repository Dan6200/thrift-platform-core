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
  is_display_image  boolean       default true,
  is_thumbnail_image  boolean       default true,
  primary key (variant_id, media_id)
);

CREATE OR REPLACE FUNCTION check_product_media_links_filetype()
RETURNS TRIGGER AS $$
DECLARE
    v_filetype TEXT;
BEGIN
    SELECT filetype INTO v_filetype FROM public.media WHERE media_id = NEW.media_id;
    IF (NEW.is_display_image = true OR NEW.is_thumbnail_image = true) AND v_filetype NOT IN ('image/jpeg', 'image/png', 'image/jpg', 'image/webp') THEN
        RAISE EXCEPTION 'Display and thumbnail images must be of type image/jpeg, image/png, image/jpg, or image/webp. Attempted to use filetype: %', v_filetype;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_product_media_links_filetype
BEFORE INSERT OR UPDATE ON public.product_media_links
FOR EACH ROW
EXECUTE FUNCTION check_product_media_links_filetype();

CREATE OR REPLACE FUNCTION enforce_single_special_image()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_display_image = true THEN
        UPDATE public.product_media_links
        SET is_display_image = false
        WHERE variant_id = NEW.variant_id
          AND media_id != NEW.media_id;
    END IF;

    IF NEW.is_thumbnail_image = true THEN
        UPDATE public.product_media_links
        SET is_thumbnail_image = false
        WHERE variant_id = NEW.variant_id
          AND media_id != NEW.media_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_single_special_image
AFTER INSERT OR UPDATE ON public.product_media_links
FOR EACH ROW
EXECUTE FUNCTION enforce_single_special_image();

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
DO $$
DECLARE
    v_variant_record RECORD;
    v_media_id INT;
    v_filename TEXT;
    v_filepath TEXT;
    v_options_string TEXT;
		v_desc_string TEXT;
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

				v_desc_string := v_variant_record.title || ' ' || regexp_replace(v_variant_record.options, '_', ' ');

        v_filename := v_filename || v_options_string || '.jpg';
        v_filepath := 'sellit-media/' || v_filename;

        -- Insert into media table
        INSERT INTO public.media (filename, filepath, filetype, description, uploader_id)
        VALUES (v_filename, v_filepath, 'image/jpeg', v_desc_string, v_variant_record.vendor_id)
        ON CONFLICT (filename) DO UPDATE SET updated_at = NOW()
        RETURNING media_id INTO v_media_id;

        -- Link media to the product variant
        INSERT INTO public.product_media_links (variant_id, media_id, is_display_image, is_thumbnail_image)
        VALUES (v_variant_record.variant_id, v_media_id, true, false)
        ON CONFLICT (variant_id, media_id) DO NOTHING;

    END LOOP;
END $$;
