import { VpsServerModel } from './VpsServer.model.js'

function buildFilter(query = {}) {
  const filter = {}
  if (query.availabilityStatus) filter.availabilityStatus = query.availabilityStatus
  if (query.pingStatus) filter.pingStatus = query.pingStatus
  if (query.isActive === 'true') filter.isActive = true
  if (query.isActive === 'false') filter.isActive = false
  if (query.search) {
    const regex = new RegExp(query.search, 'i')
    filter.$or = [{ name: regex }, { ip: regex }, { serverDetails: regex }]
  }
  return filter
}

export async function findAllVpsServers(query) {
  return VpsServerModel.find(buildFilter(query))
    .sort({ createdAt: -1 })
    .lean()
    .exec()
}

export async function findActiveVpsServers() {
  return VpsServerModel.find({ isActive: true }).lean().exec()
}

export async function createVpsServerRecord(input) {
  return VpsServerModel.create(input)
}

export async function findVpsServerById(id) {
  return VpsServerModel.findById(id).exec()
}

export async function updateVpsServerById(id, input) {
  return VpsServerModel.findByIdAndUpdate(id, input, { new: true }).exec()
}

export async function updateAvailabilityStatusById(id, availabilityStatus) {
  return VpsServerModel.findByIdAndUpdate(
    id,
    { availabilityStatus },
    { new: true }
  ).exec()
}

export async function updatePingStatusById(id, pingStatus) {
  return VpsServerModel.findByIdAndUpdate(
    id,
    { pingStatus, lastPingedAt: new Date() },
    { new: true }
  ).exec()
}

export async function assignVpsServerToUser(
  serverId,
  vpsUserId,
  vpsSubscriptionId = null
) {
  return VpsServerModel.findByIdAndUpdate(
    serverId,
    {
      availabilityStatus: 'shared',
      assignedVpsUserId: vpsUserId,
      assignedVpsSubscriptionId: vpsSubscriptionId,
    },
    { new: true }
  ).exec()
}

export async function releaseVpsServer(serverId) {
  return VpsServerModel.findByIdAndUpdate(
    serverId,
    {
      availabilityStatus: 'available',
      assignedVpsUserId: null,
      assignedVpsSubscriptionId: null,
    },
    { new: true }
  ).exec()
}

export async function deleteVpsServerById(id) {
  return VpsServerModel.findByIdAndDelete(id).exec()
}
