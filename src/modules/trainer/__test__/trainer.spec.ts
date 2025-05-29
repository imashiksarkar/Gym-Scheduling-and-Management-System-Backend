import getAppInstance from '@src/app'
import { createAdmin, getUserCred } from '@src/test/utils'
import request from 'supertest'
import { describe, expect, it } from 'vitest'

describe('Trainer Module', async () => {
  const app = await getAppInstance()

  describe('Role: Admin', () => {
    it('should be create a trainer', async () => {
      const { at: adminAT } = await createAdmin(app)

      const trainer = await request(app)
        .post('/trainers')
        .set('Cookie', adminAT)
        .send(getUserCred())

      expect(trainer.body.success).toBe(true)
      expect(trainer.body.data).toBeDefined()
      expect(trainer.body.data.password).toBeDefined()
    })

    it('should be able to list all the trainers', async () => {
      const { at: adminAT } = await createAdmin(app)

      const trainersLength = 5
      for await (const element of Array.from({ length: trainersLength })) {
        await request(app)
          .post('/trainers')
          .set('Cookie', adminAT)
          .send(getUserCred())
          .expect(201)
      }

      const trainer = await request(app)
        .get('/trainers')
        .set('Cookie', adminAT)
        .expect(200)

      expect(trainer.body.success).toBe(true)
      expect(trainer.body.data).toBeDefined()
      expect(trainer.body.data).toHaveLength(trainersLength)
      expect(trainer.body.data.password).toBeUndefined()
    })
  })
})
