import { UserRole } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import { catchAsync, jwt, response } from '../lib'

export interface IUser {
  id: string
  name: string
  email: string
  role: UserRole
}

export interface ReqWithUser<T extends 'passThrough' | undefined = undefined>
  extends Request {
  locals: {
    user: T extends 'passThrough' ? IUser | null : IUser
  }
}

const requireAuth = (passThrough?: 'passThrough') =>
  catchAsync(async (req: ReqWithUser, _res: Response, next: NextFunction) => {
    const accessToken: string | undefined =
      req.headers?.authorization?.split(' ')[1] || req.cookies['accessToken']

    if (!accessToken && !passThrough)
      throw response().error(401).message('Access token not found').exec()
    else if (!accessToken) return next()

    const token = jwt.decodeToken(accessToken)

    req.locals = {
      user: {
        id: token.sub,
        name: token.name,
        email: token.email,
        role: token.role,
      },
    }

    return next()
  })

export default requireAuth
