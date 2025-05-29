import { UserRole } from '@prisma/client'
import { NextFunction, Response } from 'express'
import { catchAsync, response } from '../lib'
import { IUser, ReqWithUser } from '../middlewares/requireAuth.middleware'

const requireRole = <T extends boolean | void = undefined>(
  role: UserRole[] | UserRole,
  passThrough?: boolean
) =>
  catchAsync<T>(
    async (
      req: ReqWithUser<'passThrough'>,
      _res: Response,
      next: NextFunction
    ) => {
      const roleExists = Array.isArray(role)
        ? role.includes(req.locals?.user!.role)
        : UserRole[role] === req.locals.user?.role

      if (passThrough) return roleExists

      if (!roleExists) throw response().error(403).message('Not allowed').exec()

      next()

      return
    }
  )

export default requireRole
