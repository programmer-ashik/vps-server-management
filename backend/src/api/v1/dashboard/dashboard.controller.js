import { countUsers } from '../users/users.repo.js'
import {
  countServerRequests,
  findRecentServerRequests,
} from '../server-requests/server-requests.repo.js'
import {
  countPartnerPayments,
  findRecentPartnerPayments,
  summarizePartnerPaymentsForWindow,
} from '../partner-payments/partner-payments.repo.js'
import { mapServerRequests } from '../server-requests/server-requests.mapper.js'
import { mapPartnerPayments } from '../partner-payments/partner-payments.mapper.js'

function daysAgo(days) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date
}

export async function getDashboardSummary(_req, res) {
  const [
    usersCount,
    pendingServerRequests,
    paidServerRequests,
    processingServers,
    readyToShareServers,
    pendingPartnerPayments,
    unpaidPartnerPayments,
    paidPartnerPayments,
    todayPartnerPayments,
    last3DaysPartnerPayments,
    last7DaysPartnerPayments,
    last30DaysPartnerPayments,
    recentServerRequests,
    recentPartnerPayments,
  ] = await Promise.all([
    countUsers(),
    countServerRequests({ paymentStatus: 'pending' }),
    countServerRequests({ paymentStatus: 'paid' }),
    countServerRequests({ serverStatus: 'processing' }),
    countServerRequests({ serverStatus: 'ready_to_share' }),
    countPartnerPayments({ status: 'pending' }),
    countPartnerPayments({ status: 'unpaid' }),
    countPartnerPayments({ status: 'paid' }),
    summarizePartnerPaymentsForWindow(daysAgo(0)),
    summarizePartnerPaymentsForWindow(daysAgo(2)),
    summarizePartnerPaymentsForWindow(daysAgo(6)),
    summarizePartnerPaymentsForWindow(daysAgo(29)),
    findRecentServerRequests(5),
    findRecentPartnerPayments(5),
  ])

  res.ok({
    usersCount,
    pendingServerRequests,
    paidServerRequests,
    processingServers,
    readyToShareServers,
    pendingPartnerPayments,
    unpaidPartnerPayments,
    paidPartnerPayments,
    partnerPaymentWindows: {
      today: todayPartnerPayments,
      last3Days: last3DaysPartnerPayments,
      last7Days: last7DaysPartnerPayments,
      last30Days: last30DaysPartnerPayments,
    },
    recentServerRequests: mapServerRequests(recentServerRequests),
    recentPartnerPayments: mapPartnerPayments(recentPartnerPayments),
  })
}
