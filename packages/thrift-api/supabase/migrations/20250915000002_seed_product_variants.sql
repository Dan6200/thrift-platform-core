-- Seed product_variants with a default variant for each product
insert into public.product_variants (product_id, sku, list_price, net_price)
select
  p.product_id,
  'SKU-' || p.product_id,
  p.list_price,
  p.net_price
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
    'Men''s Polo Shirt',
    'Laptop Pro X',
    'Smartphone Ultra',
    'Organic Skincare Kit',
    'Gaming PC',
    'Smart Home Hub',
    'Plush Toy Bear',
    'Yoga Mat Eco-Friendly',
    'Smartwatch Series 7'
  );

-- Seed inventory for the default variants
insert into public.inventory (variant_id, quantity_change, reason)
select
  pv.variant_id,
  100, -- Default quantity
  'initial_stock'
from
  public.product_variants pv
  p.title not in (
    'Classic Leather Jacket',
    'Wireless Headphones',
    'Women''s Summer Dress',
    'Men''s Casual Shirt',
    'Running Shoes Men''s',
    'Ankle Boots Women''s',
    'Women''s Denim Jeans',
    'Men''s Polo Shirt',
    'Laptop Pro X',
    'Smartphone Ultra',
    'Organic Skincare Kit',
    'Gaming PC',
    'Smart Home Hub',
    'Plush Toy Bear',
    'Yoga Mat Eco-Friendly',
    'Smartwatch Series 7',
    '4K Smart TV 55"' ,
    'Gaming Mouse RGB',
    'Portable Bluetooth Speaker',
    'Digital Camera DSLR',
    'Robot Vacuum Cleaner',
    'Air Fryer XL',
    'External SSD 1TB',
    'Noise Cancelling Earbuds',
    'Smart Light Bulbs 4-Pack',
    'Children''s Story Book',
    'Sci-Fi Paperback Novel',
    'Board Game Strategy',
    'Building Blocks Set',
    'Classic Literature Collection',
    'Kids'' Backpack Animal Design',
    'Puzzle 1000 Pieces',
    'Vitamin D3 Supplements',
    'All-Purpose Cleaner',
    'PS5 Game - Adventure',
    'Xbox Series X Game - RPG',
    'Sunscreen SPF 50',
    'Hair Dryer Professional',
    'Camping Tent 2-Person',
    'Dumbbell Set Adjustable',
    'Facial Cleansing Brush',
    'PC Gaming Headset',
    'Curved Gaming Monitor',
    'Wireless Keyboard and Mouse Combo',
    'Antivirus Software 1-Year',
    'Operating System Home Edition',
    'Webcam Full HD',
    'Network Router Wi-Fi 6',
    'Laser Printer Wireless'
  );

-- Seed variants for Laser Printer Wireless
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Laser Printer Wireless';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['White', 'Black']) as color;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 10, 'initial_stock');

        -- Link to color value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Network Router Wi-Fi 6
DO $
DECLARE
    v_product_id int;
    v_option_id_speed int;
    speed_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Network Router Wi-Fi 6';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'SPEED') RETURNING option_id INTO v_option_id_speed;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_speed, speed FROM unnest(array['AX1800', 'AX3000', 'AX5400']) as speed;

    -- Create variants and link them
    FOR speed_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_speed
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || speed_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 15, 'initial_stock');

        -- Link to speed value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_speed AND value = speed_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Webcam Full HD
DO $
DECLARE
    v_product_id int;
    v_option_id_resolution int;
    resolution_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Webcam Full HD';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'RESOLUTION') RETURNING option_id INTO v_option_id_resolution;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_resolution, resolution FROM unnest(array['720p', '1080p']) as resolution;

    -- Create variants and link them
    FOR resolution_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_resolution
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || resolution_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 20, 'initial_stock');

        -- Link to resolution value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_resolution AND value = resolution_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Wireless Keyboard and Mouse Combo
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Wireless Keyboard and Mouse Combo';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Black', 'White', 'Silver']) as color;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 20, 'initial_stock');

        -- Link to color value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Curved Gaming Monitor
