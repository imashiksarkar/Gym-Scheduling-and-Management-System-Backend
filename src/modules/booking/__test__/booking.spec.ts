import request from 'supertest'
import { describe, expect, it } from 'vitest'
import getAppInstance from '../../../app'
import {
  createAdmin,
  createSchedule,
  createTrainee,
  createTrainer,
  getUserCred,
  signinAsTrainer,
} from '../../../test/utils'

describe('Booking Module', async () => {
  const app = await getAppInstance()

  describe('Role: Trainer', () => {
    it('can create booking', async () => {
      const { at: adminAT } = await createAdmin(app)

      const { body: trainer } = await signinAsTrainer(app)
      const trainerId = trainer.data.id

      const schedule = await createSchedule(app, adminAT, trainerId)
      const scheduleId = schedule.data.id

      // // create a trainee
      const { body: trainee, at: traineeAT } = await createTrainee(app)

      const createdBooking = await request(app)
        .post('/bookings')
        .set('Cookie', traineeAT)
        .send({
          scheduleId,
        })

      expect(createdBooking.body.success).toBe(true)
      expect(createdBooking.body.data.id).toBeDefined()
    })

    it('list own bookings`', async () => {
      const { at: adminAT } = await createAdmin(app)

      const { body: trainer } = await signinAsTrainer(app)
      const trainerId = trainer.data.id

      const schedule = await createSchedule(app, adminAT, trainerId)
      const scheduleId = schedule.data.id

      // // create a trainee
      const { body: trainee, at: traineeAT } = await createTrainee(app)

      await request(app)
        .post('/bookings')
        .set('Cookie', traineeAT)
        .send({
          scheduleId,
        })
        .expect(201)

      const bookings = await request(app)
        .get('/bookings')
        .set('Cookie', traineeAT)

      expect(bookings.body.success).toBe(true)
      expect(bookings.body.data).toHaveLength(1)
    })
  })
})
