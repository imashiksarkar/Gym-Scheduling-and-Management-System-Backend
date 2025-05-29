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
  })
})