DO $
DECLARE
    v_product_id int;
    v_option_id_size int;
    v_option_id_refresh_rate int;
    size_value text;
    refresh_rate_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Curved Gaming Monitor';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'SIZE') RETURNING option_id INTO v_option_id_size;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'REFRESH_RATE') RETURNING option_id INTO v_option_id_refresh_rate;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_size, size FROM unnest(array['24 inch', '27 inch', '32 inch']) as size;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_refresh_rate, refresh_rate FROM unnest(array['144Hz', '240Hz']) as refresh_rate;

    -- Create variants and link them
    FOR size_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_size
    LOOP
        FOR refresh_rate_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_refresh_rate
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || refresh_rate_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 10, 'initial_stock');

            -- Link to size value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_size AND value = size_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to refresh_rate value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_refresh_rate AND value = refresh_rate_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $;

-- Seed variants for PC Gaming Headset
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'PC Gaming Headset';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Black', 'Red']) as color;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 20, 'initial_stock');

        -- Link to color value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Facial Cleansing Brush
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Facial Cleansing Brush';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Pink', 'Blue', 'White']) as color;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 20, 'initial_stock');

        -- Link to color value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Dumbbell Set Adjustable
DO $
DECLARE
    v_product_id int;
    v_option_id_weight_range int;
    weight_range_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Dumbbell Set Adjustable';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'WEIGHT_RANGE') RETURNING option_id INTO v_option_id_weight_range;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_weight_range, weight_range FROM unnest(array['5-25 lbs', '5-50 lbs', '10-70 lbs']) as weight_range;

    -- Create variants and link them
    FOR weight_range_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_weight_range
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || weight_range_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 10, 'initial_stock');

        -- Link to weight_range value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_weight_range AND value = weight_range_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Camping Tent 2-Person
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    v_option_id_capacity int;
    color_value text;
    capacity_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Camping Tent 2-Person';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'CAPACITY') RETURNING option_id INTO v_option_id_capacity;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Green', 'Blue', 'Orange']) as color;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_capacity, capacity FROM unnest(array['2-Person', '4-Person']) as capacity;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        FOR capacity_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_capacity
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value || '-' || capacity_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 10, 'initial_stock');

            -- Link to color value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to capacity value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_capacity AND value = capacity_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $;

-- Seed variants for Hair Dryer Professional
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Hair Dryer Professional';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Black', 'White', 'Pink']) as color;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 25, 'initial_stock');

        -- Link to color value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Sunscreen SPF 50
DO $
DECLARE
    v_product_id int;
    v_option_id_volume int;
    volume_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Sunscreen SPF 50';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'VOLUME') RETURNING option_id INTO v_option_id_volume;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_volume, volume FROM unnest(array['50ml', '100ml', '200ml']) as volume;

    -- Create variants and link them
    FOR volume_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_volume
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || volume_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 30, 'initial_stock');

        -- Link to volume value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_volume AND value = volume_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for All-Purpose Cleaner
DO $
DECLARE
    v_product_id int;
    v_option_id_scent int;
    scent_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'All-Purpose Cleaner';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'SCENT') RETURNING option_id INTO v_option_id_scent;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_scent, scent FROM unnest(array['Lemon', 'Lavender', 'Unscented']) as scent;

    -- Create variants and link them
    FOR scent_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_scent
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || scent_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 40, 'initial_stock');

        -- Link to scent value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_scent AND value = scent_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Vitamin D3 Supplements
DO $
DECLARE
    v_product_id int;
    v_option_id_count int;
    count_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Vitamin D3 Supplements';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COUNT') RETURNING option_id INTO v_option_id_count;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_count, count FROM unnest(array['60 Softgels', '120 Softgels', '240 Softgels']) as count;

    -- Create variants and link them
    FOR count_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_count
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || count_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 30, 'initial_stock');

        -- Link to count value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_count AND value = count_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Kids' Backpack Animal Design
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Kids'' Backpack Animal Design';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Blue', 'Pink', 'Green']) as color;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 25, 'initial_stock');

        -- Link to color value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Smart Light Bulbs 4-Pack
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Smart Light Bulbs 4-Pack';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['White', 'Warm White', 'RGB']) as color;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 20, 'initial_stock');

        -- Link to color value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Noise Cancelling Earbuds
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Noise Cancelling Earbuds';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Black', 'White']) as color;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 50, 'initial_stock');

        -- Link to color value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for External SSD 1TB
