export function mapPartnerPayment(doc) {
  return {
    id: String(doc?._id ?? doc?.id),
    partnerName: doc.partnerName,
    partnerEmail: doc.partnerEmail,
    amount: doc.amount,
    bankAccountNumber: doc.bankAccountNumber,
    notes: doc.notes,
    screenshotUrl: doc.screenshotUrl,
    status: doc.status,
    settlementStatus: doc.settlementStatus,
    submittedAt: doc.submittedAt ?? doc.createdAt,
    approvedAt: doc.approvedAt ?? null,
    paidAt: doc.paidAt ?? null,
    rejectedAt: doc.rejectedAt ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}

export function mapPartnerPayments(docs) {
  return docs.map(mapPartnerPayment)
}
