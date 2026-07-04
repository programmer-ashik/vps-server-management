import { NotFound } from '../../../core/http/error.types.js'
import {
  listUsers,
  createUser,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
} from './users.service.js'
import { mapUser, mapUsers } from './users.mapper.js'

export async function getUsers(_req, res) {
  const users = await listUsers()
  res.ok(mapUsers(users))
}

export async function postUser(req, res) {
  const created = await createUser(req.body ?? {})
  res.ok(mapUser(created), 201)
}

export async function getUser(req, res) {
  const user = await getUserById(req.params.id)
  if (!user) {
    throw new NotFound('User not found')
  }
  res.ok(mapUser(user))
}

export async function putUser(req, res) {
  const updated = await updateUser(req.params.id, req.body ?? {})
  if (!updated) {
    throw new NotFound('User not found')
  }
  res.ok(mapUser(updated))
}

export async function patchUserStatus(req, res) {
  const updated = await updateUserStatus(req.params.id, req.body.status)
  if (!updated) {
    throw new NotFound('User not found')
  }
  res.ok(mapUser(updated))
}

export async function deleteUserById(req, res) {
  const deleted = await deleteUser(req.params.id)
  if (!deleted) {
    throw new NotFound('User not found')
  }
  res.ok({ id: String(deleted._id) })
}