DO $
DECLARE
    v_product_id int;
    v_option_id_capacity int;
    capacity_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'External SSD 1TB';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'CAPACITY') RETURNING option_id INTO v_option_id_capacity;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_capacity, capacity FROM unnest(array['500GB', '1TB', '2TB']) as capacity;

    -- Create variants and link them
    FOR capacity_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_capacity
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || capacity_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 25, 'initial_stock');

        -- Link to capacity value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_capacity AND value = capacity_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Air Fryer XL
DO $
DECLARE
    v_product_id int;
    v_option_id_capacity int;
    capacity_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Air Fryer XL';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'CAPACITY') RETURNING option_id INTO v_option_id_capacity;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_capacity, capacity FROM unnest(array['4 Quart', '5.8 Quart', '7 Quart']) as capacity;

    -- Create variants and link them
    FOR capacity_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_capacity
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || capacity_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 20, 'initial_stock');

        -- Link to capacity value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_capacity AND value = capacity_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Robot Vacuum Cleaner
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Robot Vacuum Cleaner';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Black', 'White']) as color;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 15, 'initial_stock');

        -- Link to color value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Digital Camera DSLR
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    v_option_id_megapixels int;
    color_value text;
    megapixels_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Digital Camera DSLR';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'MEGAPIXELS') RETURNING option_id INTO v_option_id_megapixels;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Black', 'Silver']) as color;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_megapixels, megapixels FROM unnest(array['20MP', '24MP', '30MP']) as megapixels;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        FOR megapixels_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_megapixels
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value || '-' || megapixels_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 10, 'initial_stock');

            -- Link to color value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to megapixels value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_megapixels AND value = megapixels_value;
            INSERT INTO public.variant_to_option_values (variant_id, v_value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $;

-- Seed variants for Portable Bluetooth Speaker
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Portable Bluetooth Speaker';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Black', 'Blue', 'Red']) as color;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 40, 'initial_stock');

        -- Link to color value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Gaming Mouse RGB
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Gaming Mouse RGB';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Black', 'White', 'Red']) as color;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 30, 'initial_stock');

        -- Link to color value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for 4K Smart TV 55"
DO $
DECLARE
    v_product_id int;
    v_option_id_size int;
    v_option_id_resolution int;
    size_value text;
    resolution_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = '4K Smart TV 55"' ;

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'SIZE') RETURNING option_id INTO v_option_id_size;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'RESOLUTION') RETURNING option_id INTO v_option_id_resolution;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_size, size FROM unnest(array['55"', '65"', '75"']) as size;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_resolution, resolution FROM unnest(array['4K UHD', '8K UHD']) as resolution;

    -- Create variants and link them
    FOR size_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_size
    LOOP
        FOR resolution_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_resolution
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || resolution_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 8, 'initial_stock');

            -- Link to size value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_size AND value = size_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to resolution value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_resolution AND value = resolution_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $;

-- Seed variants for Smartwatch Series 7
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    v_option_id_size int;
    color_value text;
    size_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Smartwatch Series 7';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'SIZE') RETURNING option_id INTO v_option_id_size;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Black', 'Silver', 'Rose Gold']) as color;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_size, size FROM unnest(array['41mm', '45mm']) as size;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        FOR size_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_size
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value || '-' || size_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 10, 'initial_stock');

            -- Link to color value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to size value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_size AND value = size_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $;

-- Seed variants for Yoga Mat Eco-Friendly
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    v_option_id_thickness int;
    color_value text;
    thickness_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Yoga Mat Eco-Friendly';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'THICKNESS') RETURNING option_id INTO v_option_id_thickness;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Blue', 'Green', 'Purple', 'Black']) as color;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_thickness, thickness FROM unnest(array['4mm', '6mm', '8mm']) as thickness;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        FOR thickness_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_thickness
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value || '-' || thickness_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 15, 'initial_stock');

            -- Link to color value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to thickness value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_thickness AND value = thickness_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $;

-- Seed variants for Smart Home Hub
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    color_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Smart Home Hub';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['White', 'Black', 'Grey']) as color;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 20, 'initial_stock');

        -- Link to color value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Gaming PC
DO $
DECLARE
    v_product_id int;
    v_option_id_ram int;
    v_option_id_storage int;
    ram_value text;
    storage_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Gaming PC';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'RAM') RETURNING option_id INTO v_option_id_ram;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'STORAGE') RETURNING option_id INTO v_option_id_storage;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_ram, ram FROM unnest(array['16GB', '32GB', '64GB']) as ram;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_storage, storage FROM unnest(array['512GB SSD', '1TB SSD', '2TB SSD']) as storage;

    -- Create variants and link them
    FOR ram_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_ram
    LOOP
        FOR storage_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_storage
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || ram_value || '-' || storage_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 5, 'initial_stock');

            -- Link to RAM value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_ram AND value = ram_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to storage value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_storage AND value = storage_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $;

