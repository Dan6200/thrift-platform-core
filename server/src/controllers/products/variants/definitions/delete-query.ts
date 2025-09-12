import { knex } from '../../../../db/index.js'
import { QueryParams } from '../../../../types/process-routes.js'
import BadRequestError from '../../../../errors/bad-request.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import ForbiddenError from '#src/errors/forbidden.js'

export default async ({ params, userId }: QueryParams): Promise<void> => {
    if (!userId) {
        throw new UnauthorizedError('Sign-in to delete a variant.')
    }
    if (!params?.variantId) {
        throw new BadRequestError('Must provide a variant id.')
    }

    const { variantId } = params;

    // Check if the user owns the variant
    const variant = await knex('product_variants as pv')
        .join('products as p', 'pv.product_id', 'p.product_id')
        .where({ 'pv.variant_id': variantId, 'p.vendor_id': userId })
        .first('pv.variant_id');

    if (!variant) {
        throw new ForbiddenError('You do not own this variant.');
    }

    await knex('product_variants').where({ variant_id: variantId }).del();
}
