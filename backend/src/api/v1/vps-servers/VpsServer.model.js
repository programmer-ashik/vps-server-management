import { Schema, model } from 'mongoose'

const credentialsSchema = new Schema(
  {
    username: String,
    password: String,
    panelUrl: String,
    additionalNotes: String,
  },
  { _id: false }
)

const vpsServerSchema = new Schema(
  {
    name: { type: String, required: true },
    serverDetails: { type: String, required: true },
    ip: { type: String, required: true, index: true },
    credentials: credentialsSchema,
    availabilityStatus: {
      type: String,
      enum: ['available', 'shared'],
      default: 'available',
      index: true,
    },
    pingStatus: {
      type: String,
      enum: ['online', 'offline', 'unknown'],
      default: 'unknown',
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
    lastPingedAt: { type: Date },
    assignedVpsUserId: {
      type: Schema.Types.ObjectId,
      ref: 'VpsUser',
      default: null,
    },
    assignedVpsSubscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'VpsSubscription',
      default: null,
    },
  },
  { timestamps: true }
)

export const VpsServerModel = model('VpsServer', vpsServerSchema)
