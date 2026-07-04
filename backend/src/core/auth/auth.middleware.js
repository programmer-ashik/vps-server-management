import { Forbidden, Unauthorized } from '../http/error.types.js'
import { verifyAccessToken } from './jwt.js'

export function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization
    const token =
      typeof header === 'string' && header.startsWith('Bearer ')
        ? header.slice(7).trim()
        : null
    if (!token) {
      next(new Unauthorized('Missing or invalid token'))
      return
    }
    req.auth = verifyAccessToken(token)
    next()
  } catch {
    next(new Unauthorized('Invalid or expired token'))
  }
}

/** Use after requireAuth. */
export function requireRole(...allowed) {
  return (req, _res, next) => {
    if (!req.auth) {
      next(new Unauthorized())
      return
    }
    if (!allowed.includes(req.auth.role)) {
      next(new Forbidden('Insufficient permissions'))
      return
    }
    next()
  }
}
