import AuthService from '@modules/auth/auth.service'
import { UserRole } from '@prisma/client'
import { catchAsync, response } from '@src/lib'
import { requireAuth, requireRole } from '@src/middlewares'
import { genRandomPass } from '@src/test/utils'
import { Request, Response, Router } from 'express'
import { createTrainerDto } from '../auth/auth.dtos'

class TrainerController {
  private static readonly router = Router()
  private static readonly authService: typeof AuthService = AuthService
  private static readonly getPath = (path: string) => `/trainers${path}`

  /* Prepare the module */
  static get trainerModule() {
    try {
      const EOFIndex = Object.keys(this).indexOf('EOF') + 1 || 0
      const methods = Object.keys(this).splice(EOFIndex) // skip constructor

      methods.forEach((name) => eval(`this.${name}()`))

      return this.router
    } catch (error) {
      console.log(`Auth module error: ${error}`)
    }
  }

  private static readonly EOF = null // routes begin after line

  /* Hare are all the routes */
  private static readonly createTrainer = async (path = this.getPath('/')) => {
    this.router.post(
      path,
      requireAuth(),
      requireRole(UserRole.admin),
      catchAsync(async (req: Request, res: Response) => {
        const randomPass = genRandomPass()
        const trainer = createTrainerDto.parse(req.body)

        const signedUpTrainer = await this.authService.createTrainer({
          ...trainer,
          password: randomPass,
        })

        // TODO: save the triner password to redis
        // TODO: after the trainer login this password will be removed
        // TODO: if password exists in the redis then it will force the trainer to change the password

        const r = response()
          .success(200)
          .data({ ...signedUpTrainer, password: randomPass })
          .message('Here are all the roles.')
          .exec()
        res.status(r.code).json(r)
      })
    )
  }
}

export default TrainerController.trainerModule as Router
