import { NotFound, UnprocessableEntity } from '../../../core/http/error.types.js'
import {
  listPartnerPayments,
  createPartnerPayment,
  getPartnerPaymentById,
  updatePartnerPayment,
  updatePartnerPaymentStatus,
  deletePartnerPayment,
} from './partner-payments.service.js'
import {
  mapPartnerPayment,
  mapPartnerPayments,
} from './partner-payments.mapper.js'
import { createPartnerPaymentSchema } from './partner-payments.validators.js'

function formatIssues(issues) {
  return issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }))
}

export async function getPartnerPayments(req, res) {
  const items = await listPartnerPayments(req.query ?? {})
  res.ok(mapPartnerPayments(items))
}

export async function postPartnerPayment(req, res) {
  const body = req.body ?? {}
  const parsed = createPartnerPaymentSchema.safeParse({
    partnerName: body.partnerName,
    partnerEmail: body.partnerEmail,
    amount: body.amount,
    bankAccountNumber: body.bankAccountNumber,
    notes: body.notes,
    screenshotUrl: body.screenshotUrl,
  })
  if (!parsed.success) {
    throw new UnprocessableEntity('Validation failed', formatIssues(parsed.error.issues))
  }

  const created = await createPartnerPayment({
    ...parsed.data,
    screenshotUrl: req.file
      ? `/uploads/partner-payments/${req.file.filename}`
      : parsed.data.screenshotUrl,
    submittedAt: new Date(),
  })
  res.ok(mapPartnerPayment(created), 201)
}

export async function getPartnerPayment(req, res) {
  const item = await getPartnerPaymentById(req.params.id)
  if (!item) throw new NotFound('Partner payment not found')
  res.ok(mapPartnerPayment(item))
}

export async function putPartnerPayment(req, res) {
  const updated = await updatePartnerPayment(req.params.id, req.body ?? {})
  if (!updated) throw new NotFound('Partner payment not found')
  res.ok(mapPartnerPayment(updated))
}

export async function patchPartnerPaymentStatus(req, res) {
  const updated = await updatePartnerPaymentStatus(req.params.id, req.body.status)
  if (!updated) throw new NotFound('Partner payment not found')
  res.ok(mapPartnerPayment(updated))
}

export async function deletePartnerPaymentById(req, res) {
  const deleted = await deletePartnerPayment(req.params.id)
  if (!deleted) throw new NotFound('Partner payment not found')
  res.ok({ id: String(deleted._id) })
}
