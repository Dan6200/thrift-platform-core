import winston from 'winston'
import fs from 'fs'
import path from 'path'

const logDir = process.env.NODE_ENV === 'production' ? '/tmp' : 'logs'

// Create the log directory if it does not exist
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
    }),
  ],
})

export default logger
