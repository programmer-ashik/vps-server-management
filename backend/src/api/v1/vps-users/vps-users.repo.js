import { config } from '../../../config/env.js'
import { VpsUserModel } from './VpsUser.model.js'
import { VpsServerModel } from '../vps-servers/VpsServer.model.js'
import { VpsSubscriptionModel } from '../vps-subscriptions/VpsSubscription.model.js'
import {
  deleteSubscriptionsByUserId,
  findSubscriptionsByUserId,
  findSubscriptionsByUserIds,
  summarizeSubscriptions,
  syncExpiredSubscriptions,
} from '../vps-subscriptions/vps-subscriptions.repo.js'

function buildFilter(query = {}) {
  const filter = {}
  if (query.search) {
    const regex = new RegExp(query.search, 'i')
    filter.$or = [
      { customerName: regex },
      { customerEmail: regex },
      { notes: regex },
    ]
  }
  return filter
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : email
}

export async function backfillLegacyVpsUsers() {
  const legacyUsers = await VpsUserModel.find({
    subscriptionPlan: { $exists: true, $ne: null },
  }).exec()

  for (const user of legacyUsers) {
    const existingSubscriptions = await VpsSubscriptionModel.countDocuments({
      vpsUserId: user._id,
    }).exec()

    if (existingSubscriptions > 0) continue

    if (!user.vpsServerId || !user.subscriptionPlan || !user.subscriptionStartDate) {
      continue
    }

    const server = await VpsServerModel.findById(user.vpsServerId).exec()

    const created = await VpsSubscriptionModel.create({
      vpsUserId: user._id,
      vpsServerId: user.vpsServerId,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionPrice: 0,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate ?? user.subscriptionStartDate,
      status: user.status ?? 'active',
      deliveryDetails: server
        ? {
            serverName: server.name,
            serverIp: server.ip,
            serverUsername: server.credentials?.username,
            serverPassword: server.credentials?.password,
            serverPanelUrl: server.credentials?.panelUrl,
            additionalNotes: server.credentials?.additionalNotes,
          }
        : undefined,
    })

    if (server && user.status !== 'cancelled') {
      server.availabilityStatus = 'shared'
      server.assignedVpsUserId = user._id
      server.assignedVpsSubscriptionId = created._id
      await server.save()
    }
  }
}

export async function ensureVpsUserFromServerRequest(serverRequest) {
  if (!serverRequest || serverRequest.paymentStatus !== 'paid') return null

  let existing = null

  if (serverRequest.linkedVpsUserId) {
    existing = await VpsUserModel.findById(serverRequest.linkedVpsUserId).exec()
  }

  if (!existing) {
    existing = await VpsUserModel.findOne({
      $or: [
        { serverRequestId: serverRequest._id },
        { customerEmail: normalizeEmail(serverRequest.customerEmail) },
      ],
    }).exec()
  }

  if (existing) {
    existing.serverRequestId = existing.serverRequestId ?? serverRequest._id
    existing.source = existing.source ?? 'server_request'
    await existing.save()
    return existing
  }

  return VpsUserModel.create({
    customerName: serverRequest.customerName,
    customerEmail: normalizeEmail(serverRequest.customerEmail),
    customerPhone: serverRequest.customerPhone,
    notes: `Auto-created from paid server request: ${serverRequest.serverName}`,
    serverRequestId: serverRequest._id,
    source: 'server_request',
  })
}

export async function findAllVpsUsers(query) {
  await syncExpiredSubscriptions()
  const docs = await VpsUserModel.find(buildFilter(query))
    .sort({ createdAt: -1 })
    .lean()
    .exec()

  const userIds = docs.map((item) => String(item._id))
  const subscriptions = await findSubscriptionsByUserIds(userIds)
  const subscriptionMap = new Map()

  for (const item of subscriptions) {
    const key = String(item.vpsUserId)
    const current = subscriptionMap.get(key) ?? []
    current.push(item)
    subscriptionMap.set(key, current)
  }

  const summaryMap = new Map()
  for (const doc of docs) {
    summaryMap.set(
      String(doc._id),
      summarizeSubscriptions(
        subscriptionMap.get(String(doc._id)) ?? [],
        config.subscriptionWarningDays
      )
    )
  }

  return { docs, subscriptionMap, summaryMap }
}

export async function createVpsUserRecord(input) {
  const customerEmail = normalizeEmail(input.customerEmail)
  const existing = await VpsUserModel.findOne({ customerEmail }).exec()
  if (existing) return existing

  return VpsUserModel.create({
    customerName: input.customerName,
    customerEmail,
    customerPhone: input.customerPhone,
    notes: input.notes,
    source: input.source ?? 'manual',
    serverRequestId: input.serverRequestId ?? null,
  })
}

export async function findVpsUserById(id) {
  await syncExpiredSubscriptions()
  const user = await VpsUserModel.findById(id).exec()
  if (!user) return null

  const subscriptions = await findSubscriptionsByUserId(id)
  const serverIds = [
    ...new Set(subscriptions.map((item) => item.vpsServerId).filter(Boolean).map(String)),
  ]
  const servers = serverIds.length
    ? await VpsServerModel.find({ _id: { $in: serverIds } }).lean().exec()
    : []
  const serverMap = Object.fromEntries(servers.map((item) => [String(item._id), item]))
  const summary = summarizeSubscriptions(
    subscriptions,
    config.subscriptionWarningDays
  )

  return { user, subscriptions, serverMap, summary }
}

export async function updateVpsUserById(id, input) {
  const patch = {}
  if (input.customerName !== undefined) patch.customerName = input.customerName
  if (input.customerEmail !== undefined) {
    patch.customerEmail = normalizeEmail(input.customerEmail)
  }
  if (input.customerPhone !== undefined) patch.customerPhone = input.customerPhone
  if (input.notes !== undefined) patch.notes = input.notes

  return VpsUserModel.findByIdAndUpdate(id, patch, { new: true }).exec()
}

export async function deleteVpsUserById(id) {
  const existing = await VpsUserModel.findById(id).exec()
  if (!existing) return null

  await deleteSubscriptionsByUserId(id)
  return VpsUserModel.findByIdAndDelete(id).exec()
}
