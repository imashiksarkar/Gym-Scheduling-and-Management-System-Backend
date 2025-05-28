import { faker } from '@faker-js/faker'

export const getUserCred = () => ({
  name: faker.person.fullName(),
  email: faker.internet.email(),
  password: 'Aa@6mk',
})

// export const createAdminUser = async () => {
//   const user = await request(await getApp)
//     .post('/auth/signup')
//     .send({ ...pokimonCred, email: `pokimin${genRandomString()}@gmail.com` })
//     .expect(201)

//   const email = user.body.data.email

//   await AuthService.changeRole({
//     email,
//     role: UserRole.admin,
//   })

//   const admin = await request(await getApp)
//     .post('/auth/signin')
//     .send({ ...pokimonCred, email })

//   const [adminAT, adminRT] = admin.headers['set-cookie']

//   return [admin.body, adminAT, adminRT]
// }

// export const createUser = async () => {
//   const user = await request(await getApp)
//     .post('/auth/signup')
//     .send({ ...pokimonCred, email: `pokimin${genRandomString()}@gmail.com` })

//   const [userAT, userRT] = user.headers['set-cookie']

//   return [user.body, userAT, userRT]
// }

export const genRandomString = () => {
  return Math.random().toString(36).substring(2, 15)
}
