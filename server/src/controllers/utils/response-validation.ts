import { Schema } from 'joi' // Import Schema
import { QueryResult, QueryResultRow } from 'pg'
import NotFoundError from '../../errors/not-found.js'
import { isTypeQueryResultRow } from '../../types/response.js'
import InternalServerError from '#src/errors/internal-server.js'

/**
 * @description Validates DB result against schema
 * */
export function validateResData<T>(
  schema: Schema<T>, // Change to Schema<T>
  { allowEmpty = false }: { allowEmpty?: boolean } = {}, // Add default value for allowEmpty
) {
  return (result: QueryResult<QueryResultRow> | any[]) => {
    if (isTypeQueryResultRow(result)) {
      if (result.rows?.length === 0) {
        if (result.command === 'SELECT' && !allowEmpty)
          throw new NotFoundError('Requested resource was not found')
        // If allowEmpty is true, or it's not a SELECT command, and rows are empty, it's not a NotFoundError
        // It might be an InternalServerError if command is not SELECT and rows are empty, but the original code throws InternalServerError.
        // Let's keep the original behavior for non-SELECT empty results.
        if (result.command !== 'SELECT' && result.rows?.length === 0) {
          throw new InternalServerError(
            `${result.command} Operation unsuccessful`,
          )
        }
        return true // Successfully validated an empty result (if allowed or not SELECT)
      } else {
        // result.rows.length > 0
        // All response schemas are now array schemas, and result.rows is already an array
        const { error } = schema.validate(result.rows)
        if (error) throw new InternalServerError(error.message)
      }
      return true // Successfully validated non-empty result
    } else {
      // This block handles `any[]` results, not `QueryResult`
      if (result) {
        if (result?.length === 0) {
          if (!allowEmpty) {
            // Only throw NotFoundError if empty is not allowed
            throw new NotFoundError(`Requested resource was not found`)
          }
          return true // Successfully validated an empty result (if allowed)
        }
        // All response schemas are now array schemas, and result is already an array
        const { error } = schema.validate(result)
        if (error) throw new InternalServerError(error.message)
      } else {
        // result is null or undefined
        if (!allowEmpty) {
          // If result is null/undefined and empty is not allowed, it's a NotFoundError
          throw new NotFoundError(`Requested resource was not found`)
        }
        return true // Successfully validated null/undefined result (if allowed)
      }
    }
    return true
  }
}
