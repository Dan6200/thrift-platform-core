import { knex } from '#src/db/index.js'
import { Request, Response, NextFunction } from 'express'

export const listStaffLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const { storeId } = req.validatedParams!

  const staffList = await knex('store_staff')
    .where({ store_id: storeId })
    .select('*')

  req.dbResult = staffList
  next()
}
