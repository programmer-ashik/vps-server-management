import { config } from '../../../config/env.js'
import { trySendVpsProvisionedEmail } from '../../../services/email.service.js'
import { getVpsUserById } from '../vps-users/vps-users.service.js'
import {
  createSubscriptionsForUser,
  findSubscriptionById,
  markSubscriptionsEmailed,
  renewSubscriptionById,
  cancelSubscriptionById,
  syncExpiredSubscriptions,
} from './vps-subscriptions.repo.js'

export async function addVpsSubscriptions(vpsUser, subscriptionInputs) {
  const created = await createSubscriptionsForUser(vpsUser, subscriptionInputs)

  const emailResult = await trySendVpsProvisionedEmail({
    toEmail: vpsUser.customerEmail,
    customerName: vpsUser.customerName,
    subscriptions: created,
  })

  if (emailResult.sent) {
    await markSubscriptionsEmailed(created.map((item) => item._id))
  }

  const detail = await getVpsUserById(String(vpsUser._id))

  return {
    ...detail,
    emailSent: emailResult.sent,
    emailError: emailResult.error,
  }
}

export async function renewVpsSubscription(id, input) {
  await syncExpiredSubscriptions()
  return renewSubscriptionById(id, input)
}

export async function cancelVpsSubscription(id) {
  return cancelSubscriptionById(id)
}

export async function getVpsSubscriptionWithContext(id) {
  await syncExpiredSubscriptions()
  return findSubscriptionById(id)
}
