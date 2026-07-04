import { UnprocessableEntity } from './error.types.js'

export function validate(validators) {
  const list = Array.isArray(validators) ? validators : [validators]
  return async (req, _res, next) => {
    try {
      for (const v of list) {
        // eslint-disable-next-line no-await-in-loop
        await v(req)
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}

export function zodValidate(schema, source = 'body') {
  return (req, _res, next) => {
    const parsed = schema.safeParse(req[source])
    if (!parsed.success) {
      const details = formatZodIssues(parsed.error)
      next(new UnprocessableEntity('Validation failed', details))
      return
    }
    req[source] = parsed.data
    next()
  }
}

function formatZodIssues(error) {
  return error.issues.map((issue) => ({
    path: issue.path.length ? issue.path.join('.') : undefined,
    message: issue.message,
  }))
}
