import { StatusCodes } from 'http-status-codes'
import InternalServerError from './internal-server.js'

/* THIS ERROR SHOULD ALWAYS BE NAMED UNAUTHENTICATED.
 * The status code being UNAUTHORIZED is just an unfortunate misnomer.
 * The status code for an actual Unauthorized error is 403 FORBIDDEN.
 */
class UnauthenticatedError extends InternalServerError {
  constructor(message: string) {
    super(message)
    this.statusCode = StatusCodes.UNAUTHORIZED
    this.name = 'UnauthenticatedError'
  }
}

export default UnauthenticatedError
