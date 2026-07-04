import 'dotenv/config'
import mongoose from 'mongoose'
import { connectToDatabase } from '../loaders/mongoose.loader.js'
import { UserModel } from '../api/v1/users/User.model.js'
import { ServerRequestModel } from '../api/v1/server-requests/ServerRequest.model.js'
import { PartnerPaymentModel } from '../api/v1/partner-payments/PartnerPayment.model.js'
import { VpsServerModel } from '../api/v1/vps-servers/VpsServer.model.js'
import { VpsUserModel } from '../api/v1/vps-users/VpsUser.model.js'
import { VpsSubscriptionModel } from '../api/v1/vps-subscriptions/VpsSubscription.model.js'
import { calculateSubscriptionEndDate } from '../utils/subscription.js'
import { hashPassword } from '../utils/password.js'
import { logger } from '../core/logging/logger.js'

const ADMIN_EMAIL = 'admin@gmail.com'
const ADMIN_PASSWORD = 'Password@1234'

async function seedAdmin() {
  const existing = await UserModel.findOne({ email: ADMIN_EMAIL })
  if (existing) {
    logger.info('Default admin already exists, skipping')
    return
  }
  await UserModel.create({
    name: 'Admin',
    email: ADMIN_EMAIL,
    password: await hashPassword(ADMIN_PASSWORD),
    role: 'admin',
    status: 'active',
  })
  logger.info('Seeded default admin user')
}

async function seedUsers() {
  const users = [
    {
      name: 'Jane Operator',
      email: 'jane@example.com',
      password: 'Password@1234',
      role: 'user',
    },
    {
      name: 'Mark Support',
      email: 'mark@example.com',
      password: 'Password@1234',
      role: 'user',
    },
  ]

  for (const user of users) {
    const exists = await UserModel.findOne({ email: user.email })
    if (exists) continue
    await UserModel.create({
      ...user,
      email: user.email.toLowerCase(),
      password: await hashPassword(user.password),
      status: 'active',
    })
  }
  logger.info('Seeded sample users')
}

async function seedServerRequests() {
  const count = await ServerRequestModel.countDocuments()
  if (count > 0) {
    logger.info('Server requests already exist, skipping')
    return await ServerRequestModel.find().exec()
  }

  const requests = await ServerRequestModel.insertMany([
    {
      customerName: 'Rahim Uddin',
      customerEmail: 'rahim@example.com',
      customerPhone: '+8801712345678',
      serverName: 'VPS Basic',
      serverDetails: '2 vCPU, 4GB RAM, 80GB SSD',
      description: 'Need Ubuntu 22.04',
      subscriptionPlan: 'monthly',
      transactionType: 'bKash',
      transactionId: 'BK123456',
      amount: 1500,
      paymentStatus: 'pending',
      serverStatus: 'processing',
    },
    {
      customerName: 'Sadia Khan',
      customerEmail: 'sadia@example.com',
      serverName: 'VPS Pro',
      serverDetails: '4 vCPU, 8GB RAM, 160GB SSD',
      subscriptionPlan: '3_monthly',
      transactionType: 'Nagad',
      transactionId: 'NG789012',
      amount: 2800,
      paymentStatus: 'paid',
      serverStatus: 'processing',
    },
    {
      customerName: 'Karim Ahmed',
      customerEmail: 'karim@example.com',
      serverName: 'Dedicated Mini',
      serverDetails: '8 vCPU, 16GB RAM, 500GB SSD',
      subscriptionPlan: '6_monthly',
      transactionType: 'Rocket',
      transactionId: 'RK345678',
      amount: 5500,
      paymentStatus: 'paid',
      serverStatus: 'ready_to_share',
    },
    {
      customerName: 'Nusrat Jahan',
      customerEmail: 'nusrat@example.com',
      serverName: 'VPS Standard',
      serverDetails: '2 vCPU, 4GB RAM, 100GB SSD',
      subscriptionPlan: 'yearly',
      transactionType: 'Upay',
      transactionId: 'UP901234',
      amount: 1800,
      paymentStatus: 'paid',
      serverStatus: 'shared',
      serverDeliveryDetails: {
        serverIp: '203.0.113.10',
        serverUsername: 'root',
        serverPassword: 'temp-pass-123',
        serverPanelUrl: 'https://panel.example.com',
        additionalNotes: 'Please change password after first login.',
      },
      emailSentAt: new Date(),
    },
    {
      customerName: 'Imran Hossain',
      customerEmail: 'imran@example.com',
      serverName: 'VPS Starter',
      serverDetails: '1 vCPU, 2GB RAM, 40GB SSD',
      subscriptionPlan: 'monthly',
      transactionType: 'Other',
      transactionId: 'OT567890',
      amount: 900,
      paymentStatus: 'rejected',
      serverStatus: 'processing',
    },
    {
      customerName: 'Latif Enterprise',
      customerEmail: 'ops@latif.example.com',
      customerPhone: '+8801912345678',
      description: 'Existing customer wants another yearly VPS',
      subscriptionPlan: 'yearly',
      transactionType: 'bKash',
      transactionId: 'BK-EXISTING-2026',
      amount: 14400,
      paymentStatus: 'pending',
      serverStatus: 'processing',
    },
    {
      customerName: 'New Startup Client',
      customerEmail: 'startup@example.com',
      customerPhone: '+8801811122233',
      description: 'New customer submitted from external form',
      subscriptionPlan: '6_monthly',
      transactionType: 'Nagad',
      transactionId: 'NG-NEW-2026',
      amount: 7200,
      paymentStatus: 'pending',
      serverStatus: 'processing',
    },
  ])
  logger.info('Seeded server requests')
  return requests
}

