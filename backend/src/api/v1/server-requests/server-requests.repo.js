import { ServerRequestModel } from './ServerRequest.model.js'

function buildFilter(query = {}) {
  const filter = {}
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus
  if (query.serverStatus) filter.serverStatus = query.serverStatus
  if (query.search) {
    const regex = new RegExp(query.search, 'i')
    filter.$or = [
      { customerName: regex },
      { customerEmail: regex },
      { serverName: regex },
      { transactionId: regex },
    ]
  }
  return filter
}

export async function findAllServerRequests(query) {
  return ServerRequestModel.find(buildFilter(query))
    .sort({ createdAt: -1 })
    .lean()
    .exec()
}

export async function createServerRequestRecord(input) {
  return ServerRequestModel.create(input)
}

export async function findServerRequestById(id) {
  return ServerRequestModel.findById(id).exec()
}

export async function updateServerRequestById(id, input) {
  const patch = {}
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) patch[key] = value
  }
  return ServerRequestModel.findByIdAndUpdate(id, patch, { new: true }).exec()
}

export async function updatePaymentStatusById(id, paymentStatus) {
  return ServerRequestModel.findByIdAndUpdate(
    id,
    { paymentStatus },
    { new: true }
  ).exec()
}

export async function updateServerStatusById(id, serverStatus) {
  return ServerRequestModel.findByIdAndUpdate(
    id,
    { serverStatus },
    { new: true }
  ).exec()
}

export async function sendServerDetailsById(id, delivery) {
  return ServerRequestModel.findByIdAndUpdate(
    id,
    {
      serverDeliveryDetails: delivery,
      serverStatus: 'shared',
      emailSentAt: new Date(),
    },
    { new: true }
  ).exec()
}

export async function deleteServerRequestById(id) {
  return ServerRequestModel.findByIdAndDelete(id).exec()
}

export async function linkServerRequestToVpsUser(id, vpsUserId) {
  return ServerRequestModel.findByIdAndUpdate(
    id,
    { linkedVpsUserId: vpsUserId },
    { new: true }
  ).exec()
}

export async function countServerRequests(filter) {
  return ServerRequestModel.countDocuments(filter).exec()
}

export async function findRecentServerRequests(limit = 5) {
  return ServerRequestModel.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .exec()
}
