import { catchAsync, response } from '@src/lib'
import { Request, Response, Router } from 'express'
import ScheduleService from './schedule.service'
import { createScheduleDto } from './schedule.dtos'

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
}

export default ScheduleController.scheduleModule as Router
