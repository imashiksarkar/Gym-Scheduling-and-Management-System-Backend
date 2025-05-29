import request from 'supertest'
import { describe, expect, it } from 'vitest'
import getAppInstance from '../../../app'
import {
  createAdmin,
  createSchedule,
  createTrainee,
  createTrainer,
  getSchedulePayload,
  makeSchedulesUnavailable,
} from '../../../test/utils'

describe('Schedule Module', async () => {
  const app = await getAppInstance()

  it('can list all trainers', async () => {
    const { at: adminAT } = await createAdmin(app)
    const { body: trainer } = await createTrainer(app)
    await createSchedule(app, adminAT, trainer.data.id, 5) // create 5 schedules

    // get all schedules
    const schedules = await request(app)
      .get('/schedules')
      .set('Cookie', adminAT)

    console.log(schedules.body)

    expect(schedules.body.success).toBe(true)
    expect(schedules.body.data).toBeDefined()
    expect(schedules.body.data).toHaveLength(5)
  })

  it('gets a single schedule', async () => {
    const { at: adminAT } = await createAdmin(app)
    const { body: trainer } = await createTrainer(app)
    const schedule = await createSchedule(app, adminAT, trainer.data.id) // create 1 schedules

    // get all schedules
    const schedules = await request(app)
      .get(`/schedules/${schedule.data.id}`)
      .set('Cookie', adminAT)

    expect(schedules.body.success).toBe(true)
    expect(schedules.body.data).toBeDefined()
    expect(schedules.body.data.id).toBeDefined()
  })

  it('lists all available schedules', async () => {
    const { at: adminAT } = await createAdmin(app)
    const { body: trainer } = await createTrainer(app)

    await createSchedule(app, adminAT, trainer.data.id, 3) // create 3 schedules
    await makeSchedulesUnavailable()

    await createSchedule(app, adminAT, trainer.data.id, 3) // create 3 schedules

    // get all schedules
    const schedules = await request(app)
      .get('/schedules/available')
      .set('Cookie', adminAT)

    expect(schedules.body.success).toBe(true)
    expect(schedules.body.data).toHaveLength(3)
  })

  it.todo('gets trainees who booked the schedule', async () => {})

  describe('Role: Admin', () => {
    it('should be able create schedule', async () => {
      const { at: adminAT } = await createAdmin(app)

      const { body: trainer } = await createTrainer(app)

      const schedule = await request(app)
        .post('/schedules')
        .set('Cookie', adminAT)
        .send(getSchedulePayload(trainer.data.id))

      expect(schedule.body.success).toBe(true)
      expect(schedule.body.data).toBeDefined()
      expect(schedule.body.data.id).toBeDefined()
    })

    it('should not allow to create more than 5 schedules per day', async () => {
      const { at: adminAT } = await createAdmin(app)

      const { body: trainer } = await createTrainer(app)

      // create 5 schedules
      for await (const element of Array.from({ length: 5 })) {
        await request(app)
          .post('/schedules')
          .set('Cookie', adminAT)
          .send(getSchedulePayload(trainer.data.id))
          .expect(201)
      }

      // create 6th schedule
      const schedule = await request(app)
        .post('/schedules')
        .set('Cookie', adminAT)
        .send(getSchedulePayload(trainer.data.id))

      expect(schedule.body.success).toBe(false)
      expect(schedule.body.error).toBeDefined()
      expect(schedule.body.error.message.join('')).toMatch(/per day/i)
    })

    it('updates the trainer of a schedule', async () => {
      const { at: adminAT } = await createAdmin(app)
      const { body: trainer } = await createTrainer(app)

      const schedule = await request(app)
        .post('/schedules')
        .set('Cookie', adminAT)
        .send(getSchedulePayload(trainer.data.id))
        .expect(201)

      const scheduleId = schedule.body.data.id

      const { body: trainer2 } = await createTrainer(app)

      const updatedSchedule = await request(app)
        .patch(`/schedules/${scheduleId}`)
        .set('Cookie', adminAT)
        .send({
          trainerId: trainer2.data.id,
        })

      expect(schedule.body.success).toBe(true)
      expect(schedule.body.data.trainerId).not.toBe(
        updatedSchedule.body.data.trainerId
      )
    })

    it('delete schedule', async () => {
      const { at: adminAT } = await createAdmin(app)
      const { body: trainer } = await createTrainer(app)

      const schedule = await createSchedule(app, adminAT, trainer.data.id)

      const scheduleId = schedule.data.id

      const deletedSchedule = await request(app)
        .delete(`/schedules/${scheduleId}`)
        .set('Cookie', adminAT)

      console.log(deletedSchedule.body)

      // expect(schedule.body.success).toBe(true)
      // expect(schedule.body.data.trainerId).not.toBe(
      //   deletedSchedule.body.data.trainerId
      // )
    })
  })
})
