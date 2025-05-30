import { db } from '../../config'
import { response } from '../../lib'
import ScheduleService from '../schedule/schedule.service'
import { CreateBookingDto } from './booking.dtos'

export default class BookingService {
  static readonly scheduleService: typeof ScheduleService = ScheduleService

  static readonly createBooking = async (
    bookingPayload: CreateBookingDto & {
      traineeId: string
    }
  ) => {
    // check fro schedule availability
    const { isUnavailable, isBookingLimitReached } =
      await this.scheduleService.isScheduleAvailable(bookingPayload.scheduleId)

    if (isUnavailable)
      throw response().error(400).message('Schedule is not available!').exec()

    if (isBookingLimitReached)
      throw response().error(400).message('Schedule is full!').exec()

    const createdBooking = await db.booking.create({
      data: {
        ...bookingPayload,
      },
    })

    return createdBooking
  }

  static readonly getBookings = async (traineeId: string, isAdmin: boolean) => {
    const query: any = isAdmin
      ? {}
      : {
          where: {
            traineeId,
          },
        }

    const bookings = await db.booking.findMany(query)

    return bookings
  }

  static readonly getBooking = async (bookingId: string) => {
    const booking = await db.booking.findFirst({
      where: {
        id: bookingId,
      },
    })

    return booking
  }

  static readonly cancelBooking = async (bookingId: string) => {
    const deletedBooking = await db.booking.delete({
      where: {
        id: bookingId,
      },
    })

    return deletedBooking
  }
}
