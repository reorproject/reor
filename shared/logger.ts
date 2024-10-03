import path from 'path'
import os from 'os'
import winston from 'winston'
import fs from 'fs'
import DailyRotateFile from 'winston-daily-rotate-file'

class Logger {
  private static instance: Logger | null = null

  public logger: winston.Logger

  private constructor() {
    const logDir = path.join(os.homedir(), 'logs/reor')
    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }
    } catch (error) {
      console.error('Error creating log directory:', error)
    }
    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`
        }),
      ),
      transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
          filename: path.join(logDir, 'application-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          maxSize: '1m', // 1 MB
          maxFiles: '14d', // Keep logs for 14 days
        }),
      ],
    })
  }

  public static getLogger(): Logger {
    if (this.instance === null) {
      this.instance = new this()
    }
    return this.instance
  }
}

const logger = Logger.getLogger()

export function logInfo(msg: string): void {
  logger.logger.info(msg)
}

export function logErr(msg: string): void {
  logger.logger.error(msg)
}
