import { db } from '../../config'
import { response } from '../../lib'
import { CreateScheduleDto, UpdateScheduleTrainerDto } from './schedule.dtos'

export default class ScheduleService {
  static readonly getSchedules = async () => await db.schedule.findMany()

  static readonly getSchedule = async (scheduleId: string) => {
    return await db.schedule.findFirst({
      where: {
        id: scheduleId,
      },
    })
  }

  static readonly getTrainerSchedules = async (trainerId: string) => {
    return await db.schedule.findMany({
      where: {
        trainerId,
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

  static readonly updateScheduleTrainer = async ({
    scheduleId,
    trainerId,
  }: UpdateScheduleTrainerDto) => {
    const updatedSchedule = await db.schedule.update({
      where: {
        id: scheduleId,
      },
      data: {
        trainerId,
      },
    })

    return updatedSchedule
  }

  static readonly deleteSchedule = async (scheduleId: string) => {
    const deletedSchedule = await db.schedule.delete({
      where: {
        id: scheduleId,
      },
    })

    return deletedSchedule
  }

  static readonly isScheduleAvailable = async (scheduleId: string) => {
    const [schedule, isBookingLimitReached] = await Promise.all([
      db.schedule.findFirst({
        where: {
          id: scheduleId,
          startsAt: {
            gte: new Date(),
          },
        },
      }),
      // this.bookingService.isBookingLimitReached(scheduleId, 10),
      db.booking.count({
        where: {
          scheduleId,
        },
      }),
    ])

    return {
      isUnavailable: !schedule,
      isBookingLimitReached: isBookingLimitReached >= 10,
      // isBookingLimitReached,
    }
  }
}
