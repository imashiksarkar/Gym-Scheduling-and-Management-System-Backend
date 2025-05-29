import { UserRole } from '@prisma/client'
import { Request, Response, Router } from 'express'
import { catchAsync, response } from '../../lib'
import { requireAuth, requireRole } from '../../middlewares'
import {
  createScheduleDto,
  scheduleParamsDto,
  updateScheduleTrainerDto,
} from './schedule.dtos'
import ScheduleService from './schedule.service'

class ScheduleController {
  private static readonly router = Router()
  private static readonly scheduleService: typeof ScheduleService =
    ScheduleService
  private static readonly getPath = (path: string) => `/schedules${path}`

  /* Prepare the module */
  static get scheduleModule() {
    try {
      const EOFIndex = Object.keys(this).indexOf('EOF') + 1 || 0
      const methods = Object.keys(this).splice(EOFIndex) // skip constructor

      methods.forEach((name) => eval(`this.${name}()`))

      return this.router
    } catch (error) {
      console.log(`Schedule module error: ${error}`)
    }
  }

  private static readonly EOF = null // routes begin after line

  /* Hare are all the routes */
  private static readonly createSchedule = async (path = this.getPath('/')) => {
    this.router.post(
      path,
      requireAuth(),
      requireRole(UserRole.admin),
      catchAsync(async (req: Request, res: Response) => {
        const schedulePayload = createScheduleDto.parse(req.body)

        const createdSchedule = await this.scheduleService.createSchedule(
          schedulePayload
        )

        const r = response()
          .success(201)
          .data(createdSchedule)
          .message('Schedule created successfully.')
          .exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly getSchedules = async (path = this.getPath('/')) => {
    this.router.get(
      path,
      catchAsync(async (_req: Request, res: Response) => {
        const schedules = await this.scheduleService.getSchedules()

        const r = response()
          .success(200)
          .data(schedules)
          .message('Schedule created successfully.')
          .exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly getAvailableSchedules = async (
    path = this.getPath('/available')
  ) => {
    this.router.get(
      path,
      catchAsync(async (req: Request, res: Response) => {
        const schedules = await this.scheduleService.getAvailableSchedules()

        const r = response().success(200).data(schedules).exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly getSchedule = async (
    path = this.getPath('/:scheduleId')
  ) => {
    this.router.get(
      path,
      catchAsync(async (req: Request, res: Response) => {
        const params = scheduleParamsDto.parse(req.params)

        const schedules = await this.scheduleService.getSchedule(
          params.scheduleId
        )

        if (!schedules)
          throw response().success(404).message('Schedule not found.').exec()

        const r = response().success(200).data(schedules).exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly updateScheduleTrainer = async (
    path = this.getPath('/:scheduleId')
  ) => {
    this.router.patch(
      path,
      requireAuth(),
      requireRole(UserRole.admin),
      catchAsync(async (req: Request, res: Response) => {
        const { scheduleId, trainerId } = updateScheduleTrainerDto.parse({
          ...req.body,
          ...req.params,
        })

        const schedules = await this.scheduleService.updateScheduleTrainer({
          scheduleId,
          trainerId,
        })

        if (!schedules)
          throw response().success(404).message('Schedule not found.').exec()

        const r = response().success(200).data(schedules).exec()
        res.status(r.code).json(r)
      })
    )
  }
}

export default ScheduleController.scheduleModule as Router
