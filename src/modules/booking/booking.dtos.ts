import { z } from 'zod'

export const createBookingDto = z.object({
  scheduleId: z.string({ required_error: 'Schedule ID is required' }).uuid({
    message: 'Invalid schedule ID',
  }),
})

export const getBookingParamsDto = z.object({
  bookingId: z.string({ required_error: 'Booking ID is required' }).uuid({
    message: 'Invalid booking ID',
  }),
})

export type CreateBookingDto = z.infer<typeof createBookingDto>
