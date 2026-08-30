export class AppError extends Error {
  constructor(code, message, status = 500, details = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "A verified user identity is required") {
    super("AUTHENTICATION_REQUIRED", message, 401);
  }
}

export class ValidationError extends AppError {
  constructor(message, details) {
    super("VALIDATION_ERROR", message, 400, details);
  }
}

export class QuotaExceededError extends AppError {
  constructor(quota) {
    super("QUOTA_EXHAUSTED", "Free Access quota is exhausted for the active cycle", 429, { quota });
    this.quota = quota;
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfterMs) {
    super("RATE_LIMITED", "Too many reading attempts", 429, { retryAfterMs });
    this.retryAfterMs = retryAfterMs;
  }
}

export class IdempotencyCollisionError extends AppError {
  constructor() {
    super("IDEMPOTENCY_COLLISION", "The idempotency key is already bound to a different request", 409);
  }
}

export class RequestInProgressError extends AppError {
  constructor(reservationId) {
    super("REQUEST_IN_PROGRESS", "An equivalent request is already in progress", 409, { reservationId });
    this.reservationId = reservationId;
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Reading") {
    super("NOT_FOUND", `${resource} was not found`, 404);
  }
}

export class ExecutionError extends AppError {
  constructor(message = "The mock executor could not produce a usable result") {
    super("EXECUTION_FAILED", message, 503);
  }
}

export class PersistenceError extends AppError {
  constructor(message = "The reading could not be persisted") {
    super("PERSISTENCE_FAILED", message, 503);
  }
}

export class CrashSignal extends Error {
  constructor(boundary) {
    super(`Simulated process crash at ${boundary}`);
    this.name = "CrashSignal";
    this.boundary = boundary;
  }
}
