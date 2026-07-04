import {
  findAllServerRequests,
  createServerRequestRecord,
  findServerRequestById,
  updateServerRequestById,
  updatePaymentStatusById,
  updateServerStatusById,
  sendServerDetailsById,
  deleteServerRequestById,
  linkServerRequestToVpsUser,
} from './server-requests.repo.js'
import { sendServerDeliveryEmail } from '../../../services/email.service.js'
import { createOrGetVpsUserFromPaidRequest } from '../vps-users/vps-users.service.js'

export async function listServerRequests(query) {
  return findAllServerRequests(query)
}

function normalizeRequestInput(input = {}) {
  return {
    ...input,
    customerEmail:
      typeof input.customerEmail === 'string'
        ? input.customerEmail.trim().toLowerCase()
        : input.customerEmail,
  }
}

export async function createServerRequest(input) {
  return createServerRequestRecord(normalizeRequestInput(input))
}

export async function getServerRequestById(id) {
  return findServerRequestById(id)
}

export async function updateServerRequest(id, input) {
  return updateServerRequestById(id, normalizeRequestInput(input))
}

export async function updatePaymentStatus(id, paymentStatus) {
  const updated = await updatePaymentStatusById(id, paymentStatus)
  if (!updated || paymentStatus !== 'paid') return updated

  const vpsUser = await createOrGetVpsUserFromPaidRequest(updated)
  if (vpsUser) {
    return linkServerRequestToVpsUser(id, vpsUser._id)
  }

  return updated
}

export async function updateServerStatus(id, serverStatus) {
  return updateServerStatusById(id, serverStatus)
}

export async function sendServerDetails(id, delivery) {
  const existing = await findServerRequestById(id)
  if (!existing) return null

  await sendServerDeliveryEmail({
    toEmail: existing.customerEmail,
    customerName: existing.customerName,
    serverName: existing.serverName,
    serverDetails: existing.serverDetails,
    delivery,
  })

  return sendServerDetailsById(id, delivery)
}

export async function deleteServerRequest(id) {
  return deleteServerRequestById(id)
}
