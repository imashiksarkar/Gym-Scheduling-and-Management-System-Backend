import { faker } from '@faker-js/faker'
import { UserRole } from '@prisma/client'
import { SignupUserDto } from '@src/modules/auth/auth.dtos'
import authService from '@src/modules/auth/auth.service'
import { type Express } from 'express'
import request from 'supertest'

export const getSchedulePayload = (trainerId: string) => ({
  startsAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  title: faker.lorem.word(),
  trainerId,
})

export const getUserCred = () => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: 'Aa@6mk',
})

export const createTrainee = async (app: Express) => {
  const userPayload: Partial<ReturnType<typeof getUserCred>> = getUserCred()
  const res = await request(app).post('/auth/signup').send(userPayload)

  return {
    userPayload,
    body: res.body,
    at: res.headers['set-cookie'][0],
    rt: res.headers['set-cookie'][1],
  }
}

export const signinUser = async (app: Express, userPayload: SignupUserDto) => {
  const res = await request(app).post('/auth/signin').send(userPayload)

  return {
    userPayload,
    body: res.body,
    at: res.headers['set-cookie'][0],
    rt: res.headers['set-cookie'][1],
  }
}

export const createAdmin = async (app: Express) => {
  // signup a user
  const { userPayload } = await createTrainee(app)

  // make the user admin using service
  await authService.changeRole({
    email: userPayload.email!,
    role: UserRole.admin,
  })

  // signin as admin
  const admin = await request(app)
    .post('/auth/signin')
    .send(userPayload)
    .expect(200)

  const [adminAT, adminRT] = admin.headers['set-cookie']

  return {
    userPayload,
    body: admin.body,
    at: adminAT,
    rt: adminRT,
  }
}

export const createTrainer = async (app: Express) => {
  const { at: adminAT } = await createAdmin(app)

  const trainer = await request(app)
    .post('/trainers')
    .set('Cookie', adminAT)
    .send(getUserCred())

  return {
    body: trainer.body,
  }
}

export const genRandomPass = () => faker.internet.password({ length: 12 })
