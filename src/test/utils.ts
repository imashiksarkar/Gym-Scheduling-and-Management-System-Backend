import { faker } from '@faker-js/faker'
import { type Express } from 'express'
import request from 'supertest'

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

export const genRandomString = () => {
  return Math.random().toString(36).substring(2, 15)
}
