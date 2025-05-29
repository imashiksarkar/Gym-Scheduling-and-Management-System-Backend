import { db } from '../../config'
import { response } from '../../lib'
import { CreateBookingDto } from './booking.dtos'

export default class BookingService {
  static readonly createBooking = async (
    bookingPayload: CreateBookingDto & {
      traineeId: string
    }
  ) => {
    const createdBooking = await db.booking.create({
      data: {
        ...bookingPayload,
      },
    })

    return createdBooking
  }
}
