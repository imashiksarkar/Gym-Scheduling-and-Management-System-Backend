import { UserRole } from '@prisma/client'
import { Request, Response, Router } from 'express'
import { catchAsync, response, genRandomPass } from '../../lib'
import { requireAuth, requireRole } from '../../middlewares'
import AuthService from '../auth/auth.service'
import {
  getTrainerParamsDto,
  createTrainerDto,
  deleteTrainerParams,
} from './trainer.dtos'

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
          .success(201)
          .data({ ...signedUpTrainer, password: randomPass })
          .exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly listAllTrainers = async (
    path = this.getPath('/')
  ) => {
    this.router.get(
      path,
      requireAuth(),
      catchAsync(async (_req: Request, res: Response) => {
        const trainers = await this.authService.listAllTrainers()

        const r = response().success(200).data(trainers).exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly getTrainer = async (
    path = this.getPath('/:trainerId')
  ) => {
    this.router.get(
      path,
      requireAuth(),
      catchAsync(async (req: Request, res: Response) => {
        const params = getTrainerParamsDto.parse(req.params)

        const trainer = await this.authService.getTrainer(params.trainerId)

        if (!trainer)
          throw response().error(404).message('Trainer not found!').exec()

        const r = response().success(200).data(trainer).exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly deleteTrainer = async (
    path = this.getPath('/:trainerId')
  ) => {
    this.router.delete(
      path,
      requireAuth(),
      requireRole(UserRole.admin),
      catchAsync(async (req: Request, res: Response) => {
        const params = deleteTrainerParams.parse(req.params)

        const deletedTrainer = await this.authService.deleteTrainer(
          params.trainerId
        )

        if (!deletedTrainer)
          throw response().error(404).message('Trainer not found').exec()

        const r = response()
          .success(201)
          .data(deletedTrainer)
          .message('Trainer deleted successfully.')
          .exec()
        res.status(r.code).json(r)
      })
    )
  }
}

export default TrainerController.trainerModule as Router
