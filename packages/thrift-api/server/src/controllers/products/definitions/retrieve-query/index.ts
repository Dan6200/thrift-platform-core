import { QueryResult, QueryResultRow } from 'pg'
import { pg } from '../../../../db/index.js'
import BadRequestError from '../../../../errors/bad-request.js'
import { QueryParams } from '../../../../types/process-routes.js'

/**
 * @param {QueryParams} { params, query }
 * @returns {Promise<QueryResult<QueryResultRow>>}
 * @description Retrieve a product
 **/
export default async ({ 
  params, 
  query, 
}: QueryParams): Promise<QueryResult<QueryResultRow>> => {
  if (!params?.productId)
    throw new BadRequestError('Must provide a product id as a parameter')
  const { productId } = params
  const { userId, storeId } = query
  let sqlParams: (string | undefined)[] = [productId]
  let whereClause = ' WHERE p.product_id=$1 '
  let paramIndex = 2

  if (userId && storeId) {
    whereClause += `AND p.vendor_id=$${paramIndex} AND p.store_id=$${paramIndex + 1}`
    sqlParams.push(<string>userId, <string>storeId)
  } else if (userId) {
    whereClause += `AND p.vendor_id=$${paramIndex}`
    sqlParams.push(<string>userId)
  } else if (storeId) {
    whereClause += `AND p.store_id=$${paramIndex}`
    sqlParams.push(<string>storeId)
  }
  return pg.query(
    `SELECT
    p.*,
    c.category_name,
    s.subcategory_name,
    (
        SELECT json_agg(media_data)
        FROM (
            SELECT
                m.*,
                pml.is_display_image,
                pml.is_thumbnail_image
            FROM product_variants pv
            JOIN product_media_links pml ON pv.variant_id = pml.variant_id
            JOIN media m ON pml.media_id = m.media_id
            WHERE pv.product_id = p.product_id
        ) AS media_data
    ) AS media,
    (
        SELECT json_agg(variant_data)
        FROM (
            SELECT
                pv.variant_id,
                pv.sku,
                pv.list_price,
                pv.net_price,
                pvi.quantity_available,
                (
                    SELECT COALESCE(json_agg(option_data), '[]'::json)
                    FROM (
                        SELECT
                            po.option_id,
                            po.option_name,
                            pov.value_id,
                            pov.value
                        FROM variant_to_option_values vtov
                        JOIN product_option_values pov ON vtov.value_id = pov.value_id
                        JOIN product_options po ON pov.option_id = po.option_id
                        WHERE vtov.variant_id = pv.variant_id
                    ) AS option_data
                ) AS options
            FROM product_variants pv
            LEFT JOIN product_variant_inventory pvi ON pv.variant_id = pvi.variant_id
            WHERE pv.product_id = p.product_id
        ) AS variant_data
    ) AS variants,
    COALESCE(AVG(pr.rating), 0)::numeric(3,2) AS average_rating,
    COALESCE(COUNT(pr.rating), 0)::int AS review_count,
    COALESCE(SUM(oi.quantity), 0)::int AS products_sold
FROM
    products p
JOIN categories c USING (category_id)
JOIN subcategories s USING (subcategory_id)
LEFT JOIN product_variants pv ON p.product_id = pv.product_id
LEFT JOIN order_items oi ON pv.variant_id = oi.variant_id
LEFT JOIN product_reviews pr ON oi.order_item_id = pr.order_item_id
${whereClause}
GROUP BY
    p.product_id,
    c.category_name,
    s.subcategory_name`,
    sqlParams,
  )
}