import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { fileURLToPath } from 'url'
import { config } from '../config/env.js'
import { BadRequest } from '../core/http/error.types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const uploadsRoot = path.resolve(__dirname, '../../', config.uploadsDir)

if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsRoot),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    cb(null, safeName)
  },
})

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

function fileFilter(_req, file, cb) {
  if (!allowedMimeTypes.has(file.mimetype)) {
    cb(new BadRequest('Only image files (JPEG, PNG, WEBP, GIF) are allowed'))
    return
  }
  cb(null, true)
}

export const partnerPaymentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.maxUploadSizeMb * 1024 * 1024,
    files: 1,
  },
})

export function getUploadsRoot() {
  return uploadsRoot
}

export function getScreenshotPublicPath(filename) {
  return `/uploads/partner-payments/${filename}`
}
