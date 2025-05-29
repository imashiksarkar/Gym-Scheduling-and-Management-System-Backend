import cookieParser from 'cookie-parser'
import express, { Request, Response } from 'express'
import helmet from 'helmet'
import { cors, db } from './config'
import { getRelativeTime, response } from './lib'
import './lib/processListeners'
import './lib/validatedEnv'
import { errorHandler, notFoundHandler } from './middlewares'
import authModule from './modules/auth'
import scheduleModule from './modules/schedule'
import trainerModule from './modules/trainer'

const getAppInstance = async () => {
  try {
    await db.$connect()

    const startTime = Date.now()

    const app = express()

    app.use(cors())
    app.use(helmet())
    app.use(express.json())
    app.use(cookieParser())

    app.get('/', (_req: Request, res: Response) => {
      const r = response().success(200).message('App is running fine 🚀').exec()
      res.status(r.code).json(r)
    })

    app.get('/health', (_req: Request, res: Response) => {
      const r = response()
        .success(200)
        .message('App is running fine 🚀')
        .data({
          uptime: getRelativeTime(startTime),
        })
        .exec()
      res.status(r.code).json(r)
    })

    app.use(authModule, trainerModule, scheduleModule)

    app.use(notFoundHandler())
    app.use(errorHandler())

    return app
  } catch (error) {
    console.log(error)
    db.$disconnect()
    process.exit(1)
  }
}

export default getAppInstance
