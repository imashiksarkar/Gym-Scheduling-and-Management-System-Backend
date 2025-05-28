import { STATUS_CODES } from 'node:http'

export class Res {
  success = false
  code = 500
  status = 'UNKNOWN'
  data?: Object | Array<unknown> = {}
  message?: string[] = []
  error?: {
    message: string[]
    fields?: {
      [key: string]: string[]
    }
  } = {
    message: [],
    fields: {},
  }
}

class Response {
  constructor(private readonly res: Res) {}

  static readonly new = () => {
    const { success, error } = new Response(new Res())

    return { success, error }
  }

  exec = () => {
    if (!this.res.success) delete this.res.data
    if (!this.res.message?.length) delete this.res.message

    if (this.res.success) {
      delete this.res.error
      return this.res
    }

    if (!Object.keys(this.res.error?.fields!).length)
      delete this.res.error?.fields
    if (!this.res.error?.message!.length) delete this.res.error

    return this.res
  }

  message = (msg: string | string[]) => {
    if (this.res.success) {
      if (typeof msg === 'string') this.res.message?.push(msg)
      else this.res.message?.push(...msg)
    } else {
      if (typeof msg === 'string') this.res.error?.message?.push(msg)
      else this.res.error?.message?.push(...msg)
    }

    const { data, message, fields, exec } = this

    return {
      data,
      message,
      fields,
      exec,
    }
  }

  data = (data: Object | Array<unknown>) => {
    this.res.data = data
    if (!this.res.success) this.res.data = {}

    const { message, exec } = this
    return { message, exec }
  }

  success = (code: number) => {
    this.res.success = true
    this.res.code = code
    this.res.status = STATUS_CODES[code] ?? 'Unknown'

    const { data, message, exec } = this
    return {
      data,
      message,
      exec,
    }
  }

  fields = (fields: { [key: string]: string[] }) => {
    this.res.error!.fields = fields

    const { message, exec } = this
    return { message, exec }
  }

  error = (code: number) => {
    this.res.success = false
    this.res.code = code
    this.res.status = STATUS_CODES[code] ?? 'Unknown'

    const { message, exec } = this
    return {
      message,
      exec,
    }
  }
}

export default Response.new
