import { HttpError } from '../../../core/http/error.types.js'
import {
  calculateRenewalEndDate,
  calculateSubscriptionEndDate,
  isExpiringSoon,
} from '../../../utils/subscription.js'
import { VpsSubscriptionModel } from './VpsSubscription.model.js'
import {
  assignVpsServerToUser,
  findVpsServerById,
  releaseVpsServer,
} from '../vps-servers/vps-servers.repo.js'

export async function findSubscriptionsByUserIds(userIds) {
  if (!userIds.length) return []
  return VpsSubscriptionModel.find({ vpsUserId: { $in: userIds } })
    .sort({ createdAt: -1 })
    .lean()
    .exec()
}

export async function findSubscriptionsByUserId(userId) {
  return VpsSubscriptionModel.find({ vpsUserId: userId })
    .sort({ createdAt: -1 })
    .lean()
    .exec()
}

export async function findSubscriptionById(id) {
  return VpsSubscriptionModel.findById(id).exec()
}

export async function syncExpiredSubscriptions() {
  await VpsSubscriptionModel.updateMany(
    {
      subscriptionEndDate: { $ne: null, $lt: new Date() },
      status: 'active',
    },
    { status: 'expired' }
  ).exec()
}

async function validateServersForCreate(subscriptionInputs) {
  const uniqueServerIds = [...new Set(subscriptionInputs.map((item) => item.vpsServerId))]
  if (uniqueServerIds.length !== subscriptionInputs.length) {
    throw new HttpError(409, 'Each VPS entry must use a different server', 'DUPLICATE_SERVER_SELECTION')
  }

  const servers = await Promise.all(uniqueServerIds.map((id) => findVpsServerById(id)))
  const serverMap = new Map()

  for (const server of servers) {
    if (!server) {
      throw new HttpError(404, 'Selected VPS server was not found', 'VPS_SERVER_NOT_FOUND')
    }
    if (server.availabilityStatus !== 'available') {
      throw new HttpError(
        409,
        `Server "${server.name}" is already assigned`,
        'VPS_SERVER_ALREADY_ASSIGNED'
      )
    }
    serverMap.set(String(server._id), server)
  }

  return serverMap
}

export async function createSubscriptionsForUser(vpsUser, subscriptionInputs) {
  const serverMap = await validateServersForCreate(subscriptionInputs)

  const records = await VpsSubscriptionModel.insertMany(
    subscriptionInputs.map((item) => {
      const startDate = item.subscriptionStartDate ?? new Date()
      const server = serverMap.get(item.vpsServerId)

      return {
        vpsUserId: vpsUser._id,
        vpsServerId: item.vpsServerId,
        subscriptionPlan: item.subscriptionPlan,
        subscriptionPrice: item.subscriptionPrice,
        subscriptionStartDate: startDate,
        subscriptionEndDate: calculateSubscriptionEndDate(
          startDate,
          item.subscriptionPlan
        ),
        status: 'active',
        deliveryDetails: {
          serverName: server.name,
          serverIp: server.ip,
          serverUsername: server.credentials?.username,
          serverPassword: server.credentials?.password,
          serverPanelUrl: server.credentials?.panelUrl,
          additionalNotes: server.credentials?.additionalNotes,
        },
      }
    })
  )

  for (const record of records) {
    await assignVpsServerToUser(
      String(record.vpsServerId),
      String(vpsUser._id),
      String(record._id)
    )
  }

  return records
}

export async function markSubscriptionsEmailed(subscriptionIds) {
  if (!subscriptionIds.length) return
  await VpsSubscriptionModel.updateMany(
    { _id: { $in: subscriptionIds } },
    { lastEmailSentAt: new Date() }
  ).exec()
}

export async function renewSubscriptionById(id, input) {
  const existing = await VpsSubscriptionModel.findById(id).exec()
  if (!existing) return null

  const nextEndDate = calculateRenewalEndDate(
    existing.subscriptionEndDate,
    input.subscriptionPlan
  )

  return VpsSubscriptionModel.findByIdAndUpdate(
    id,
    {
      subscriptionPlan: input.subscriptionPlan,
      subscriptionPrice:
        input.subscriptionPrice ?? existing.subscriptionPrice,
      subscriptionEndDate: nextEndDate,
      status: 'active',
    },
    { new: true }
  ).exec()
}

export async function cancelSubscriptionById(id) {
  const existing = await VpsSubscriptionModel.findById(id).exec()
  if (!existing) return null

  if (existing.vpsServerId) {
    await releaseVpsServer(String(existing.vpsServerId))
  }

  return VpsSubscriptionModel.findByIdAndUpdate(
    id,
    {
      status: 'cancelled',
      subscriptionEndDate: null,
    },
    { new: true }
  ).exec()
}

export async function deleteSubscriptionsByUserId(userId) {
  const items = await VpsSubscriptionModel.find({ vpsUserId: userId }).exec()

  for (const item of items) {
    if (item.vpsServerId && item.status !== 'cancelled') {
      await releaseVpsServer(String(item.vpsServerId))
    }
  }

  await VpsSubscriptionModel.deleteMany({ vpsUserId: userId }).exec()
  return items
}

export function summarizeSubscriptions(items, warningDays) {
  const activeItems = items.filter((item) => item.status === 'active')
  const datedItems = items.filter((item) => item.subscriptionEndDate)
  const latestEndDate =
    datedItems.length === 0
      ? null
      : datedItems.reduce((latest, item) => {
          if (!latest) return item.subscriptionEndDate
          return new Date(item.subscriptionEndDate) > new Date(latest)
            ? item.subscriptionEndDate
            : latest
        }, null)

  return {
    totalSubscriptions: items.length,
    activeSubscriptions: activeItems.length,
    expiringSoonCount: activeItems.filter((item) =>
      isExpiringSoon(item.subscriptionEndDate, warningDays)
    ).length,
    latestSubscriptionEndDate: latestEndDate,
  }
}
