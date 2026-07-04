import {
  findAllVpsServers,
  findActiveVpsServers,
  createVpsServerRecord,
  findVpsServerById,
  updateVpsServerById,
  updateAvailabilityStatusById,
  updatePingStatusById,
  deleteVpsServerById,
} from './vps-servers.repo.js'
import { pingHost } from '../../../services/ping.service.js'
import { VpsUserModel } from '../vps-users/VpsUser.model.js'
import { VpsSubscriptionModel } from '../vps-subscriptions/VpsSubscription.model.js'
import { VpsServerModel } from './VpsServer.model.js'
import { syncExpiredSubscriptions } from '../vps-subscriptions/vps-subscriptions.repo.js'

function sameId(left, right) {
  return String(left ?? '') === String(right ?? '')
}

async function reconcileServerAssignments() {
  await syncExpiredSubscriptions()

  const [servers, activeSubscriptions] = await Promise.all([
    VpsServerModel.find().lean().exec(),
    VpsSubscriptionModel.find({ status: 'active' }).lean().exec(),
  ])

  if (!servers.length) return

  const activeByServerId = new Map()
  for (const subscription of activeSubscriptions) {
    activeByServerId.set(String(subscription.vpsServerId), subscription)
  }

  const operations = []

  for (const server of servers) {
    const activeSubscription = activeByServerId.get(String(server._id))
    const nextAvailabilityStatus = activeSubscription ? 'shared' : 'available'
    const nextAssignedUserId = activeSubscription?.vpsUserId ?? null
    const nextAssignedSubscriptionId = activeSubscription?._id ?? null

    const needsUpdate =
      server.availabilityStatus !== nextAvailabilityStatus ||
      !sameId(server.assignedVpsUserId, nextAssignedUserId) ||
      !sameId(server.assignedVpsSubscriptionId, nextAssignedSubscriptionId)

    if (!needsUpdate) continue

    operations.push({
      updateOne: {
        filter: { _id: server._id },
        update: {
          $set: {
            availabilityStatus: nextAvailabilityStatus,
            assignedVpsUserId: nextAssignedUserId,
            assignedVpsSubscriptionId: nextAssignedSubscriptionId,
          },
        },
      },
    })
  }

  if (operations.length) {
    await VpsServerModel.bulkWrite(operations)
  }
}

async function enrichServers(items) {
  const userIds = [
    ...new Set(items.map((item) => item.assignedVpsUserId).filter(Boolean).map(String)),
  ]
  const subscriptionIds = [
    ...new Set(
      items
        .map((item) => item.assignedVpsSubscriptionId)
        .filter(Boolean)
        .map(String)
    ),
  ]

  const [users, subscriptions] = await Promise.all([
    userIds.length
      ? VpsUserModel.find({ _id: { $in: userIds } }).lean().exec()
      : [],
    subscriptionIds.length
      ? VpsSubscriptionModel.find({ _id: { $in: subscriptionIds } }).lean().exec()
      : [],
  ])

  const userMap = Object.fromEntries(users.map((item) => [String(item._id), item]))
  const subscriptionMap = Object.fromEntries(
    subscriptions.map((item) => [String(item._id), item])
  )

  return items.map((item) => ({
    ...item,
    assignedUser: item.assignedVpsUserId
      ? userMap[String(item.assignedVpsUserId)] ?? null
      : null,
    assignedSubscription: item.assignedVpsSubscriptionId
      ? subscriptionMap[String(item.assignedVpsSubscriptionId)] ?? null
      : null,
  }))
}

export async function listVpsServers(query) {
  await reconcileServerAssignments()
  const items = await findAllVpsServers(query)
  return enrichServers(items)
}

export async function createVpsServer(input) {
  return createVpsServerRecord(input)
}

export async function getVpsServerById(id) {
  await reconcileServerAssignments()
  const item = await findVpsServerById(id)
  if (!item) return null
  const [enriched] = await enrichServers([item.toObject()])
  return enriched
}

export async function updateVpsServer(id, input) {
  return updateVpsServerById(id, input)
}

export async function updateAvailabilityStatus(id, availabilityStatus) {
  return updateAvailabilityStatusById(id, availabilityStatus)
}

export async function pingVpsServer(id) {
  const server = await findVpsServerById(id)
  if (!server) return null

  const result = await pingHost(server.ip)
  const pingStatus = result.online ? 'online' : 'offline'
  return updatePingStatusById(id, pingStatus)
}

export async function pingAllActiveVpsServers() {
  const servers = await findActiveVpsServers()
  const results = []

  for (const server of servers) {
    const result = await pingHost(server.ip)
    const pingStatus = result.online ? 'online' : 'offline'
    const updated = await updatePingStatusById(String(server._id), pingStatus)
    results.push(updated)
  }

  return results
}

export async function deleteVpsServer(id) {
  return deleteVpsServerById(id)
}
