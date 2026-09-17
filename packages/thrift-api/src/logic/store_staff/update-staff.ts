import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'
import NotFoundError from '#src/errors/not-found.js'

export const updateStaffLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { storeId, staffId } = req.validatedParams!
  const { role } = req.validatedBody!

  const [updatedStaff] = await knex('store_staff')
    .where({ store_id: storeId, staff_id: staffId })
    .update({ role })
    .returning('*')

  if (!updatedStaff) {
    throw new NotFoundError('Staff member not found for this store.')
  }

  req.dbResult = updatedStaff
  next()
}
