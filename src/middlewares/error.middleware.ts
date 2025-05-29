import { ErrorRequestHandler, NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { isPrismaError, jwt, serializePrismaError } from '../lib'
import response, { Res } from '../lib/response'

const serializeZodError = (err: ZodError) => {
  return Object.values(err.flatten().fieldErrors).flat().join('\n')
}

const errorHandler =
  () =>
  (
    err: ErrorRequestHandler,
    _req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    let e = response().error(500).message('Something went wrong').exec()

    if (err instanceof Res) e = err
    else if (isPrismaError(err)) {
      const { message, statusCode } = serializePrismaError(err)
      e = response().error(statusCode).message(message).exec()
    } else if (jwt.isJWTError(err)) {
      e = response()
        .error(401)
        .message((err as any).message)
        .exec()
    } else if (err instanceof ZodError) {
      const fieldError = serializeZodError(err)
      e = response().error(400).message(fieldError).exec()
    } else if (err instanceof Error)
      e = response().error(500).message(err.message).exec()

    const code = /duplicate/gi.test(e.error!.message.join('\n')) ? 409 : null

    e = response()
      .error(code || e.code)
      .message(e.error!.message)
      .exec()

    res.status(e.code).json(e)
  }

export default errorHandler
