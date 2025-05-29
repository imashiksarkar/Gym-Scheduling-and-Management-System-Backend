import getAppInstance from '@src/app'
import {
  createAdmin,
  createSchedule,
  createTrainer,
  getSchedulePayload,
  makeSchedulesUnavailable,
} from '@src/test/utils'
import request from 'supertest'
import { describe, expect, it } from 'vitest'

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

  it('get a single schedule', async () => {
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

  it('list all available schedules', async () => {
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
  })
})