async function seedPartnerPayments() {
  const count = await PartnerPaymentModel.countDocuments()
  if (count > 0) {
    logger.info('Partner payments already exist, skipping')
    return
  }

  const now = new Date()
  const hoursAgo = (hours) => new Date(now.getTime() - hours * 60 * 60 * 1000)

  await PartnerPaymentModel.insertMany([
    {
      partnerName: 'Alpha Hosting',
      partnerEmail: 'alpha@partner.com',
      amount: 250,
      bankAccountNumber: 'PAY-10001-ALPHA',
      notes: 'January commission',
      status: 'pending',
      screenshotUrl: '/uploads/partner-payments/mock-alpha.png',
      submittedAt: hoursAgo(6),
    },
    {
      partnerName: 'Beta Cloud',
      partnerEmail: 'beta@partner.com',
      amount: 480,
      bankAccountNumber: 'PAY-20002-BETA',
      notes: 'Approved and waiting transfer',
      status: 'unpaid',
      screenshotUrl: '/uploads/partner-payments/mock-beta.png',
      submittedAt: hoursAgo(30),
      approvedAt: hoursAgo(26),
    },
    {
      partnerName: 'Gamma Networks',
      partnerEmail: 'gamma@partner.com',
      amount: 120,
      bankAccountNumber: 'PAY-30003-GAMMA',
      status: 'paid',
      screenshotUrl: '/uploads/partner-payments/mock-gamma.png',
      submittedAt: hoursAgo(60),
      approvedAt: hoursAgo(55),
      paidAt: hoursAgo(50),
    },
    {
      partnerName: 'Delta Partners',
      partnerEmail: 'delta@partner.com',
      amount: 350,
      bankAccountNumber: 'PAY-40004-DELTA',
      status: 'rejected',
      notes: 'Invalid reference',
      screenshotUrl: '/uploads/partner-payments/mock-delta.png',
      submittedAt: hoursAgo(110),
      rejectedAt: hoursAgo(108),
    },
    {
      partnerName: 'Epsilon Distribution',
      partnerEmail: 'epsilon@partner.com',
      amount: 640,
      bankAccountNumber: 'PAY-50005-EPSILON',
      notes: 'Monthly reseller payout',
      status: 'paid',
      screenshotUrl: '/uploads/partner-payments/mock-epsilon.png',
      submittedAt: hoursAgo(240),
      approvedAt: hoursAgo(232),
      paidAt: hoursAgo(228),
    },
    {
      partnerName: 'Futura Reseller',
      partnerEmail: 'futura@partner.com',
      amount: 300,
      bankAccountNumber: 'PAY-60006-FUTURA',
      notes: 'Needs review this week',
      status: 'pending',
      screenshotUrl: '/uploads/partner-payments/mock-futura.png',
      submittedAt: hoursAgo(360),
    },
  ])
  logger.info('Seeded partner payments')
}

