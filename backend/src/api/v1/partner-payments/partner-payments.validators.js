import { z } from "../../../core/validation/zod-openapi.js";

export const partnerPaymentStatuses = ["pending", "unpaid", "paid", "rejected"];

export const createPartnerPaymentSchema = z
  .object({
    partnerName: z.string().trim().min(1).max(120),
    partnerEmail: z.string().trim().email(),
    // amount: z.coerce.number().positive(),
    amount: z.coerce
      .number({ invalid_type_error: "Amount must be a number" })
      .positive("Amount must be greater than 0"),
    bankAccountNumber: z.string().trim().min(3).max(120),
    notes: z.string().trim().max(2000).optional(),
    screenshotUrl: z.string().trim().optional(),
  })
  .openapi("CreatePartnerPaymentBody");

export const updatePartnerPaymentSchema = z
  .object({
    partnerName: z.string().trim().min(1).max(120).optional(),
    partnerEmail: z.string().trim().email().optional(),
    amount: z.coerce
      .number({ invalid_type_error: "Amount must be a number" })
      .positive("Amount must be greater than 0")
      .optional(),
    bankAccountNumber: z.string().trim().min(3).max(120).optional(),
    notes: z.string().trim().max(2000).optional(),
    screenshotUrl: z.string().trim().optional(),
  })
  .openapi("UpdatePartnerPaymentBody");

export const updatePartnerPaymentStatusSchema = z
  .object({
    status: z.enum(partnerPaymentStatuses),
  })
  .openapi("UpdatePartnerPaymentStatusBody");

export const partnerPaymentQuerySchema = z.object({
  status: z.enum(partnerPaymentStatuses).optional(),
  search: z.string().optional(),
});
