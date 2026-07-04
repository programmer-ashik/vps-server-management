import { Unauthorized } from '../../../core/http/error.types.js'
import { signAccessToken } from '../../../core/auth/jwt.js'
import { comparePassword } from '../../../utils/password.js'
import { mapUser } from '../users/users.mapper.js'
import { findUserByEmail, findUserById } from '../users/users.repo.js'

function authPayload(user) {
  const u = mapUser(user)
  return {
    token: signAccessToken({
      sub: u.id,
      email: u.email,
      role: u.role,
    }),
    user: u,
  }
}

export async function postLogin(req, res) {
  const { email, password } = req.body ?? {}
  const user = await findUserByEmail(email, { withPassword: true })
  if (!user || !password) {
    throw new Unauthorized('Invalid email or password')
  }
  if (user.status === 'inactive') {
    throw new Unauthorized('Account is inactive')
  }
  const valid = await comparePassword(password, user.password)
  if (!valid) {
    throw new Unauthorized('Invalid email or password')
  }
  res.ok(authPayload(user))
}

export async function getMe(req, res) {
  const user = await findUserById(req.auth.sub)
  if (!user) {
    throw new Unauthorized('User not found')
  }
  res.ok(mapUser(user))
}
