import { Schema, model } from 'mongoose'

const vpsUserSchema = new Schema(
  {
    customerName: { type: String, required: true },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      index: true,
    },
    customerPhone: { type: String },
    serverRequestId: {
      type: Schema.Types.ObjectId,
      ref: 'ServerRequest',
      default: null,
      index: true,
    },
    source: {
      type: String,
      enum: ['manual', 'server_request'],
      default: 'manual',
      index: true,
    },
    notes: { type: String },
    // Legacy fields kept temporarily so startup backfill can migrate old records.
    vpsServerId: {
      type: Schema.Types.ObjectId,
      ref: 'VpsServer',
      default: null,
    },
    subscriptionPlan: {
      type: String,
      enum: ['monthly', '3_monthly', '6_monthly', 'yearly'],
    },
    subscriptionStartDate: { type: Date },
    subscriptionEndDate: { type: Date, index: true },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
    },
  },
  { timestamps: true }
)

export const VpsUserModel = model('VpsUser', vpsUserSchema)
