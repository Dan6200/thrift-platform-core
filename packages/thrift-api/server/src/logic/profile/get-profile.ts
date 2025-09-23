import { knex } from '#src/db/index.js'
import UnauthorizedError from '#src/errors/unauthorized.js'
import { Request, Response, NextFunction } from 'express'

export const getProfileLogic = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.userId) {
    throw new UnauthorizedError('Signin to access user account.')
  }
  const result = await knex('profiles').where({ id: req.userId }).select('*').first()
  req.dbResult = result
  next()
}
