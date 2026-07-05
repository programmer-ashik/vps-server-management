import { Schema, model } from "mongoose";

const statusToSettlementStatus = {
  pending: "pending_review",
  unpaid: "queued_for_payout",
  paid: "completed",
  rejected: "rejected",
};

const partnerPaymentSchema = new Schema(
  {
    partnerName: { type: String, required: true, trim: true },
    partnerEmail: {
      type: String,
      required: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    amount: { type: Number, required: true },
    bankAccountNumber: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    notes: { type: String },
    screenshotUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "unpaid", "paid", "rejected"],
      default: "pending",
      index: true,
    },
    settlementStatus: {
      type: String,
      enum: ["pending_review", "queued_for_payout", "completed", "rejected"],
      default: "pending_review",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

partnerPaymentSchema.pre("validate", function normalizeFields() {
  if (typeof this.partnerName === "string") {
    this.partnerName = this.partnerName.trim();
  }

  if (typeof this.partnerEmail === "string") {
    this.partnerEmail = this.partnerEmail.trim().toLowerCase();
  }

  if (typeof this.bankAccountNumber === "string") {
    this.bankAccountNumber = this.bankAccountNumber.trim();
  }
});

partnerPaymentSchema.pre("save", function syncSettlementStatus() {
  this.settlementStatus =
    statusToSettlementStatus[this.status] ?? "pending_review";
});

function normalizeUpdate() {
  const update = this.getUpdate() ?? {};
  const payload = update.$set ?? update;

  if (typeof payload.partnerName === "string") {
    payload.partnerName = payload.partnerName.trim();
  }
  if (typeof payload.partnerEmail === "string") {
    payload.partnerEmail = payload.partnerEmail.trim().toLowerCase();
  }
  if (typeof payload.bankAccountNumber === "string") {
    payload.bankAccountNumber = payload.bankAccountNumber.trim();
  }
  if (payload.status) {
    payload.settlementStatus =
      statusToSettlementStatus[payload.status] ?? "pending_review";
  }

  if (update.$set) {
    update.$set = payload;
  }
}
partnerPaymentSchema.pre("findOneAndUpdate", normalizeUpdate);
partnerPaymentSchema.pre("updateOne", normalizeUpdate);
partnerPaymentSchema.pre("updateMany", normalizeUpdate);

export const PartnerPaymentModel = model(
  "PartnerPayment",
  partnerPaymentSchema,
);
