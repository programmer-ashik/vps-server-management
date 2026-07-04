import { PartnerPaymentModel } from './PartnerPayment.model.js'

let indexesSyncedPromise = null

export async function ensurePartnerPaymentIndexes() {
  if (!indexesSyncedPromise) {
    indexesSyncedPromise = (async () => {
      const indexes = await PartnerPaymentModel.collection.indexes()
      const bankIndex = indexes.find((index) => index.name === 'bankAccountNumber_1')

      if (bankIndex?.unique) {
        await PartnerPaymentModel.collection.dropIndex('bankAccountNumber_1')
        await PartnerPaymentModel.collection.createIndex(
          { bankAccountNumber: 1 },
          { name: 'bankAccountNumber_1' }
        )
      }
    })().catch((error) => {
      indexesSyncedPromise = null
      throw error
    })
  }

  return indexesSyncedPromise
}

function buildFilter(query = {}) {
  const filter = {}
  if (query.status) filter.status = query.status
  if (query.search) {
    const regex = new RegExp(query.search, 'i')
    filter.$or = [
      { partnerName: regex },
      { partnerEmail: regex },
      { bankAccountNumber: regex },
      { notes: regex },
    ]
  }
  return filter
}

export async function findAllPartnerPayments(query) {
  return PartnerPaymentModel.find(buildFilter(query))
    .sort({ submittedAt: -1, createdAt: -1 })
    .lean()
    .exec()
}

export async function createPartnerPaymentRecord(input) {
  return PartnerPaymentModel.create(input)
}

export async function findPartnerPaymentById(id) {
  return PartnerPaymentModel.findById(id).exec()
}

export async function updatePartnerPaymentById(id, input) {
  return PartnerPaymentModel.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  }).exec()
}

export async function updatePartnerPaymentStatusById(id, update) {
  return PartnerPaymentModel.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  }).exec()
}

export async function deletePartnerPaymentById(id) {
  return PartnerPaymentModel.findByIdAndDelete(id).exec()
}

export async function countPartnerPayments(filter) {
  return PartnerPaymentModel.countDocuments(filter).exec()
}

export async function sumPartnerPaymentAmounts(filter) {
  const result = await PartnerPaymentModel.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalCount: { $sum: 1 },
      },
    },
  ]).exec()

  return {
    totalAmount: result[0]?.totalAmount ?? 0,
    totalCount: result[0]?.totalCount ?? 0,
  }
}

export async function summarizePartnerPaymentsForWindow(startDate) {
  const [summary] = await PartnerPaymentModel.aggregate([
    {
      $match: {
        submittedAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: null,
        totalRequests: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        pendingAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] },
        },
        unpaidCount: {
          $sum: { $cond: [{ $eq: ['$status', 'unpaid'] }, 1, 0] },
        },
        unpaidAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'unpaid'] }, '$amount', 0] },
        },
        paidCount: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] },
        },
        paidAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] },
        },
        rejectedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] },
        },
        rejectedAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, '$amount', 0] },
        },
      },
    },
  ]).exec()

  return {
    totalRequests: summary?.totalRequests ?? 0,
    totalAmount: summary?.totalAmount ?? 0,
    pendingCount: summary?.pendingCount ?? 0,
    pendingAmount: summary?.pendingAmount ?? 0,
    unpaidCount: summary?.unpaidCount ?? 0,
    unpaidAmount: summary?.unpaidAmount ?? 0,
    paidCount: summary?.paidCount ?? 0,
    paidAmount: summary?.paidAmount ?? 0,
    rejectedCount: summary?.rejectedCount ?? 0,
    rejectedAmount: summary?.rejectedAmount ?? 0,
  }
}

export async function findRecentPartnerPayments(limit = 5) {
  return PartnerPaymentModel.find()
    .sort({ submittedAt: -1, createdAt: -1 })
    .limit(limit)
    .lean()
    .exec()
}
