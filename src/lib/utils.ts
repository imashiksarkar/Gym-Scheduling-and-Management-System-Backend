import { randomBytes } from 'node:crypto'

export const genRandomPass = () => 'Ab@9' + randomBytes(4).toString('hex')
