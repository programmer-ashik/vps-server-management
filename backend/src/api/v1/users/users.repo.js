import { UserModel } from './User.model.js'
import { hashPassword } from '../../../utils/password.js'

export async function findAllUsers() {
  return UserModel.find().lean().exec()
}

export async function createUserRecord(input) {
  const hashed = await hashPassword(input.password)
  return UserModel.create({
    email: String(input.email ?? '').toLowerCase().trim(),
    name: input.name,
    password: hashed,
    role: input.role ?? 'user',
    status: input.status ?? 'active',
  })
}

export async function findUserByEmail(email, { withPassword = false } = {}) {
  const e = String(email ?? '').toLowerCase().trim()
  if (!e) return null
  const query = UserModel.findOne({ email: e })
  if (withPassword) query.select('+password')
  return query.exec()
}

export async function findUserById(id) {
  return UserModel.findById(id).exec()
}

export async function updateUserById(id, input) {
  const update = { ...input }
  if (update.password) {
    update.password = await hashPassword(update.password)
  }
  return UserModel.findByIdAndUpdate(id, update, { new: true }).exec()
}

export async function updateUserStatusById(id, status) {
  return UserModel.findByIdAndUpdate(id, { status }, { new: true }).exec()
}

export async function deleteUserById(id) {
  return UserModel.findByIdAndDelete(id).exec()
}

export async function countUsers() {
  return UserModel.countDocuments().exec()
}
