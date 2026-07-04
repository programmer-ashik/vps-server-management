import morgan from 'morgan'
import { logger } from './logger.js'

// attach custom tokens for correlation id and client ip (set by express loader)
morgan.token('id', (_req, res) => {
  const r = res
  return (r.locals?.requestId) || '-'
})
morgan.token('client-ip', (_req, res) => {
  const r = res
  return (r.locals?.clientIp) || '-'
})

// Detailed, consistent access log format
const format =
  ':id :client-ip :method :url :status :res[content-length] - :response-time ms ":referrer" ":user-agent"'

export const httpLogger = morgan(format, {
  stream: {
    write: (message) => {
      logger.info(message.trim())
    },
  },
})


