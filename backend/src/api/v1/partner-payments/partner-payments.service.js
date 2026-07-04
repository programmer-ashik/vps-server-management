import { Conflict, BadRequest } from '../../../core/http/error.types.js'
import {
  ensurePartnerPaymentIndexes,
  findAllPartnerPayments,
  createPartnerPaymentRecord,
  findPartnerPaymentById,
  updatePartnerPaymentById,
  updatePartnerPaymentStatusById,
  deletePartnerPaymentById,
} from './partner-payments.repo.js'

function normalizePartnerPaymentInput(input = {}) {
  return {
    ...input,
    partnerName: input.partnerName?.trim(),
    partnerEmail: input.partnerEmail?.trim().toLowerCase(),
    bankAccountNumber: input.bankAccountNumber?.trim(),
    notes: input.notes?.trim() || undefined,
  }
}

function isDuplicateKeyError(error) {
  return error?.code === 11000
}

function buildDuplicateError(error) {
  return new Conflict('Partner payment already exists')
}

function getStatusUpdate(status, currentItem) {
  const now = new Date()

  switch (status) {
    case 'pending':
      if (currentItem.status !== 'rejected') {
        throw new BadRequest('Only rejected partner payments can be moved back to pending')
      }
      return {
        status,
        approvedAt: null,
        paidAt: null,
        rejectedAt: null,
      }
    case 'unpaid':
      if (!['pending', 'rejected'].includes(currentItem.status)) {
        throw new BadRequest('Only pending or rejected partner payments can be approved')
      }
      return {
        status,
        approvedAt: now,
        paidAt: null,
        rejectedAt: null,
      }
    case 'paid':
      if (currentItem.status !== 'unpaid') {
        throw new BadRequest('Only approved unpaid partner payments can be marked paid')
      }
      return {
        status,
        paidAt: now,
      }
    case 'rejected':
      if (currentItem.status === 'paid') {
        throw new BadRequest('Paid partner payments cannot be rejected')
      }
      return {
        status,
        rejectedAt: now,
        paidAt: null,
        ...(currentItem.status !== 'unpaid' ? { approvedAt: null } : {}),
      }
    default:
      throw new BadRequest('Invalid partner payment status')
  }
}

export async function listPartnerPayments(query) {
  await ensurePartnerPaymentIndexes()
  return findAllPartnerPayments(query)
}

export async function createPartnerPayment(input) {
  await ensurePartnerPaymentIndexes()
  try {
    return await createPartnerPaymentRecord(normalizePartnerPaymentInput(input))
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw buildDuplicateError(error)
    }
    throw error
  }
}

export async function getPartnerPaymentById(id) {
  await ensurePartnerPaymentIndexes()
  return findPartnerPaymentById(id)
}

export async function updatePartnerPayment(id, input) {
  await ensurePartnerPaymentIndexes()
  try {
    return await updatePartnerPaymentById(id, normalizePartnerPaymentInput(input))
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw buildDuplicateError(error)
    }
    throw error
  }
}

export async function updatePartnerPaymentStatus(id, status) {
  await ensurePartnerPaymentIndexes()
  const currentItem = await findPartnerPaymentById(id)
  if (!currentItem) return null

  const update = getStatusUpdate(status, currentItem)
  return updatePartnerPaymentStatusById(id, update)
}

export async function deletePartnerPayment(id) {
  await ensurePartnerPaymentIndexes()
  return deletePartnerPaymentById(id)
}
