import { config } from '../config/env.js'
import { logger } from '../core/logging/logger.js'
import { runJob } from './job-dispatcher.js'
import { JOB_NAME } from './vps-ping.job.js'

let intervalId = null

export function startVpsPingScheduler() {
  if (intervalId) return

  const intervalMs = config.vpsPingIntervalMs

  const runPingJob = () => {
    runJob(JOB_NAME).catch((err) => {
      logger.error('Scheduled VPS ping job failed', {
        error: err instanceof Error ? err.message : err,
      })
    })
  }

  setTimeout(runPingJob, 30_000)
  intervalId = setInterval(runPingJob, intervalMs)

  logger.info('VPS ping scheduler started', {
    intervalHours: intervalMs / (1000 * 60 * 60),
  })
}

export function stopVpsPingScheduler() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}
