import cors from 'cors'
import helmet from 'helmet'
import { config } from '../config/env.js'

export function configureSecurity(app) {
  app.use(
    helmet({
      contentSecurityPolicy: config.env === 'production' ? undefined : false,
    })
  )

  const origin =
    config.corsOrigin === '*'
      ? true
      : config.corsOrigin.split(',').map((o) => o.trim())

  app.use(
    cors({
      origin,
      credentials: true,
    })
  )
}
