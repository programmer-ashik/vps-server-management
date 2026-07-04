import mongoose from 'mongoose'

/**
 * Runs work inside a MongoDB transaction (requires replica set).
 */
export async function withTransaction(fn) {
  const session = await mongoose.startSession()
  try {
    let result
    await session.withTransaction(async () => {
      result = await fn(session)
    })
    return result
  } finally {
    session.endSession()
  }
}
