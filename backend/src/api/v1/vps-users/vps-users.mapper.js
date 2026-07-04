import { config } from '../../../config/env.js'
import {
  getDaysUntilExpiry,
  isExpiringSoon,
} from '../../../utils/subscription.js'

export function mapVpsSubscription(doc, vpsServer = null) {
  const endDate = doc.subscriptionEndDate

  return {
    id: String(doc?._id ?? doc?.id),
    vpsUserId: String(doc.vpsUserId),
    vpsServerId: String(doc.vpsServerId),
    vpsServer: vpsServer ? mapVpsServer(vpsServer) : null,
    subscriptionPlan: doc.subscriptionPlan,
    subscriptionPrice: doc.subscriptionPrice,
    subscriptionStartDate: doc.subscriptionStartDate,
    subscriptionEndDate: doc.subscriptionEndDate,
    status: doc.status,
    deliveryDetails: doc.deliveryDetails,
    lastEmailSentAt: doc.lastEmailSentAt,
    expiringSoon:
      doc.status === 'active' &&
      isExpiringSoon(endDate, config.subscriptionWarningDays),
    daysUntilExpiry:
      doc.status === 'active' ? getDaysUntilExpiry(endDate) : null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function mapVpsServer(doc, assignment = null) {
  return {
    id: String(doc?._id ?? doc?.id),
    name: doc.name,
    serverDetails: doc.serverDetails,
    ip: doc.ip,
    credentials: doc.credentials,
    availabilityStatus: doc.availabilityStatus,
    pingStatus: doc.pingStatus,
    isActive: doc.isActive,
    lastPingedAt: doc.lastPingedAt,
    assignedVpsUserId: doc.assignedVpsUserId
      ? String(doc.assignedVpsUserId)
      : null,
    assignedVpsSubscriptionId: doc.assignedVpsSubscriptionId
      ? String(doc.assignedVpsSubscriptionId)
      : null,
    assignedUser: assignment?.assignedUser ?? null,
    assignedSubscription: assignment?.assignedSubscription
      ? {
          id: String(
            assignment.assignedSubscription._id ??
              assignment.assignedSubscription.id
          ),
          subscriptionPlan: assignment.assignedSubscription.subscriptionPlan,
          subscriptionPrice: assignment.assignedSubscription.subscriptionPrice,
          subscriptionStartDate:
            assignment.assignedSubscription.subscriptionStartDate,
          subscriptionEndDate:
            assignment.assignedSubscription.subscriptionEndDate,
          status: assignment.assignedSubscription.status,
        }
      : null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function mapVpsServers(docs) {
  return docs.map((doc) =>
    mapVpsServer(doc, {
      assignedUser: doc.assignedUser
        ? {
            id: String(doc.assignedUser._id ?? doc.assignedUser.id),
            customerName: doc.assignedUser.customerName,
            customerEmail: doc.assignedUser.customerEmail,
          }
        : null,
      assignedSubscription: doc.assignedSubscription ?? null,
    })
  )
}

export function mapVpsUser(doc, input = {}) {
  const subscriptions = input.subscriptions ?? []
  const summary = input.summary ?? {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter((item) => item.status === 'active')
      .length,
    expiringSoonCount: subscriptions.filter((item) => item.expiringSoon).length,
    latestSubscriptionEndDate:
      subscriptions[0]?.subscriptionEndDate ?? null,
  }

  return {
    id: String(doc?._id ?? doc?.id),
    customerName: doc.customerName,
    customerEmail: doc.customerEmail,
    customerPhone: doc.customerPhone,
    serverRequestId: doc.serverRequestId ? String(doc.serverRequestId) : null,
    source: doc.source ?? 'manual',
    notes: doc.notes,
    totalSubscriptions: summary.totalSubscriptions,
    activeSubscriptions: summary.activeSubscriptions,
    expiringSoonCount: summary.expiringSoonCount,
    latestSubscriptionEndDate: summary.latestSubscriptionEndDate,
    subscriptions,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function mapVpsUsers(docs, subscriptionMap = new Map(), summaryMap = new Map()) {
  return docs.map((doc) =>
    mapVpsUser(doc, {
      summary: summaryMap.get(String(doc._id)),
      subscriptions: (subscriptionMap.get(String(doc._id)) ?? []).map((item) =>
        mapVpsSubscription(item)
      ),
    })
  )
}
