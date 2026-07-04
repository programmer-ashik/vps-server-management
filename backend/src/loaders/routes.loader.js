import { Router } from 'express'
import express from 'express'
import usersRouter from '../api/v1/users/users.route.js'
import todosRouter from '../api/v1/todos/todos.route.js'
import authRouter from '../api/v1/auth/auth.route.js'
import serverRequestsRouter from '../api/v1/server-requests/server-requests.route.js'
import partnerPaymentsRouter from '../api/v1/partner-payments/partner-payments.route.js'
import dashboardRouter from '../api/v1/dashboard/dashboard.route.js'
import vpsServersRouter from '../api/v1/vps-servers/vps-servers.route.js'
import vpsUsersRouter from '../api/v1/vps-users/vps-users.route.js'
import vpsSubscriptionsRouter from '../api/v1/vps-subscriptions/vps-subscriptions.route.js'
import { config } from '../config/env.js'
import {
  apiRateLimiter,
  authRateLimiter,
} from '../core/http/rate-limit.middleware.js'
import { haltOnTimedOut, requestTimeout } from '../core/http/timeout.middleware.js'
import { getUploadsRoot } from '../services/upload.middleware.js'

export function setupRoutes(app) {
  app.use(
    '/uploads/partner-payments',
    (req, res, next) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
      next()
    },
    express.static(getUploadsRoot())
  )

  const api = Router()
  app.use('/api/v1', api)
  api.use(apiRateLimiter)
  api.use(requestTimeout(config.requestTimeoutMs))
  api.use(haltOnTimedOut)
  api.get('/health', (_req, res) => res.ok({ status: 'ok', env: config.env }))
  api.use('/auth', authRateLimiter, authRouter)
  api.use('/users', usersRouter)
  api.use('/todos', todosRouter)
  api.use('/server-requests', serverRequestsRouter)
  api.use('/partner-payments', partnerPaymentsRouter)
  api.use('/dashboard', dashboardRouter)
  api.use('/vps-servers', vpsServersRouter)
  api.use('/vps-users', vpsUsersRouter)
  api.use('/vps-subscriptions', vpsSubscriptionsRouter)
}
