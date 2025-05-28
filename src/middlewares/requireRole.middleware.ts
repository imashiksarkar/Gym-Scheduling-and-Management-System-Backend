import { UserRole } from '@prisma/client'
import { catchAsync, response } from '@src/lib'
import { IUser, ReqWithUser } from '@src/middlewares/requireAuth.middleware'
import { NextFunction, Response } from 'express'

const requireRole = <T extends boolean | void = undefined>(
  role: IUser['role'],
  passThrough?: boolean
) =>
  catchAsync<T>(
    async (
      req: ReqWithUser<'passThrough'>,
      _res: Response,
      next: NextFunction
    ) => {
      const roleExists = UserRole[role] === req.locals.user?.role

      if (passThrough) return roleExists

      if (!roleExists) throw response().error(403).message('Not allowed').exec()

      next()

      return
    }
  )

export default requireRole
