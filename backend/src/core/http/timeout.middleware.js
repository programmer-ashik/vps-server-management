import timeout from 'connect-timeout'

export function requestTimeout(ms) {
  return timeout(ms)
}

export function haltOnTimedOut(req, _res, next) {
  if (!req.timedout) {
    next()
  }
}
