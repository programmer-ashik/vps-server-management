import 'dotenv/config'
import express from 'express'
import { configureExpress } from './loaders/express.loader.js'
import { setupSwagger } from './loaders/swagger.loader.js'
import { connectToDatabase } from './loaders/mongoose.loader.js'
import { setupRoutes } from './loaders/routes.loader.js'
import { config } from './config/env.js'
import { logger } from './core/logging/logger.js'
import { notFoundHandler } from './core/http/notfound.middleware.js'
import { errorHandler } from './core/http/error.middleware.js'
import './jobs/vps-ping.job.js'
import { startVpsPingScheduler } from './jobs/vps-ping.scheduler.js'
import { backfillLegacyVpsUserData } from './api/v1/vps-users/vps-users.service.js'

async function bootstrap() {
  const app = express()

  configureExpress(app)
  setupSwagger(app)
  await connectToDatabase()
  await backfillLegacyVpsUserData()
  setupRoutes(app)
  startVpsPingScheduler()

  // Middleware
  app.use(notFoundHandler)
  app.use(errorHandler)

  // Start server
  const port = config.port
  app.listen(port, () => {
    logger.info(`API listening on http://localhost:${port}`, {
      env: config.env,
    })
  })
}

bootstrap().catch((error) => {
  logger.error('Fatal startup error', {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  })
  process.exit(1)
})

