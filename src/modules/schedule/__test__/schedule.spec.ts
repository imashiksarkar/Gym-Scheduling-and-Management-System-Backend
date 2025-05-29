import getAppInstance from '@src/app'
import {
  createAdmin,
  createTrainee,
  createTrainer,
  getSchedulePayload,
} from '@src/test/utils'
import request from 'supertest'
import { describe, expect, it } from 'vitest'

describe('auth', async () => {
  const app = await getAppInstance()

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
