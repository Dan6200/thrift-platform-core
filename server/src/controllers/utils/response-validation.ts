import { ArraySchema, ObjectSchema } from 'joi'
import { QueryResult, QueryResultRow } from 'pg'
import NotFoundError from '../../errors/not-found.js'
import { isTypeQueryResultRow } from '../../types/response.js'
import InternalServerError from '#src/errors/internal-server.js'

/**
 * @description Validates DB result against schema
 * */
export function validateResData<T>(
  schema: ArraySchema<T>,
): (result: QueryResult<QueryResultRow> | any[]) => boolean
export function validateResData<T>(
  schema: ObjectSchema<T>,
): (result: QueryResult<QueryResultRow> | any[]) => boolean
export function validateResData<T>(schema: ArraySchema<T> | ObjectSchema<T>) {
  return (result: QueryResult<QueryResultRow> | any[]) => {
    if (isTypeQueryResultRow(result)) {
      if (result.rows?.length === 0) {
        if (result.command === 'SELECT')
          throw new NotFoundError('Requested resource was not found')
        throw new InternalServerError(
          `${result.command} Operation unsuccessful`,
        )
      } else if (result.rows.length > 0) {
        const { error } = schema.validate(result.rows)
        if (error) throw new InternalServerError(error.message)
      }
      return false
    } else {
      // This block handles `any[]` results, not `QueryResult`
      if (result) {
        if (result?.length === 0) {
          // Assuming empty array means resource not found for generic array results
          throw new NotFoundError(`Requested resource was not found`)
        }
        if (result?.length > 0) {
          const { error } = schema.validate(result)
          if (error) throw new InternalServerError(error.message)
        }
      } else return false
    }
    return true
  }
}
