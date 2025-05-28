import { validatedEnv } from '@src/lib'
import pino from 'pino'

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
