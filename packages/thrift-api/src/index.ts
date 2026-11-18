import {
  databaseContext,
  workerRequests,
  withDatabaseRequest,
  workerCleanupContext,
} from './db/request-context.js'
import express, { Request, Response, Router } from 'express'
import 'express-async-errors'
import helmet from 'helmet'
import { requestLogger } from '#src/logging.js'

import rateLimiter from 'express-rate-limit'
import cookieParser from 'cookie-parser'
// routers
import profileRouter from '#src/routes/profile/index.js'
import deliveryRouter from '#src/routes/delivery-info/index.js'
import storesRouter from '#src/routes/stores/index.js'
import storeStaffRouter from '#src/routes/store_staff.js'
import productsMediaRouter from '#src/routes/media/products.js'
import avatarMediaRouter from '#src/routes/media/avatar.js'
import productsRouter from '#src/routes/products/index.js'
import cartRouter from '#src/routes/cart/index.js'
import analyticsRouter from '#src/routes/analytics.js'
import productReviewsRouter from '#src/routes/reviews/products.js'
import ordersRouter from '#src/routes/orders/index.js'
import authRouter from '#src/routes/auth.js' // Integrate the new auth router
import paymentsRouter from '#src/routes/payments.js' // Integrate the new payments router

// middlewares
import errorHandlerMiddleware from '#src/error-handler.js'
import notFound from '#src/not-found.js'
import yaml from 'js-yaml'
import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import path from 'path'

// Swagger docs are optional. Vercel bundles the file under a different path
// than the process CWD, so try the common locations and never crash if the
// file is missing (e.g. in a serverless function bundle).
async function loadSwaggerDocument(): Promise<unknown> {
  if (globalThis.__THRIFT_API_DOCS_YAML != null)
    return yaml.load(globalThis.__THRIFT_API_DOCS_YAML)

  const here = path.dirname(fileURLToPath(import.meta.url))
  const candidates = [
    path.resolve('./api-docs/dist.yaml'),
    path.resolve(here, '../../api-docs/dist.yaml'),
    path.resolve(here, '../api-docs/dist.yaml'),
  ]

  for (const candidate of candidates) {
    try {
      const raw = await readFile(candidate, 'utf8')
      return yaml.load(raw)
    } catch {
      // Try the next candidate.
    }
  }

  return {}
}

const swaggerDocument = await loadSwaggerDocument()

////////////// Middlewares //////////////
let app = express()
app.set('trust proxy', 1)
if (process.env.CLOUDFLARE_WORKERS === 'true') {
  app.use((req, res, next) => {
    const requestId = req.headers['x-thrift-worker-request']
    const settings =
      typeof requestId === 'string' ? workerRequests.get(requestId) : undefined
    delete req.headers['x-thrift-worker-request']
    if (!settings)
      return next(new Error('Worker database invocation context is missing'))
    workerCleanupContext.run(settings, () => {
      const cleanup = withDatabaseRequest(
        () =>
          new Promise<void>((resolve) => {
            if (process.env.DB_DIAGNOSTIC === 'true')
              res.setHeader('x-db-context', databaseContext.getStore()!.id)
            res.once('finish', resolve)
            res.once('close', resolve)
            next()
          }),
      ).catch(next)
      settings.waitUntil(cleanup)
    })
  })
}
app.use(cookieParser())
if (process.env.NODE_ENV === 'production')
  app.use(
    rateLimiter({
      windowMs: 15 * 60 * 1000,
      max: 50,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )
else
  app.use(
    rateLimiter({
      windowMs: 6 * 100,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.get('/api', (_req: Request, res: Response) => {
  res.type('html').send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Thrift API documentation</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.29.0/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.29.0/swagger-ui-bundle.js"></script>
    <script>
      SwaggerUIBundle({ url: '/api.json', dom_id: '#swagger-ui' })
    </script>
  </body>
</html>`)
})
app.use(
  '/.well-known/acme-challenge',
  express.static('public/.well-known/acme-challenge'),
)
app.get('/api.json', (_req: Request, res: Response) =>
  // @ts-ignore (vercel workaround)
  res.json(swaggerDocument),
)

app.use(helmet())
app.use(requestLogger)
// application routes
const v1Router = Router()
v1Router.use('/me', profileRouter)
v1Router.use('/delivery-info', deliveryRouter)
v1Router.use('/stores', storesRouter)
v1Router.use('/stores', storeStaffRouter)
v1Router.use('/products', productsRouter)
v1Router.use('/cart', cartRouter)
v1Router.use('/media/products', productsMediaRouter)
v1Router.use('/media/avatar', avatarMediaRouter)
v1Router.use('/reviews/products', productReviewsRouter)
v1Router.use('/orders', ordersRouter)
v1Router.use('/analytics', analyticsRouter)
v1Router.use('/auth', authRouter) // Integrate the auth router
v1Router.use('/payments', paymentsRouter) // Integrate the payments router

app.use('/v1', v1Router)
// helper middlewares
app.use(notFound)
app.use(errorHandlerMiddleware)
export default app
