import { knex } from '#src/db/index.js'
import UnauthenticatedError from '#src/errors/unauthenticated.js'
import { Request, Response, NextFunction } from 'express'

export const getProfileLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId) {
    throw new UnauthenticatedError('Signin to access user account.')
  }
  const result = await knex('profiles')
    .where({ id: req.userId })
    .select('*')
    .first()
  req.dbResult = result
  next()
}
