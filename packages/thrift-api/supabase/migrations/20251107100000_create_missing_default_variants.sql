-- 1. Create a default variant and set its initial inventory for any product that doesn't have one.
DO $$
DECLARE
    p_record RECORD;
    v_new_variant_id INT;
BEGIN
    FOR p_record IN
        SELECT p.product_id, p.title, p.list_price, p.net_price FROM public.products p
        LEFT JOIN public.product_variants pv ON p.product_id = pv.product_id
        WHERE pv.variant_id IS NULL
    LOOP
        -- Insert the new variant without the quantity
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        VALUES (
            p_record.product_id,
            regexp_replace(p_record.title, '[^a-zA-Z0-9_]+', '', 'g') || '_DEFAULT_SKU',
            p_record.list_price,
            p_record.net_price
        )
        ON CONFLICT (sku) DO NOTHING
        RETURNING variant_id INTO v_new_variant_id;

        -- If a new variant was actually inserted (i.e., no conflict), set its initial inventory.
        IF v_new_variant_id IS NOT NULL THEN
            INSERT INTO public.inventory (variant_id, quantity_change, reason)
            VALUES (v_new_variant_id, 1, 'initial_stock');
        END IF;
    END LOOP;
END $$;

-- 2. Generate and link media for any variants that are missing it.
DO $$
DECLARE
    v_variant_record RECORD;
    v_media_id INT;
    v_filename TEXT;
    v_filepath TEXT;
    v_options_string TEXT;
    v_desc_string TEXT;
    v_dam_folder_prefix TEXT;
BEGIN
    -- Get the DAM folder prefix from the app_config table
    SELECT config_value INTO v_dam_folder_prefix FROM public.app_config WHERE config_key = 'dam_folder_prefix';

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
        WHERE NOT EXISTS (
            SELECT 1 FROM public.product_media_links pml WHERE pml.variant_id = pv.variant_id
        )
    LOOP
        -- Sanitize title and options for filename
        v_filename := regexp_replace(v_variant_record.title, '[^a-zA-Z0-9_]+', '_', 'g');

        v_options_string := '';
        IF v_variant_record.options IS NOT NULL THEN
            v_options_string := '_' || regexp_replace(v_variant_record.options, '[^a-zA-Z0-9_]+', '_', 'g');
        END IF;

        v_desc_string := v_variant_record.title || ' ' || COALESCE(regexp_replace(v_variant_record.options, '_', ' ', 'g'), '');

        v_filename := v_filename || v_options_string || '.jpg';
        v_filepath := v_dam_folder_prefix || 'products/' || v_filename;

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
