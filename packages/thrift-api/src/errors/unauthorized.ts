import { StatusCodes } from 'http-status-codes'
import InternalServerError from './internal-server.js'

class UnauthorizedError extends InternalServerError {
  name: string
  constructor(message: string) {
    super(message)
    this.statusCode = StatusCodes.FORBIDDEN // UnauthorizedError has FORBIDDEN Status
    this.name = 'UnauthorizedError'
  }
}

export default UnauthorizedError
