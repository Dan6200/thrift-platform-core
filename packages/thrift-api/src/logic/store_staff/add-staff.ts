import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'

export const addStaffLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { storeId } = req.validatedParams!
  const { staff_id, role } = req.validatedBody!

  const [newStaff] = await knex('store_staff')
    .insert({
      store_id: storeId,
      staff_id,
      role,
    })
    .returning('*')

  req.dbResult = newStaff
  next()
}
