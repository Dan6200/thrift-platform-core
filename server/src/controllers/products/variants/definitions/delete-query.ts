import { knex } from '../../../../db/index.js'
import { QueryParams } from '../../../../types/process-routes.js'
import BadRequestError from '../../../../errors/bad-request.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import ForbiddenError from '#src/errors/forbidden.js'
import NotFoundError from '#src/errors/not-found.js'

export default async ({ params, userId }: QueryParams): Promise<void> => {
    if (!userId) {
        throw new UnauthorizedError('Sign-in to delete a variant.')
    }
    if (!params?.variantId) {
        throw new BadRequestError('Must provide a variant id.')
    }

    const { variantId } = params;

    const variant = await knex('product_variants as pv')
        .join('products as p', 'pv.product_id', 'p.product_id')
        .where({ 'pv.variant_id': variantId })
        .first('p.store_id');

    if (!variant) {
        throw new NotFoundError('Variant not found.');
    }

    const hasAccess = await knex.raw('select has_store_access(?, ?, ?)', [userId, variant.store_id, ['admin']]);
    if (!hasAccess.rows[0].has_store_access) {
      throw new ForbiddenError('You do not have permission to delete this variant.');
    }

    await knex('product_variants').where({ variant_id: variantId }).del();
}
