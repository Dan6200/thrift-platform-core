import { QueryParams } from './process-routes.js'

declare global {
  namespace Express {
    interface Request {
      userId?: string
      validatedParams?: QueryParams['params']
      validatedQueryParams?: QueryParams['query']
      validatedBody?: QueryParams['body']
      dbResult?: any // This will hold the result from the DB query middleware
      validatedResponse?: any // This will hold the validated response data before sending
    }
  }
}
