import type { Request, Response, NextFunction } from 'express'

const defaults = [
  'https://web.thrift-commerce.workers.dev',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

// The API authenticates bearer tokens; cross-origin cookies are not enabled.
export function storefrontCors(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const origin = req.get('Origin')
  const allowed = new Set([
    ...defaults,
    ...(process.env.CORS_ALLOWED_ORIGINS ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  ])
  res.vary('Origin')
  if (origin && allowed.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
    )
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Authorization,Content-Type,Accept,X-Requested-With',
    )
    res.setHeader('Access-Control-Max-Age', '600')
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(origin && !allowed.has(origin) ? 403 : 204)
  }
  next()
}