-- Seed variants for Organic Skincare Kit
DO $
DECLARE
    v_product_id int;
    v_option_id_volume int;
    volume_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Organic Skincare Kit';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'VOLUME') RETURNING option_id INTO v_option_id_volume;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_volume, volume FROM unnest(array['30ml', '50ml', '100ml']) as volume;

    -- Create variants and link them
    FOR volume_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_volume
    LOOP
        -- Insert variant
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || volume_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 20, 'initial_stock');

        -- Link to volume value
        SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_volume AND value = volume_value;
        INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
    END LOOP;
END $;

-- Seed variants for Smartphone Ultra
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    v_option_id_storage int;
    color_value text;
    storage_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Smartphone Ultra';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'STORAGE') RETURNING option_id INTO v_option_id_storage;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Black', 'White', 'Blue', 'Gold']) as color;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_storage, storage FROM unnest(array['128GB', '256GB', '512GB']) as storage;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        FOR storage_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_storage
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value || '-' || storage_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 15, 'initial_stock');

            -- Link to color value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to storage value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_storage AND value = storage_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $;

-- Seed variants for Laptop Pro X
DO $
DECLARE
    v_product_id int;
    v_option_id_color int;
    v_option_id_storage int;
    color_value text;
    storage_value text;
    v_variant_id int;
    v_value_id int;
BEGIN
    -- Get product_id
    SELECT product_id INTO v_product_id FROM public.products WHERE title = 'Laptop Pro X';

    -- Insert options and get their IDs
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'COLOR') RETURNING option_id INTO v_option_id_color;
    INSERT INTO public.product_options (product_id, option_name) VALUES (v_product_id, 'STORAGE') RETURNING option_id INTO v_option_id_storage;

    -- Insert option values
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_color, color FROM unnest(array['Silver', 'Space Gray', 'Black']) as color;
    INSERT INTO public.product_option_values (option_id, value)
    SELECT v_option_id_storage, storage FROM unnest(array['256GB', '512GB', '1TB']) as storage;

    -- Create variants and link them
    FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
    LOOP
        FOR storage_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_storage
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value || '-' || storage_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 10, 'initial_stock');

            -- Link to color value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to storage value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_storage AND value = storage_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $;

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
    SELECT v_option_id_color, color FROM unnest(array['BLACK', 'BROWN', 'GREY']) as color;

    -- Create variants and link them
    FOR size_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_size
    LOOP
        FOR color_value IN SELECT value FROM public.product_option_values WHERE option_id = v_option_id_color
        LOOP
            -- Insert variant
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || color_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 25, 'initial_stock');

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
        INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
        SELECT v_product_id, 'SKU-' || v_product_id || '-' || color_value, list_price, net_price
        FROM public.products WHERE product_id = v_product_id
        RETURNING variant_id INTO v_variant_id;

        -- Seed inventory
        INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 50, 'initial_stock');

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
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || color_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 30, 'initial_stock');

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
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || color_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 40, 'initial_stock');

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
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || color_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 20, 'initial_stock');

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
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || color_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 15, 'initial_stock');

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
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || color_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 35, 'initial_stock');

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
            INSERT INTO public.product_variants (product_id, sku, list_price, net_price)
            SELECT v_product_id, 'SKU-' || v_product_id || '-' || size_value || '-' || color_value, list_price, net_price
            FROM public.products WHERE product_id = v_product_id
            RETURNING variant_id INTO v_variant_id;

            -- Seed inventory
            INSERT INTO public.inventory (variant_id, quantity_change, reason) VALUES (v_variant_id, 50, 'initial_stock');

            -- Link to size value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_size AND value = size_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);

            -- Link to color value
            SELECT value_id INTO v_value_id FROM public.product_option_values WHERE option_id = v_option_id_color AND value = color_value;
            INSERT INTO public.variant_to_option_values (variant_id, value_id) VALUES (v_variant_id, v_value_id);
        END LOOP;
    END LOOP;
END $$;
