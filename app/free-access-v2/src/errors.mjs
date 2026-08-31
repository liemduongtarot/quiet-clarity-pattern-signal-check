// Public messages are selected by code; dependency messages and stacks never leave this boundary.
const PUBLIC_ERRORS = Object.freeze({
  VALIDATION_ERROR: [400, "The request is invalid"],
  QUOTA_TOKEN_INVALID: [400, "The Free allowance token is invalid. Clear this site's token to begin again."],
  EXECUTION_RECEIPT_INVALID: [400, "The execution receipt is invalid or belongs to a previous server session"],
  EXECUTION_RECEIPT_EXPIRED: [410, "The short-lived execution receipt has expired"],
  IDEMPOTENCY_COLLISION: [409, "The execution receipt is already bound to a different request"],
  REQUEST_IN_PROGRESS: [409, "This execution is still in progress. Retry the same receipt."],
  QUOTA_EXHAUSTED: [429, "The Free allowance is exhausted for this browser cycle"],
  CAPACITY_EXCEEDED: [503, "The service is temporarily at capacity"],
  EXECUTION_FAILED: [503, "The mock executor could not produce a usable result"],
  EXECUTION_TIMEOUT: [504, "The execution deadline expired without a committed result"],
  RESPONSE_NOT_ISSUED: [503, "The result response was not issued. Retry the same receipt."],
  PERSISTENCE_FAILED: [503, "Aggregate storage is unavailable"],
  ORIGIN_REJECTED: [403, "A same-origin request is required"],
  TRANSPORT_REQUIRED: [403, "Encrypted transport is required"],
  MEDIA_TYPE_REJECTED: [415, "An application/json request body is required"],
  NOT_FOUND: [404, "Route not found"],
  INTERNAL_ERROR: [500, "An internal error occurred"],
});

export class AppError extends Error {
  constructor(code = "INTERNAL_ERROR") {
    const selected = Object.hasOwn(PUBLIC_ERRORS, code) ? code : "INTERNAL_ERROR";
    super(PUBLIC_ERRORS[selected][1]);
    this.name = this.constructor.name;
    this.code = selected;
    this.status = PUBLIC_ERRORS[selected][0];
  }
}

export class ValidationError extends AppError { constructor() { super("VALIDATION_ERROR"); } }
export class QuotaTokenError extends AppError { constructor() { super("QUOTA_TOKEN_INVALID"); } }
export class ReceiptError extends AppError { constructor(expired = false) { super(expired ? "EXECUTION_RECEIPT_EXPIRED" : "EXECUTION_RECEIPT_INVALID"); } }
export class QuotaExceededError extends AppError { constructor(quota) { super("QUOTA_EXHAUSTED"); this.quota = quota; } }
export class IdempotencyCollisionError extends AppError { constructor() { super("IDEMPOTENCY_COLLISION"); } }
export class RequestInProgressError extends AppError { constructor() { super("REQUEST_IN_PROGRESS"); this.retryAfterMs = 1000; } }
export class CapacityError extends AppError { constructor() { super("CAPACITY_EXCEEDED"); } }
export class ExecutionError extends AppError { constructor() { super("EXECUTION_FAILED"); } }
export class ExecutionTimeoutError extends AppError { constructor() { super("EXECUTION_TIMEOUT"); } }
export class ResponseNotIssuedError extends AppError { constructor() { super("RESPONSE_NOT_ISSUED"); } }
export class PersistenceError extends AppError { constructor() { super("PERSISTENCE_FAILED"); } }

export function publicError(error) {
  const code = error instanceof AppError && Object.hasOwn(PUBLIC_ERRORS, error.code) ? error.code : "INTERNAL_ERROR";
  const [status, message] = PUBLIC_ERRORS[code];
  return { status, error: { code, message }, retryAfterMs: code === "REQUEST_IN_PROGRESS" ? 1000 : undefined };
}
