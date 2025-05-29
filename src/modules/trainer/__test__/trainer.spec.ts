import request from 'supertest'
import { describe, expect, it } from 'vitest'
import getAppInstance from '../../../app'
import { createAdmin, createTrainer, getUserCred } from '../../../test/utils'

describe('Trainer Module', async () => {
  const app = await getAppInstance()

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

    const trainers = await request(app)
      .get('/trainers')
      .set('Cookie', adminAT)
      .expect(200)

    expect(trainers.body.success).toBe(true)
    expect(trainers.body.data).toBeDefined()
    expect(trainers.body.data).toHaveLength(trainersLength)
    expect(trainers.body.data.password).toBeUndefined()
  })

  it('should be able to a single trainer', async () => {
    const { at: adminAT } = await createAdmin(app)

    const createdTrainer = await createTrainer(app)

    const trainer = await request(app)
      .get(`/trainers/${createdTrainer.body.data.id}`)
      .set('Cookie', adminAT)

    expect(trainer.body.success).toBe(true)
    expect(trainer.body.data.id).toBeDefined()
  })

  describe('Role: Admin', () => {
    it('should be able to create a trainer', async () => {
      const { at: adminAT } = await createAdmin(app)

      const trainer = await request(app)
        .post('/trainers')
        .set('Cookie', adminAT)
        .send(getUserCred())

      expect(trainer.body.success).toBe(true)

      expect(trainer.body.data).toBeDefined()
      expect(trainer.body.data.password).toBeDefined()
    })

    it('should be able to delete a trainer', async () => {
      const { at: adminAT } = await createAdmin(app)

      // create 2 trainers
      const trainer = await request(app)
        .post('/trainers')
        .set('Cookie', adminAT)
        .send(getUserCred())
        .expect(201)
      await request(app)
        .post('/trainers')
        .set('Cookie', adminAT)
        .send(getUserCred())
        .expect(201)

      // get all trainers
      const trainers = await request(app)
        .get('/trainers')
        .set('Cookie', adminAT)
        .expect(200)

      expect(trainers.body.success).toBe(true)
      expect(trainers.body.data).toBeDefined()
      expect(trainers.body.data).toHaveLength(2)
      expect(trainers.body.data.password).toBeUndefined()

      const deletedTrainer = await request(app)
        .delete(`/trainers/${trainer.body.data.id}`)
        .set('Cookie', adminAT)

      expect(deletedTrainer.body.success).toBe(true)
      expect(deletedTrainer.body.data).toBeDefined()
      expect(deletedTrainer.body.data.password).toBeUndefined()

      // get all trainers
      const trainers2 = await request(app)
        .get('/trainers')
        .set('Cookie', adminAT)
        .expect(200)

      expect(trainers2.body.success).toBe(true)
      expect(trainers2.body.data).toBeDefined()
      expect(trainers2.body.data).toHaveLength(1)
      expect(trainers2.body.data.password).toBeUndefined()
    })
  })
})
