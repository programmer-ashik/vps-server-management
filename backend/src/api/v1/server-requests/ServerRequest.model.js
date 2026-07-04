import { Schema, model } from 'mongoose'

const serverDeliverySchema = new Schema(
  {
    serverIp: String,
    serverUsername: String,
    serverPassword: String,
    serverPanelUrl: String,
    additionalNotes: String,
  },
  { _id: false }
)

const serverRequestSchema = new Schema(
  {
    customerName: { type: String, required: true },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    customerPhone: { type: String },
    serverName: { type: String },
    serverDetails: { type: String },
    description: { type: String },
    subscriptionPlan: {
      type: String,
      enum: ['monthly', '3_monthly', '6_monthly', 'yearly'],
      required: true,
      default: 'monthly',
      index: true,
    },
    transactionType: {
      type: String,
      enum: ['Nagad', 'bKash', 'Rocket', 'Upay', 'Other'],
      required: true,
    },
    transactionId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'rejected'],
      default: 'pending',
      index: true,
    },
    serverStatus: {
      type: String,
      enum: ['processing', 'ready_to_share', 'shared'],
      default: 'processing',
      index: true,
    },
    serverDeliveryDetails: serverDeliverySchema,
    emailSentAt: { type: Date },
    linkedVpsUserId: {
      type: Schema.Types.ObjectId,
      ref: 'VpsUser',
      default: null,
    },
  },
  { timestamps: true }
)

export const ServerRequestModel = model('ServerRequest', serverRequestSchema)
