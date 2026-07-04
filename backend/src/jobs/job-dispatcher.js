import { logger } from '../core/logging/logger.js'

const handlers = new Map()

export function registerJobHandler(name, handler) {
  handlers.set(name, handler)
}

export async function runJob(name, payload) {
  const handler = handlers.get(name)
  if (!handler) {
    logger.warn('No job handler registered', { name })
    return
  }
  await handler(payload)
}

/** Fire-and-forget in-process dispatch. Replace with BullMQ / SQS at scale. */
export function enqueueJob(name, payload) {
  setImmediate(() => {
    runJob(name, payload).catch((err) => {
      logger.error('Background job failed', {
        name,
        error: err instanceof Error ? err.message : err,
      })
    })
  })
}
