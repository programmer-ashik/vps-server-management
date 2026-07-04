import { json, urlencoded } from 'express'
import crypto from 'crypto'
import { responseEnvelope } from '../core/http/response.middleware.js'
import { httpLogger } from '../core/logging/morgan.js'
import { configureSecurity } from './security.loader.js'

export function configureExpress(app) {
  configureSecurity(app)

  app.set('trust proxy', 1)
  app.disable('x-powered-by')

  app.use(json({ limit: '1mb' }))
  app.use(urlencoded({ extended: true, limit: '1mb' }))

  // attach correlation id and normalized client ip early
  app.use((req, res, next) => {
    const requestIdHeader = req.headers['x-request-id']
    const requestId =
      (typeof requestIdHeader === 'string' && requestIdHeader) ||
      (Array.isArray(requestIdHeader) ? requestIdHeader[0] : undefined) ||
      (crypto.randomUUID
        ? crypto.randomUUID()
        : crypto.randomBytes(8).toString('hex'))
    res.locals.requestId = requestId
    res.setHeader('x-request-id', requestId)

    const forwarded = req.headers['x-forwarded-for']
    let clientIp =
      (typeof forwarded === 'string' && forwarded.split(',')[0].trim()) ||
      (Array.isArray(forwarded) && forwarded[0]) ||
      req.headers['x-real-ip'] ||
      req.ip ||
      'unknown'
    if (typeof clientIp === 'string' && clientIp.includes('::ffff:')) {
      clientIp = clientIp.replace('::ffff:', '')
    }
    res.locals.clientIp = typeof clientIp === 'string' ? clientIp : 'unknown'
    next()
  })

  app.use(httpLogger)
  app.use(responseEnvelope)
}


