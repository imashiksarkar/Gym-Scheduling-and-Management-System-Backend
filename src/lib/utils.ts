import { faker } from '@faker-js/faker'

export const genRandomPass = () => faker.internet.password({ length: 12 })
