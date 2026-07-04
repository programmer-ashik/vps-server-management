import { NotFound } from '../../../core/http/error.types.js'
import {
  listServerRequests,
  createServerRequest,
  getServerRequestById,
  updateServerRequest,
  updatePaymentStatus,
  updateServerStatus,
  sendServerDetails,
  deleteServerRequest,
} from './server-requests.service.js'
import { mapServerRequest, mapServerRequests } from './server-requests.mapper.js'

export async function getServerRequests(req, res) {
  const items = await listServerRequests(req.query ?? {})
  res.ok(mapServerRequests(items))
}

export async function postServerRequest(req, res) {
  const created = await createServerRequest(req.body ?? {})
  res.ok(mapServerRequest(created), 201)
}

export async function getServerRequest(req, res) {
  const item = await getServerRequestById(req.params.id)
  if (!item) throw new NotFound('Server request not found')
  res.ok(mapServerRequest(item))
}

export async function putServerRequest(req, res) {
  const updated = await updateServerRequest(req.params.id, req.body ?? {})
  if (!updated) throw new NotFound('Server request not found')
  res.ok(mapServerRequest(updated))
}

export async function patchPaymentStatus(req, res) {
  const updated = await updatePaymentStatus(
    req.params.id,
    req.body.paymentStatus
  )
  if (!updated) throw new NotFound('Server request not found')
  res.ok(mapServerRequest(updated))
}

export async function patchServerStatus(req, res) {
  const updated = await updateServerStatus(req.params.id, req.body.serverStatus)
  if (!updated) throw new NotFound('Server request not found')
  res.ok(mapServerRequest(updated))
}

export async function postSendServerDetails(req, res) {
  const updated = await sendServerDetails(req.params.id, req.body ?? {})
  if (!updated) throw new NotFound('Server request not found')
  res.ok(mapServerRequest(updated))
}

export async function deleteServerRequestById(req, res) {
  const deleted = await deleteServerRequest(req.params.id)
  if (!deleted) throw new NotFound('Server request not found')
  res.ok({ id: String(deleted._id) })
}
