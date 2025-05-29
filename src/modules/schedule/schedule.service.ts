import { db } from '@src/config'
import { response } from '@src/lib'
import { CreateScheduleDto } from './schedule.dtos'

export default class ScheduleService {
  static readonly getSchedules = async () => await db.schedule.findMany()

  static readonly getSchedule = async (scheduleId: string) => {
    return await db.schedule.findFirst({
      where: {
        id: scheduleId,
      },
    })
  }

  static readonly getAvailableSchedules = async () => {
    return await db.schedule.findMany({
      where: {
        startsAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        startsAt: 'asc',
      },
    })
  }

  static readonly createSchedule = async (
    schedulePayload: CreateScheduleDto
  ) => {
    // can't create more than 5 schedules per day
    const maxScheduleCountPerDay = 5
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)

    const scheduleCount = await db.schedule.count({
      where: {
        startsAt: {
          gte: startDate,
        },
        endsAt: {
          lte: endDate,
        },
      },
    })

    if (scheduleCount >= maxScheduleCountPerDay) {
      throw response()
        .error(409)
        .message(
          `You can't create more than ${maxScheduleCountPerDay} schedules per day.`
        )
        .exec()
    }

    const schedule = await db.schedule.create({
      data: schedulePayload,
    })

    return schedule
  }
}