async function seedVpsServers() {
  const count = await VpsServerModel.countDocuments()
  if (count > 0) {
    logger.info('VPS servers already exist, skipping')
    return await VpsServerModel.find().exec()
  }

  const servers = await VpsServerModel.insertMany([
    {
      name: 'VPS-US-01',
      serverDetails: '2 vCPU, 4GB RAM, 80GB SSD - Ubuntu 22.04',
      ip: '8.8.8.8',
      credentials: {
        username: 'root',
        password: 'seed-pass-001',
        panelUrl: 'https://panel.example.com/vps-us-01',
        additionalNotes: 'Available for assignment',
      },
      availabilityStatus: 'available',
      pingStatus: 'unknown',
      isActive: true,
    },
    {
      name: 'VPS-EU-02',
      serverDetails: '4 vCPU, 8GB RAM, 160GB SSD - Debian 12',
      ip: '1.1.1.1',
      credentials: {
        username: 'admin',
        password: 'seed-pass-002',
        panelUrl: 'https://panel.example.com/vps-eu-02',
      },
      availabilityStatus: 'available',
      pingStatus: 'unknown',
      isActive: true,
    },
    {
      name: 'VPS-ASIA-03',
      serverDetails: '2 vCPU, 4GB RAM, 100GB SSD - Ubuntu 24.04',
      ip: '203.0.113.50',
      credentials: {
        username: 'root',
        password: 'seed-pass-003',
      },
      availabilityStatus: 'available',
      pingStatus: 'unknown',
      isActive: true,
    },
    {
      name: 'VPS-UK-04',
      serverDetails: '8 vCPU, 16GB RAM, 320GB NVMe - AlmaLinux 9',
      ip: '203.0.113.51',
      credentials: {
        username: 'ops',
        password: 'seed-pass-004',
      },
      availabilityStatus: 'available',
      pingStatus: 'unknown',
      isActive: true,
    },
    {
      name: 'VPS-SG-05',
      serverDetails: '4 vCPU, 8GB RAM, 160GB SSD - Ubuntu 22.04',
      ip: '203.0.113.52',
      credentials: {
        username: 'root',
        password: 'seed-pass-005',
      },
      availabilityStatus: 'available',
      pingStatus: 'unknown',
      isActive: true,
    },
    {
      name: 'VPS-DE-06',
      serverDetails: '2 vCPU, 4GB RAM, 120GB SSD - Ubuntu 22.04',
      ip: '203.0.113.53',
      credentials: {
        username: 'root',
        password: 'seed-pass-006',
        panelUrl: 'https://panel.example.com/vps-de-06',
      },
      availabilityStatus: 'available',
      pingStatus: 'unknown',
      isActive: true,
    },
    {
      name: 'VPS-US-07',
      serverDetails: '6 vCPU, 12GB RAM, 240GB SSD - Debian 12',
      ip: '203.0.113.54',
      credentials: {
        username: 'admin',
        password: 'seed-pass-007',
      },
      availabilityStatus: 'available',
      pingStatus: 'unknown',
      isActive: true,
    },
  ])
  logger.info('Seeded VPS servers')
  return servers
}

