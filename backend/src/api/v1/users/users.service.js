import {
  findAllUsers,
  createUserRecord,
  findUserById,
  updateUserById,
  updateUserStatusById,
  deleteUserById,
} from './users.repo.js'

export async function listUsers() {
  return findAllUsers()
}

export async function createUser(input) {
  return createUserRecord(input)
}

export async function getUserById(id) {
  return findUserById(id)
}

export async function updateUser(id, input) {
  return updateUserById(id, input)
}

export async function updateUserStatus(id, status) {
  return updateUserStatusById(id, status)
}

export async function deleteUser(id) {
  return deleteUserById(id)
}
