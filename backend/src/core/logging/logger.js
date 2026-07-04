import path from 'path'
import fs from 'fs'
import { createLogger, format, transports } from 'winston'
// @ts-ignore - type defs for winston-daily-rotate-file may not be installed
import DailyRotateFile from 'winston-daily-rotate-file'
import { config } from '../../config/env.js'

const { combine, timestamp, label: withLabel, errors, splat, metadata, printf, colorize, json } = format

const LOG_ROOT = path.resolve(process.cwd(), 'logs')
const DIR_SUCCESS = path.join(LOG_ROOT, 'successes')
const DIR_ERRORS = path.join(LOG_ROOT, 'errors')
for (const dir of [LOG_ROOT, DIR_SUCCESS, DIR_ERRORS]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const consoleFormat = printf((info) => {
    const d = new Date(info.timestamp)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    const base = `${d.toDateString()} ${hh}:${mm}:${ss} [${info.label}] ${info.level}: ${String(info.message)}`
    if ((info?.stack)) return `${base}\n${info.stack}`
    const meta = info.metadata && Object.keys(info.metadata).length ? ` ${JSON.stringify(info.metadata)}` : ''
    return base + meta
})

function buildLogger({
    name,
    level,
    filePattern,
    handleExceptions = false,
}) {
    return createLogger({
        level: level || (config.logLevel ?? (config.env === 'production' ? 'info' : 'debug')),
        format: combine(
            withLabel({ label: `${config.appName}-${name}` }),
            timestamp({ format: () => new Date().toISOString() }),
            errors({ stack: true }),
            splat(),
            metadata({ fillExcept: ['level', 'message', 'label', 'timestamp'] })
        ),
        transports: [
            new transports.Console({
                level,
                format: combine(colorize(), consoleFormat),
                silent: process.env.NODE_ENV === 'test',
            }),
            new DailyRotateFile({
                filename: path.join(LOG_ROOT, filePattern),
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '20m',
                maxFiles: '14d',
                handleExceptions,
                handleRejections: handleExceptions,
                format: combine(json()),
            }),
        ],
        exitOnError: false,
    })
}

const infoLogger = buildLogger({
    name: 'success',
    level: 'info',
    filePattern: path.join('successes', '%DATE%-success.log'),
})

const errorLogger = buildLogger({
    name: 'error',
    level: 'error',
    filePattern: path.join('errors', '%DATE%-error.log'),
    handleExceptions: true,
})

export const logger = {
    info: (message, ...meta) => {
        infoLogger.info(String(message), ...meta)
    },
    warn: (message, ...meta) => {
        infoLogger.warn(String(message), ...meta)
    },
    error: (message, ...meta) => {
        errorLogger.error(String(message), ...meta)
    },
    // expose a stream for morgan
    stream: {
        write: (msg) => {
            infoLogger.http ? infoLogger.http(msg.trim()) : infoLogger.info(msg.trim())
        },
    },
}


