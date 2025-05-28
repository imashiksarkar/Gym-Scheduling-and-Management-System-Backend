import getAppInstance from '@src/app'
import { getUserCred } from '@src/test/utils'
import request from 'supertest'
import { describe, expect, it } from 'vitest'

describe('auth', async () => {
  const app = await getAppInstance()

  describe('Role: Trainee', () => {
    it('should be able to signup', async () => {
      const userPayload = getUserCred()

      const user = await request(app).post('/auth/signup').send(userPayload)

      expect(user.body.data.email).toBe(userPayload.email)
      expect(user.body.data.password).toBeUndefined()
      expect(user.headers['set-cookie']).toHaveLength(2)
    })

    it('should be able to signin', async () => {
      const userPayload: Partial<ReturnType<typeof getUserCred>> = getUserCred()
      await request(app).post('/auth/signup').send(userPayload).expect(201)

      delete userPayload.name
      const signedInUser = await request(app)
        .post('/auth/signin')
        .send(userPayload)

      expect(signedInUser.body.success).toBe(true)
      expect(signedInUser.headers['set-cookie']).toHaveLength(2)
      expect(signedInUser.body.data.email).toBe(userPayload.email)
      expect(signedInUser.body.data.password).toBeUndefined()
    })

    // it('should not be able to signin with wrong password', async () => {
    //   await request(app).post('/auth/signup').send(pokominCred).expect(201)

    //   const res = await request(app).post('/auth/signin').send({
    //     email: pokominCred.email,
    //     password: 'A5shiklngya', // wrong password
    //   })

    //   expect(res.body.success).toBe(false)
    //   expect(res.body.error.message[0]).toMatch(/invalid/gi)
    // })

    // it('should be able to signout', async () => {
    //   const user = await request(app)
    //     .post('/auth/signup')
    //     .send(pokominCred)
    //     .expect(201)
    //   const [_, refreshToken] = user.headers['set-cookie']

    //   const res = await request(app)
    //     .delete('/auth/signout')
    //     .set('Cookie', refreshToken)
    //     .expect(200)

    //   expect(res.headers['set-cookie']).toEqual([
    //     'accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    //     'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    //   ])
    // })

    // it('should return all roles', async () => {
    //   const res = await request(app)
    //     .get('/auth/roles')
    //     .send(pokominCred)
    //     .expect(200)
    //   console.log('Here are all the allowed roles', res.body.data)
    // })

    // it('lets user to refresh token', async () => {
    //   const user = await request(app)
    //     .post('/auth/signup')
    //     .send(pokominCred)
    //     .expect(201)

    //   const [_, refreshToken] = user.headers['set-cookie']

    //   const res = await request(app)
    //     .post('/auth/refresh')
    //     .set('Cookie', refreshToken)

    //   expect(res.body.success).toBe(true)
    // })

    // it('should be able to fetch own profile', async () => {
    //   // create user
    //   const user = await request(app)
    //     .post('/auth/signup')
    //     .send(pokominCred)
    //     .expect(201)
    //   const [userAT] = user.headers['set-cookie']

    //   // fetch own profile
    //   const profile = await request(app)
    //     .get('/auth/profile')
    //     .set('Cookie', userAT)

    //   expect(profile.body.success).toBe(true)
    //   expect(profile.body.data.id).toBeDefined()
    // })
  })

  // describe('Role: Admin', () => {
  //   it('should be able to fetch all users', async () => {
  //     // signup a user
  //     const user = await request(app)
  //       .post('/auth/signup')
  //       .send(pokominCred)
  //       .expect(201)

  //     await request(app)
  //       .post('/auth/signup')
  //       .send({ ...pokominCred, email: 'pokimin2@gmail.com' })
  //       .expect(201)

  //     // make the user admin using service
  //     await authService.changeRole({
  //       email: user.body.data.email,
  //       role: UserRole.admin,
  //     })

  //     // signin as admin
  //     const admin = await request(app)
  //       .post('/auth/signin')
  //       .send(pokominCred)
  //       .expect(200)
  //     const [adminAT] = admin.headers['set-cookie']

  //     // fetch all users as admin
  //     const users = await request(app).get('/auth/users').set('Cookie', adminAT)

  //     expect(users.body.success).toBe(true)
  //     expect(users.body.data.length).toBe(2)
  //   })

  //   it('should be able to fetch a single user', async () => {
  //     // signup a user
  //     const user = await request(app)
  //       .post('/auth/signup')
  //       .send(pokominCred)
  //       .expect(201)

  //     // make the user admin using service
  //     await authService.changeRole({
  //       email: user.body.data.email,
  //       role: UserRole.admin,
  //     })

  //     // signin as admin
  //     const admin = await request(app)
  //       .post('/auth/signin')
  //       .send(pokominCred)
  //       .expect(200)
  //     const [adminAT] = admin.headers['set-cookie']

  //     // fetch all users as admin
  //     const users = await request(app)
  //       .get(`/auth/users/${user.body.data.id}`)
  //       .set('Cookie', adminAT)

  //     expect(users.body.success).toBe(true)
  //     expect(users.body.data.id).toBeDefined()
  //   })
  // })
})
