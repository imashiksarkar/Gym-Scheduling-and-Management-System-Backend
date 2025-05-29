import { UserRole } from '@prisma/client'
import { Request, Response, Router } from 'express'
import { catchAsync, response } from '../../lib'
import { requireAuth, requireRole } from '../../middlewares'
import BookingService from './booking.service'
import { ReqWithUser } from 'middlewares/requireAuth.middleware'
import { createBookingDto, getBookingParamsDto } from './booking.dtos'

class BookingController {
  private static readonly router = Router()
  private static readonly bookingService: typeof BookingService = BookingService
  private static readonly getPath = (path: string) => `/bookings${path}`

  /* Prepare the module */
  static get bookingModule() {
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
  private static readonly createBooking = async (path = this.getPath('/')) => {
    this.router.post(
      path,
      requireAuth(),
      requireRole(UserRole.trainee),
      catchAsync(async (req: ReqWithUser, res: Response) => {
        const userId = req.locals.user.id
        const body = createBookingDto.parse(req.body)

        const newBooking = await this.bookingService.createBooking({
          traineeId: userId,
          scheduleId: body.scheduleId,
        })

        const r = response().success(201).data(newBooking).exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly getBookings = async (path = this.getPath('/')) => {
    this.router.get(
      path,
      requireAuth(),
      requireRole([UserRole.trainee, UserRole.admin]),
      catchAsync(async (req: ReqWithUser, res: Response) => {
        const { id: userId, role } = req.locals.user

        const isAdmin = role === UserRole.admin
        const newBooking = await this.bookingService.getBookings(
          userId,
          isAdmin
        )

        const r = response().success(201).data(newBooking).exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly getBooking = async (
    path = this.getPath('/:bookingId')
  ) => {
    this.router.get(
      path,
      requireAuth(),
      requireRole(UserRole.trainee),
      catchAsync(async (req: ReqWithUser, res: Response) => {
        const params = getBookingParamsDto.parse(req.params)

        const booking = await this.bookingService.getBooking(params.bookingId)

        if (!booking)
          throw response().error(404).message('Booking not found!').exec()

        const r = response().success(200).data(booking).exec()
        res.status(r.code).json(r)
      })
    )
  }

  private static readonly cancelBooking = async (
    path = this.getPath('/:bookingId')
  ) => {
    this.router.delete(
      path,
      requireAuth(),
      requireRole(UserRole.trainee),
      catchAsync(async (req: ReqWithUser, res: Response) => {
        const params = getBookingParamsDto.parse(req.params)

        const canceledBooking = await this.bookingService.cancelBooking(
          params.bookingId
        )

        if (!canceledBooking)
          throw response().error(404).message('Booking not found!').exec()

        const r = response()
          .success(200)
          .data(canceledBooking)
          .message('Booking canceled!')
          .exec()
        res.status(r.code).json(r)
      })
    )
  }
}

export default BookingController.bookingModule as Router
