import { NotFound } from '../../../core/http/error.types.js'
import { mapVpsSubscription } from '../vps-users/vps-users.mapper.js'
import {
  cancelVpsSubscription,
  getVpsSubscriptionWithContext,
  renewVpsSubscription,
} from './vps-subscriptions.service.js'

export async function postRenewVpsSubscription(req, res) {
  const renewed = await renewVpsSubscription(req.params.id, req.body ?? {})
  if (!renewed) throw new NotFound('VPS subscription not found')
  res.ok(mapVpsSubscription(renewed))
}

export async function postCancelVpsSubscription(req, res) {
  const cancelled = await cancelVpsSubscription(req.params.id)
  if (!cancelled) throw new NotFound('VPS subscription not found')
  res.ok(mapVpsSubscription(cancelled))
}

export async function getVpsSubscription(req, res) {
  const item = await getVpsSubscriptionWithContext(req.params.id)
  if (!item) throw new NotFound('VPS subscription not found')
  res.ok(mapVpsSubscription(item))
}
