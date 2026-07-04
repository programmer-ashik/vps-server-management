const PLAN_MONTHS = {
  monthly: 1,
  '3_monthly': 3,
  '6_monthly': 6,
  yearly: 12,
}

export function addMonths(date, months) {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export function getPlanDurationMonths(plan) {
  return PLAN_MONTHS[plan] ?? 1
}

export function calculateSubscriptionEndDate(startDate, plan) {
  return addMonths(new Date(startDate), getPlanDurationMonths(plan))
}

export function calculateRenewalEndDate(currentEndDate, plan) {
  const base = new Date(currentEndDate)
  const now = new Date()
  const startFrom = base > now ? base : now
  return calculateSubscriptionEndDate(startFrom, plan)
}

export function isExpiringSoon(endDate, warningDays = 5) {
  if (!endDate) return false
  const end = new Date(endDate)
  const now = new Date()
  if (end <= now) return false
  const diffMs = end.getTime() - now.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= warningDays
}

export function getDaysUntilExpiry(endDate) {
  if (!endDate) return null
  const end = new Date(endDate)
  const now = new Date()
  const diffMs = end.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}
