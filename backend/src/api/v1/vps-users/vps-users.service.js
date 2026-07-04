import {
  findAllVpsUsers,
  createVpsUserRecord,
  findVpsUserById,
  updateVpsUserById,
  deleteVpsUserById,
  ensureVpsUserFromServerRequest,
  backfillLegacyVpsUsers,
} from './vps-users.repo.js'

export async function listVpsUsers(query) {
  return findAllVpsUsers(query)
}

export async function createVpsUser(input) {
  return createVpsUserRecord(input)
}

export async function getVpsUserById(id) {
  return findVpsUserById(id)
}

export async function updateVpsUser(id, input) {
  return updateVpsUserById(id, input)
}

export async function deleteVpsUser(id) {
  return deleteVpsUserById(id)
}

export async function createOrGetVpsUserFromPaidRequest(serverRequest) {
  return ensureVpsUserFromServerRequest(serverRequest)
}

export async function backfillLegacyVpsUserData() {
  return backfillLegacyVpsUsers()
}
