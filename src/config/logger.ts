import pino from 'pino'
import { validatedEnv } from '../lib'

const pinoLogger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss.l',
      ignore: 'pid,hostname',
    },
  },
  level: validatedEnv.IS_PRODUCTION ? 'info' : 'debug',
})

export default pinoLogger
