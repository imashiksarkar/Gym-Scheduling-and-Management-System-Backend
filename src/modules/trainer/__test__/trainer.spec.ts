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
    const { at: traineeAT } = await createTrainee(app)

    const createdTrainer = await createTrainer(app)

    const trainer = await request(app)
      .get(`/trainers/${createdTrainer.body.data.id}`)
      .set('Cookie', traineeAT)

    expect(trainer.body.success).toBe(true)
    expect(trainer.body.data.id).toBeDefined()
  })

  it('list trainer schedules', async () => {
    const { at: adminAT } = await createAdmin(app)
    const { at: traineeAT } = await createTrainee(app)

    const {
      body: {
        data: { id: trainerId },
      },
    } = await createTrainer(app)

    await createSchedule(app, adminAT, trainerId, 4)

    const trainerSchedules = await request(app)
      .get(`/trainers/${trainerId}/schedules`)
      .set('Cookie', traineeAT)

    expect(trainerSchedules.body.success).toBe(true)
    expect(trainerSchedules.body.data).toHaveLength(4)
  })

  describe('Role: Trainer', () => {
    it('get own schedules as trainer', async () => {
      const { at: adminAT } = await createAdmin(app)

      const { body: trainer, at: traineeAT } = await signinAsTrainer(app)
      const trainerId = trainer.data.id

      await createSchedule(app, adminAT, trainerId, 4)

      const trainerSchedules = await request(app)
        .get(`/trainers/schedules`)
        .set('Cookie', traineeAT)

      console.log(trainerSchedules.body)

      // expect(trainerSchedules.body.success).toBe(true)
      // expect(trainerSchedules.body.data).toHaveLength(4)
    })
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
