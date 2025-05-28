import argon2 from 'argon2'

export default class Hashing {
  static hash = async (input: string) => {
    return await argon2.hash(input)
  }

  static async verify(data: string, hashed: string) {
    return await argon2.verify(hashed, data)
  }
}
