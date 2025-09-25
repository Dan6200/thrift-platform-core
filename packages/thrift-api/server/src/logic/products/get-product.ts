import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'
import BadRequestError from '#src/errors/bad-request.js'

export const getProductLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.validatedParams?.productId)
    throw new BadRequestError('Must provide a product id as a parameter')
  const { productId } = req.validatedParams
  const { userId, storeId } = req.validatedQueryParams || {}
  let sqlParams: (string | undefined)[] = [productId]
  let whereClause = ' WHERE p.product_id=$1 '
  let paramIndex = 2

  if (userId && storeId) {
    whereClause += `AND p.vendor_id=$${paramIndex} AND p.store_id=$${paramIndex + 1}`
    sqlParams.push(userId, storeId)
  } else if (userId) {
    whereClause += `AND p.vendor_id=$${paramIndex}`
    sqlParams.push(userId)
  } else if (storeId) {
    whereClause += `AND p.store_id=$${paramIndex}`
    sqlParams.push(storeId)
  }

  const dbQueryString = `SELECT
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
    s.subcategory_name`

  const result = await knex.raw(dbQueryString, sqlParams)
  req.dbResult = result.rows[0]
  next()
}