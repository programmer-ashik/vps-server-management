import { NotFound } from '../../../core/http/error.types.js'
import {
  listVpsUsers,
  createVpsUser,
  getVpsUserById,
  updateVpsUser,
  deleteVpsUser,
} from './vps-users.service.js'
import {
  mapVpsSubscription,
  mapVpsUser,
  mapVpsUsers,
} from './vps-users.mapper.js'
import { addVpsSubscriptions } from '../vps-subscriptions/vps-subscriptions.service.js'

export async function getVpsUsers(req, res) {
  const { docs, subscriptionMap, summaryMap } = await listVpsUsers(req.query ?? {})
  res.ok(mapVpsUsers(docs, subscriptionMap, summaryMap))
}

export async function postVpsUser(req, res) {
  const created = await createVpsUser(req.body ?? {})
  const result = await getVpsUserById(String(created._id))
  res.ok(
    mapVpsUser(result.user, {
      summary: result.summary,
      subscriptions: result.subscriptions.map((item) =>
        mapVpsSubscriptionWithServer(item, result.serverMap)
      ),
    }),
    201
  )
}

export async function getVpsUser(req, res) {
  const result = await getVpsUserById(req.params.id)
  if (!result) throw new NotFound('VPS user not found')
  res.ok(
    mapVpsUser(result.user, {
      summary: result.summary,
      subscriptions: result.subscriptions.map((item) =>
        mapVpsSubscriptionWithServer(item, result.serverMap)
      ),
    })
  )
}

export async function putVpsUser(req, res) {
  const updated = await updateVpsUser(req.params.id, req.body ?? {})
  if (!updated) throw new NotFound('VPS user not found')
  const result = await getVpsUserById(req.params.id)
  res.ok(
    mapVpsUser(result.user, {
      summary: result.summary,
      subscriptions: result.subscriptions.map((item) =>
        mapVpsSubscriptionWithServer(item, result.serverMap)
      ),
    })
  )
}

function mapVpsSubscriptionWithServer(item, serverMap) {
  return mapVpsSubscription(item, serverMap[String(item.vpsServerId)] ?? null)
}

export async function postVpsSubscriptions(req, res) {
  const result = await getVpsUserById(req.params.id)
  if (!result) throw new NotFound('VPS user not found')

  const created = await addVpsSubscriptions(
    result.user,
    req.body.subscriptions ?? []
  )

  res.ok({
    ...mapVpsUser(created.user, {
      summary: created.summary,
      subscriptions: created.subscriptions.map((item) =>
        mapVpsSubscriptionWithServer(item, created.serverMap)
      ),
    }),
    emailSent: created.emailSent,
    emailError: created.emailError,
  })
}

export async function deleteVpsUserById(req, res) {
  const deleted = await deleteVpsUser(req.params.id)
  if (!deleted) throw new NotFound('VPS user not found')
  res.ok({ id: String(deleted._id) })
}
