import { NotFound } from '../../../core/http/error.types.js'
import {
  listVpsServers,
  createVpsServer,
  getVpsServerById,
  updateVpsServer,
  updateAvailabilityStatus,
  pingVpsServer,
  deleteVpsServer,
} from './vps-servers.service.js'
import { mapVpsServer, mapVpsServers } from './vps-servers.mapper.js'

export async function getVpsServers(req, res) {
  const items = await listVpsServers(req.query ?? {})
  res.ok(mapVpsServers(items))
}

export async function postVpsServer(req, res) {
  const created = await createVpsServer(req.body ?? {})
  res.ok(mapVpsServer(created), 201)
}

export async function getVpsServer(req, res) {
  const item = await getVpsServerById(req.params.id)
  if (!item) throw new NotFound('VPS server not found')
  res.ok(
    mapVpsServer(item, {
      assignedUser: item.assignedUser
        ? {
            id: String(item.assignedUser._id ?? item.assignedUser.id),
            customerName: item.assignedUser.customerName,
            customerEmail: item.assignedUser.customerEmail,
          }
        : null,
      assignedSubscription: item.assignedSubscription ?? null,
    })
  )
}

export async function putVpsServer(req, res) {
  const updated = await updateVpsServer(req.params.id, req.body ?? {})
  if (!updated) throw new NotFound('VPS server not found')
  res.ok(mapVpsServer(updated))
}

export async function patchAvailabilityStatus(req, res) {
  const updated = await updateAvailabilityStatus(
    req.params.id,
    req.body.availabilityStatus
  )
  if (!updated) throw new NotFound('VPS server not found')
  res.ok(mapVpsServer(updated))
}

export async function postPingVpsServer(req, res) {
  const updated = await pingVpsServer(req.params.id)
  if (!updated) throw new NotFound('VPS server not found')
  res.ok(mapVpsServer(updated))
}

export async function deleteVpsServerById(req, res) {
  const deleted = await deleteVpsServer(req.params.id)
  if (!deleted) throw new NotFound('VPS server not found')
  res.ok({ id: String(deleted._id) })
}
