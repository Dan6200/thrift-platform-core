import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger.js'

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime()

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start)
    const duration = (seconds * 1000 + nanoseconds / 1e6).toFixed(2)

    logger.info(
      `HTTP ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      },
    )
  })

  next()
}
