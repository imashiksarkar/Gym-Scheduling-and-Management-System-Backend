import { Prisma } from '@prisma/client'

export const isPrismaError = (err: any): boolean => {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError ||
    err instanceof Prisma.PrismaClientUnknownRequestError ||
    err instanceof Prisma.PrismaClientValidationError ||
    err instanceof Prisma.PrismaClientInitializationError ||
    err instanceof Prisma.PrismaClientRustPanicError
  )
}

const serializePrismaError = (err: any) => {
  let statusCode = 500
  let message = 'Prisma Error!'

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409
        message =
          'Duplicate value: ' + ((err.meta?.target as any)?.join(', ') || '')
        break
      case 'P2025':
        statusCode = 404
        message = 'Requested record not found'
        break
      default:
        message = err.message
    }
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    message = 'An unknown database error occurred'
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    message = err.message
    statusCode = 400
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    message = 'Failed to initialize Prisma client'
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    message = 'A fatal error occurred in Prisma engine'
  }

  return { statusCode, message }
}

export default serializePrismaError
