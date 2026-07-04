import { z } from '../../core/validation/zod-openapi.js'

export const userDtoSchema = z
  .object({
    id: z.string(),
    email: z.string().email(),
    name: z.string().optional(),
    role: z.enum(['user', 'admin']),
    status: z.enum(['active', 'inactive']),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi('UserDto')

export const todoDtoSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional(),
    completed: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi('TodoDto')

export const serverDeliveryDtoSchema = z
  .object({
    serverName: z.string().optional(),
    serverIp: z.string().optional(),
    serverUsername: z.string().optional(),
    serverPassword: z.string().optional(),
    serverPanelUrl: z.string().optional(),
    additionalNotes: z.string().optional(),
  })
  .openapi('ServerDeliveryDto')

export const serverRequestDtoSchema = z
  .object({
    id: z.string(),
    customerName: z.string(),
    customerEmail: z.string().email(),
    customerPhone: z.string().optional(),
    serverName: z.string().optional(),
    serverDetails: z.string().optional(),
    description: z.string().optional(),
    subscriptionPlan: z.enum(['monthly', '3_monthly', '6_monthly', 'yearly']),
    transactionType: z.enum(['Nagad', 'bKash', 'Rocket', 'Upay', 'Other']),
    transactionId: z.string(),
    amount: z.number(),
    paymentStatus: z.enum(['pending', 'paid', 'rejected']),
    serverStatus: z.enum(['processing', 'ready_to_share', 'shared']),
    serverDeliveryDetails: serverDeliveryDtoSchema.optional(),
    emailSentAt: z.string().optional(),
    linkedVpsUserId: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi('ServerRequestDto')

export const partnerPaymentDtoSchema = z
  .object({
    id: z.string(),
    partnerName: z.string(),
    partnerEmail: z.string().email(),
    amount: z.number(),
    bankAccountNumber: z.string(),
    notes: z.string().optional(),
    screenshotUrl: z.string().optional(),
    status: z.enum(['pending', 'unpaid', 'paid', 'rejected']),
    settlementStatus: z.enum([
      'pending_review',
      'queued_for_payout',
      'completed',
      'rejected',
    ]),
    submittedAt: z.string(),
    approvedAt: z.string().nullable().optional(),
    paidAt: z.string().nullable().optional(),
    rejectedAt: z.string().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi('PartnerPaymentDto')

export const partnerPaymentWindowSummarySchema = z
  .object({
    totalRequests: z.number(),
    totalAmount: z.number(),
    pendingCount: z.number(),
    pendingAmount: z.number(),
    unpaidCount: z.number(),
    unpaidAmount: z.number(),
    paidCount: z.number(),
    paidAmount: z.number(),
    rejectedCount: z.number(),
    rejectedAmount: z.number(),
  })
  .openapi('PartnerPaymentWindowSummary')

export const vpsCredentialsDtoSchema = z
  .object({
    username: z.string().optional(),
    password: z.string().optional(),
    panelUrl: z.string().optional(),
    additionalNotes: z.string().optional(),
  })
  .openapi('VpsCredentialsDto')

export const vpsServerDtoSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    serverDetails: z.string(),
    ip: z.string(),
    credentials: vpsCredentialsDtoSchema.optional(),
    availabilityStatus: z.enum(['available', 'shared']),
    pingStatus: z.enum(['online', 'offline', 'unknown']),
    isActive: z.boolean(),
    lastPingedAt: z.string().optional(),
    assignedVpsUserId: z.string().nullable().optional(),
    assignedVpsSubscriptionId: z.string().nullable().optional(),
    assignedUser: z
      .object({
        id: z.string(),
        customerName: z.string(),
        customerEmail: z.string().email(),
      })
      .nullable()
      .optional(),
    assignedSubscription: z
      .object({
        id: z.string(),
        subscriptionPlan: z.enum(['monthly', '3_monthly', '6_monthly', 'yearly']),
        subscriptionPrice: z.number(),
        subscriptionStartDate: z.string(),
        subscriptionEndDate: z.string().nullable(),
        status: z.enum(['active', 'expired', 'cancelled']),
      })
      .nullable()
      .optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi('VpsServerDto')

export const vpsSubscriptionDtoSchema = z
  .object({
    id: z.string(),
    vpsUserId: z.string(),
    vpsServerId: z.string(),
    vpsServer: vpsServerDtoSchema.nullable().optional(),
    subscriptionPlan: z.enum(['monthly', '3_monthly', '6_monthly', 'yearly']),
    subscriptionPrice: z.number(),
    subscriptionStartDate: z.string(),
    subscriptionEndDate: z.string().nullable(),
    status: z.enum(['active', 'expired', 'cancelled']),
    deliveryDetails: serverDeliveryDtoSchema.optional(),
    lastEmailSentAt: z.string().optional(),
    expiringSoon: z.boolean(),
    daysUntilExpiry: z.number().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi('VpsSubscriptionDto')

export const vpsUserDtoSchema = z
  .object({
    id: z.string(),
    customerName: z.string(),
    customerEmail: z.string().email(),
    customerPhone: z.string().optional(),
    serverRequestId: z.string().nullable().optional(),
    source: z.enum(['manual', 'server_request']),
    notes: z.string().optional(),
    totalSubscriptions: z.number(),
    activeSubscriptions: z.number(),
    expiringSoonCount: z.number(),
    latestSubscriptionEndDate: z.string().nullable(),
    subscriptions: z.array(vpsSubscriptionDtoSchema).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi('VpsUserDto')

export const createVpsSubscriptionsResultSchema = z
  .object({
    ...vpsUserDtoSchema.shape,
    emailSent: z.boolean(),
    emailError: z.string().nullable().optional(),
  })
  .openapi('CreateVpsSubscriptionsResult')

export const dashboardSummarySchema = z
  .object({
    usersCount: z.number(),
    pendingServerRequests: z.number(),
    paidServerRequests: z.number(),
    processingServers: z.number(),
    readyToShareServers: z.number(),
    pendingPartnerPayments: z.number(),
    unpaidPartnerPayments: z.number(),
    paidPartnerPayments: z.number(),
    partnerPaymentWindows: z.object({
      today: partnerPaymentWindowSummarySchema,
      last3Days: partnerPaymentWindowSummarySchema,
      last7Days: partnerPaymentWindowSummarySchema,
      last30Days: partnerPaymentWindowSummarySchema,
    }),
    recentServerRequests: z.array(serverRequestDtoSchema),
    recentPartnerPayments: z.array(partnerPaymentDtoSchema),
  })
  .openapi('DashboardSummary')

export const authPayloadSchema = z
  .object({
    token: z.string().openapi({ description: 'JWT access token' }),
    user: userDtoSchema,
  })
  .openapi('AuthPayload')

export const errorResponseSchema = z
  .object({
    success: z.literal(false),
    code: z.string(),
    message: z.string(),
    details: z
      .array(
        z.object({
          path: z.string().optional(),
          message: z.string(),
        })
      )
      .optional(),
    requestId: z.string().optional(),
    clientIp: z.string().optional(),
  })
  .openapi('ErrorResponse')

export function successEnvelope(dataSchema) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
  })
}
