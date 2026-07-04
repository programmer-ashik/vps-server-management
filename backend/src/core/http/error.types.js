export class HttpError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export class BadRequest extends HttpError {
  constructor(message = "Bad Request", details) {
    super(400, message, "BAD_REQUEST", details);
  }
}

export class Unauthorized extends HttpError {
  constructor(message = "Unauthorized", details) {
    super(401, message, "UNAUTHORIZED", details);
  }
}

export class Forbidden extends HttpError {
  constructor(message = "Forbidden", details) {
    super(403, message, "FORBIDDEN", details);
  }
}

export class NotFound extends HttpError {
  constructor(message = "Not Found", details) {
    super(404, message, "NOT_FOUND", details);
  }
}

export class Conflict extends HttpError {
  constructor(message = "Conflict", details) {
    super(409, message, "CONFLICT", details);
  }
}

export class UnprocessableEntity extends HttpError {
  constructor(message = "Validation failed", details) {
    super(422, message, "UNPROCESSABLE_ENTITY", details);
  }
}
