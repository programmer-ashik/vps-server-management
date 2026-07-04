import jwt from 'jsonwebtoken'
import { config } from '../../config/env.js'

export function signAccessToken(claims) {
  const options = {
    subject: claims.sub,
    expiresIn: config.jwtExpiresIn,
  }
  return jwt.sign(
    { email: claims.email, role: claims.role },
    config.jwtSecret,
    options
  )
}

export function verifyAccessToken(token) {
  const decoded = jwt.verify(token, config.jwtSecret)
  const sub = decoded.sub
  if (!sub || typeof decoded.email !== 'string') {
    throw new Error('Invalid token payload')
  }
  return {
    sub,
    email: decoded.email,
    role: typeof decoded.role === 'string' ? decoded.role : 'user',
  }
}
