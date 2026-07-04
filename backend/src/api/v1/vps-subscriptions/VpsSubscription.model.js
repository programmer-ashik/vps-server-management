import { Schema, model } from 'mongoose'

const deliveryDetailsSchema = new Schema(
  {
    serverName: String,
    serverIp: String,
    serverUsername: String,
    serverPassword: String,
    serverPanelUrl: String,
    additionalNotes: String,
  },
  { _id: false }
)

const vpsSubscriptionSchema = new Schema(
  {
    vpsUserId: {
      type: Schema.Types.ObjectId,
      ref: 'VpsUser',
      required: true,
      index: true,
    },
    vpsServerId: {
      type: Schema.Types.ObjectId,
      ref: 'VpsServer',
      required: true,
      index: true,
    },
    subscriptionPlan: {
      type: String,
      enum: ['monthly', '3_monthly', '6_monthly', 'yearly'],
      required: true,
    },
    subscriptionPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subscriptionStartDate: { type: Date, required: true },
    subscriptionEndDate: { type: Date, default: null, index: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
      index: true,
    },
    deliveryDetails: deliveryDetailsSchema,
    lastEmailSentAt: { type: Date },
  },
  { timestamps: true }
)

export const VpsSubscriptionModel = model(
  'VpsSubscription',
  vpsSubscriptionSchema
)
