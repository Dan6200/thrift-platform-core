WITH media_descriptions AS (
    SELECT
        m.media_id,
        array_to_string(p.description, ' ') || COALESCE(' - ' || string_agg(po.option_name || ': ' || pov.value, ', '), '') AS new_description
    FROM
        media m
    JOIN
        product_media_links pml ON m.media_id = pml.media_id
    JOIN
        product_variants pv ON pml.variant_id = pv.variant_id
    JOIN
        products p ON pv.product_id = p.product_id
    LEFT JOIN
        variant_to_option_values vtov ON pv.variant_id = vtov.variant_id
    LEFT JOIN
        product_option_values pov ON vtov.value_id = pov.value_id
    LEFT JOIN
        product_options po ON pov.option_id = po.option_id
    GROUP BY
        m.media_id, p.description
)
UPDATE
    media
SET
    description = media_descriptions.new_description
FROM
    media_descriptions
WHERE
    media.media_id = media_descriptions.media_id;