async function seedVpsUsers(serverRequests) {
  const existingUsers = await VpsUserModel.countDocuments()
  const existingSubscriptions = await VpsSubscriptionModel.countDocuments()
  if (existingUsers > 0 || existingSubscriptions > 0) {
    logger.info('VPS users or subscriptions already exist, skipping')
    return
  }

  const serverMap = Object.fromEntries(
    (await VpsServerModel.find().exec()).map((server) => [server.name, server])
  )
  const requestMap = Object.fromEntries(
    serverRequests.map((request) => [request.customerEmail, request])
  )

  const onboardingSadia = await VpsUserModel.create({
    customerName: 'Sadia Khan',
    customerEmail: 'sadia@example.com',
    source: 'server_request',
    serverRequestId: requestMap['sadia@example.com']?._id ?? null,
    notes: 'Auto-created from paid request with no VPS assigned yet',
  })

  const onboardingKarim = await VpsUserModel.create({
    customerName: 'Karim Ahmed',
    customerEmail: 'karim@example.com',
    source: 'server_request',
    serverRequestId: requestMap['karim@example.com']?._id ?? null,
    notes: 'Paid request awaiting VPS assignment',
  })

  const multiCustomer = await VpsUserModel.create({
    customerName: 'Latif Enterprise',
    customerEmail: 'ops@latif.example.com',
    customerPhone: '+8801912345678',
    source: 'manual',
    notes: 'Customer with multiple active VPS subscriptions',
  })

  const expiredCustomer = await VpsUserModel.create({
    customerName: 'Expired Client',
    customerEmail: 'expired@example.com',
    source: 'manual',
    notes: 'Used to test expired subscription state',
  })

  const cancelledCustomer = await VpsUserModel.create({
    customerName: 'Cancelled Client',
    customerEmail: 'cancelled@example.com',
    source: 'manual',
    notes: 'Used to test cancelled subscription state',
  })

  const now = new Date()
  const expiringSoonStart = new Date(now)
  expiringSoonStart.setDate(expiringSoonStart.getDate() - 27)
  const expiredStart = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate())
  const cancelledStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())

  const subscriptions = await VpsSubscriptionModel.insertMany([
    {
      vpsUserId: multiCustomer._id,
      vpsServerId: serverMap['VPS-US-01']._id,
      subscriptionPlan: 'monthly',
      subscriptionPrice: 1500,
      subscriptionStartDate: now,
      subscriptionEndDate: calculateSubscriptionEndDate(now, 'monthly'),
      status: 'active',
      deliveryDetails: {
        serverName: serverMap['VPS-US-01'].name,
        serverIp: serverMap['VPS-US-01'].ip,
        serverUsername: serverMap['VPS-US-01'].credentials?.username,
        serverPassword: serverMap['VPS-US-01'].credentials?.password,
        serverPanelUrl: serverMap['VPS-US-01'].credentials?.panelUrl,
      },
      lastEmailSentAt: now,
    },
    {
      vpsUserId: multiCustomer._id,
      vpsServerId: serverMap['VPS-EU-02']._id,
      subscriptionPlan: '3_monthly',
      subscriptionPrice: 3900,
      subscriptionStartDate: expiringSoonStart,
      subscriptionEndDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3),
      status: 'active',
      deliveryDetails: {
        serverName: serverMap['VPS-EU-02'].name,
        serverIp: serverMap['VPS-EU-02'].ip,
        serverUsername: serverMap['VPS-EU-02'].credentials?.username,
        serverPassword: serverMap['VPS-EU-02'].credentials?.password,
        serverPanelUrl: serverMap['VPS-EU-02'].credentials?.panelUrl,
      },
      lastEmailSentAt: now,
    },
    {
      vpsUserId: expiredCustomer._id,
      vpsServerId: serverMap['VPS-ASIA-03']._id,
      subscriptionPlan: 'monthly',
      subscriptionPrice: 1200,
      subscriptionStartDate: expiredStart,
      subscriptionEndDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2),
      status: 'expired',
      deliveryDetails: {
        serverName: serverMap['VPS-ASIA-03'].name,
        serverIp: serverMap['VPS-ASIA-03'].ip,
      },
    },
    {
      vpsUserId: cancelledCustomer._id,
      vpsServerId: serverMap['VPS-UK-04']._id,
      subscriptionPlan: 'monthly',
      subscriptionPrice: 1800,
      subscriptionStartDate: cancelledStart,
      subscriptionEndDate: calculateSubscriptionEndDate(cancelledStart, 'monthly'),
      status: 'cancelled',
      deliveryDetails: {
        serverName: serverMap['VPS-UK-04'].name,
        serverIp: serverMap['VPS-UK-04'].ip,
      },
    },
  ])

  const activeByServer = new Map(
    subscriptions
      .filter((item) => item.status === 'active')
      .map((item) => [String(item.vpsServerId), item])
  )

  for (const server of Object.values(serverMap)) {
    const activeSubscription = activeByServer.get(String(server._id))
    if (activeSubscription) {
      server.availabilityStatus = 'shared'
      server.assignedVpsUserId = activeSubscription.vpsUserId
      server.assignedVpsSubscriptionId = activeSubscription._id
    } else {
      server.availabilityStatus = 'available'
      server.assignedVpsUserId = null
      server.assignedVpsSubscriptionId = null
    }
    await server.save()
  }

  if (requestMap['sadia@example.com']) {
    await ServerRequestModel.findByIdAndUpdate(requestMap['sadia@example.com']._id, {
      linkedVpsUserId: onboardingSadia._id,
    }).exec()
  }

  if (requestMap['karim@example.com']) {
    await ServerRequestModel.findByIdAndUpdate(requestMap['karim@example.com']._id, {
      linkedVpsUserId: onboardingKarim._id,
    }).exec()
  }

  logger.info('Seeded VPS users and subscriptions')
}

async function main() {
  await connectToDatabase()
  await seedAdmin()
  await seedUsers()
  const serverRequests = await seedServerRequests()
  await seedPartnerPayments()
  await seedVpsServers()
  await seedVpsUsers(serverRequests)
  logger.info('Seed completed successfully')
  await mongoose.disconnect()
}

main().catch((err) => {
  logger.error('Seed failed', { err })
  process.exit(1)
})
