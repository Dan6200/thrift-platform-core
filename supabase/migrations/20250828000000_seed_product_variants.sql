-- Seed product_variants with a default variant for each product
insert into public.product_variants (product_id, sku, list_price, net_price, quantity_available)
select
  p.product_id,
  'SKU-' || p.product_id,
  p.list_price,
  p.net_price,
  100 -- Default quantity
from
  public.products p
where
  p.title not in (
    'Classic Leather Jacket',
    'Wireless Headphones',
    'Women''s Summer Dress',
    'Men''s Casual Shirt',
    'Running Shoes Men''s',
    'Ankle Boots Women''s',
    'Women''s Denim Jeans',
    'Men''s Polo Shirt'
  );

-- Seed variants for Classic Leather Jacket
DO $$
DECLARE
    v_product_id int;
    v_option_id_size int;
    v_option_id_color int;
    size_value text;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Classic Leather Jacket';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'SIZE') RETURNING option_id INTO v_option_id_size;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_size, size FROM unnest(array['S', 'M', 'L', 'XL']) as size;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['BLACK', 'BROWN']) as color;

    -- Create variants and link them
    FOR size_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_size
    LOOP
        FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price, quantity_available)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || color_value, list_price, net_price, 25
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Link to size value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_size AND value = size_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to color value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $$;

-- Seed variants for Wireless Headphones
DO $$
DECLARE
    v_product_id int;
    v_option_id_color int;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Wireless Headphones';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['BLACK', 'WHITE', 'BLUE']) as color;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price, quantity_available)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value, list_price, net_price, 50
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Link to color value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $$;

-- Seed variants for Women's Summer Dress
DO $$
DECLARE
    v_product_id int;
    v_option_id_size int;
    v_option_id_color int;
    size_value text;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Women''s Summer Dress';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'SIZE') RETURNING option_id INTO v_option_id_size;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_size, size FROM unnest(array['S', 'M', 'L', 'XL']) as size;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['RED', 'BLUE', 'GREEN']) as color;

    -- Create variants and link them
    FOR size_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_size
    LOOP
        FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price, quantity_available)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || color_value, list_price, net_price, 30
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Link to size value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_size AND value = size_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to color value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $$;

-- Seed variants for Men's Casual Shirt
DO $$
DECLARE
    v_product_id int;
    v_option_id_size int;
    v_option_id_color int;
    size_value text;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Men''s Casual Shirt';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'SIZE') RETURNING option_id INTO v_option_id_size;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_size, size FROM unnest(array['S', 'M', 'L', 'XL']) as size;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['WHITE', 'BLUE', 'BLACK']) as color;

    -- Create variants and link them
    FOR size_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_size
    LOOP
        FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price, quantity_available)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || color_value, list_price, net_price, 40
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Link to size value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_size AND value = size_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to color value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $$;

-- Seed variants for Running Shoes Men's
DO $$
DECLARE
    v_product_id int;
    v_option_id_size int;
    v_option_id_color int;
    size_value text;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Running Shoes Men''s';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'SIZE') RETURNING option_id INTO v_option_id_size;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_size, size FROM unnest(array['8', '9', '10', '11', '12']) as size;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['BLACK', 'WHITE', 'RED']) as color;

    -- Create variants and link them
    FOR size_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_size
    LOOP
        FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price, quantity_available)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || color_value, list_price, net_price, 20
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Link to size value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_size AND value = size_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to color value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $$;

-- Seed variants for Ankle Boots Women's
DO $$
DECLARE
    v_product_id int;
    v_option_id_size int;
    v_option_id_color int;
    size_value text;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Ankle Boots Women''s';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'SIZE') RETURNING option_id INTO v_option_id_size;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_size, size FROM unnest(array['6', '7', '8', '9']) as size;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['BLACK', 'BROWN']) as color;

    -- Create variants and link them
    FOR size_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_size
    LOOP
        FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price, quantity_available)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || color_value, list_price, net_price, 15
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Link to size value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_size AND value = size_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to color value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $$;

-- Seed variants for Women's Denim Jeans
DO $$
DECLARE
    v_product_id int;
    v_option_id_size int;
    v_option_id_color int;
    size_value text;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Women''s Denim Jeans';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'SIZE') RETURNING option_id INTO v_option_id_size;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_size, size FROM unnest(array['26', '28', '30', '32']) as size;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['BLUE', 'BLACK']) as color;

    -- Create variants and link them
    FOR size_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_size
    LOOP
        FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price, quantity_available)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || color_value, list_price, net_price, 35
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Link to size value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_size AND value = size_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to color value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $$;

-- Seed variants for Men's Polo Shirt
DO $$
DECLARE
    v_product_id int;
    v_option_id_size int;
    v_option_id_color int;
    size_value text;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Men''s Polo Shirt';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'SIZE') RETURNING option_id INTO v_option_id_size;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_size, size FROM unnest(array['S', 'M', 'L', 'XL']) as size;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['RED', 'WHITE', 'NAVY']) as color;

    -- Create variants and link them
    FOR size_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_size
    LOOP
        FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price, quantity_available)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || color_value, list_price, net_price, 50
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Link to size value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_size AND value = size_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to color value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $$;