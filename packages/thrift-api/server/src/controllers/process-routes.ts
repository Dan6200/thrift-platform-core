import { Response } from 'express'
import { RequestWithPayload } from '../types/request.js'
import { isTypeQueryResultRow, Status } from '../types/response.js'
import { QueryDB, QueryDBWithNoResult } from '../types/process-routes.js'
import { QueryResult, QueryResultRow } from 'pg'
import { ParsedQs } from 'qs'
import NotFoundError from '../errors/not-found.js'
import InternalServerError from '#src/errors/internal-server.js'

export default ({
  Query,
  status,
  validateBody,
  validateResult,
  validateQuery,
}: {
  Query: QueryDB | QueryDBWithNoResult
  status: Status
  validateBody?: <T>(body: T) => boolean
  validateResult?: (
    result: any[] | QueryResult<QueryResultRow | QueryResultRow[]>,
  ) => boolean
  validateQuery?: (query: ParsedQs) => boolean
}) => {
  // return the route processor middleware
  return async (
    request: RequestWithPayload,
    response: Response,
  ): Promise<Response<any, Record<string, any>> | void> => {
    const { params, query, body } = request
    let userId: string | undefined
    if (request.userId != null) ({ userId } = request)
    process.env.DEBUG &&
      console.log('\nDEBUG: DB request data -> ' + JSON.stringify(body))

    try {
      // Validate request data
      if (
        typeof body != 'undefined' &&
        Object.values(body).length !== 0 &&
        validateBody
      ) {
        // validateBody throws error if body is invalid
        validateBody(body)
      }

      if (
        typeof query != 'undefined' &&
        Object.values(query).length !== 0 &&
        validateQuery
      ) {
        // validateQuery throws error if query is invalid
        validateQuery(JSON.parse(JSON.stringify(query)))
      }

      let dbResponse: any
      dbResponse = await Query({
        userId,
        body,
        params,
        query,
        files: request.files,
        file: request.file,
      })

      if (validateResult) {
        process.env.DEBUG &&
          console.log('\nDEBUG: DB Response -> ' + JSON.stringify(dbResponse))
        // validateBody throws error if data is invalid
        // check for errors returns true if response is valid
        if (!validateResult(dbResponse)) {
          if (Query?.name.match(/get/)) {
            if (Array.isArray(dbResponse) && dbResponse.length === 0)
              throw new NotFoundError(
                'The Requested Resource Could not be found',
              )
          }
        }
        let responseData: any = null
        if (isTypeQueryResultRow(dbResponse)) {
          responseData = dbResponse.rows
        } else responseData = dbResponse
        return response.status(status).json(responseData)
      }
      response.status(status).end()
    } catch (error) {
      process.env.DEBUG && console.error(error)
      if (error instanceof InternalServerError)
        return response.status(error.statusCode).send(error.message)
      throw error
    }
  }
}
