import mongoose from 'mongoose'
import { config } from '../config/env.js'

export async function connectToDatabase() {
  const uri = config.mongoUri
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  })
}


