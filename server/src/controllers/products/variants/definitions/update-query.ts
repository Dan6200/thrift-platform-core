import { knex } from '../../../../db/index.js'
import { QueryParams } from '../../../../types/process-routes.js'
import { isValidVariantUpdateRequestData, VariantResponseData } from '../../../../types/products/variants.js'
import BadRequestError from '../../../../errors/bad-request.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import ForbiddenError from '#src/errors/forbidden.js'

export default async ({ params, body, userId }: QueryParams): Promise<VariantResponseData[]> => {
    if (!userId) {
        throw new UnauthorizedError('Sign-in to update a variant.')
    }
    if (!params?.variantId) {
        throw new BadRequestError('Must provide a variant id.')
    }
    if (!isValidVariantUpdateRequestData(body)) {
        throw new BadRequestError('Invalid variant data.')
    }

    const { variantId } = params;
    const variantData = body;

    // Check if the user owns the variant
    const variant = await knex('product_variants as pv')
        .join('products as p', 'pv.product_id', 'p.product_id')
        .where({ 'pv.variant_id': variantId, 'p.vendor_id': userId })
        .first('pv.variant_id');

    if (!variant) {
        throw new ForbiddenError('You do not own this variant.');
    }

    const [updatedVariant] = await knex('product_variants')
        .where({ variant_id: variantId })
        .update(variantData)
        .returning('*');

    // Fetch the full variant details for the response
    const options = await knex('variant_to_option_values as vtov')
        .join('product_option_values as pov', 'vtov.value_id', 'pov.value_id')
        .join('product_options as po', 'pov.option_id', 'po.option_id')
        .where('vtov.variant_id', updatedVariant.variant_id)
        .select('po.option_id', 'po.option_name', 'pov.value_id', 'pov.value');

    return [{ ...updatedVariant, options }];
}
