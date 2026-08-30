import {
  AuthenticationError,
  CrashSignal,
  ExecutionError,
  IdempotencyCollisionError,
  PersistenceError,
  QuotaExceededError,
  RateLimitError,
  RequestInProgressError,
  ValidationError,
} from "../errors.mjs";
import {
  canonicalRequestJson,
  normalizePSCRequest,
  requestHash,
  validatePSCExecutionResult,
} from "../executor/contract.mjs";

function requireIdentity(identity) {
  if (!identity?.userId || !identity?.email || identity.emailVerified !== true) {
    throw new AuthenticationError();
  }
  return identity;
}

function requireIdempotencyKey(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9._:-]{8,128}$/.test(value)) {
    throw new ValidationError("Idempotency-Key must contain 8-128 safe characters");
  }
  return value;
}

export class FreeAccessService {
  #store;
  #executor;
  #policy;
  #clock;

  constructor({ store, executor, policy, clock }) {
    this.#store = store;
    this.#executor = executor;
    this.#policy = policy;
    this.#clock = clock;
  }

  get executorMetrics() {
    return this.#executor.metrics;
  }

  async createReading({ identity, idempotencyKey, request, faults = {} }) {
    requireIdentity(identity);
    requireIdempotencyKey(idempotencyKey);
    const normalizedRequest = normalizePSCRequest(request);
    const requestJson = canonicalRequestJson(normalizedRequest);
    const hash = requestHash(requestJson);
    const reservedAt = this.#clock.now();

    const reservation = this.#store.reserve({
      identity,
      idempotencyKey,
      requestHash: hash,
      requestJson,
      now: reservedAt,
      policy: this.#policy,
    });

    if (reservation.kind === "replay") {
      return { reading: reservation.reading, quota: reservation.quota, replayed: true };
    }
    if (reservation.kind === "in_progress") {
      throw new RequestInProgressError(reservation.reservationId);
    }
    if (reservation.kind === "quota_exhausted") {
      throw new QuotaExceededError(reservation.quota);
    }
    if (reservation.kind === "rate_limited") {
      throw new RateLimitError(reservation.retryAfterMs);
    }

    let committed = false;
    try {
      await faults.afterReserve?.({ reservationId: reservation.reservationId });

      let rawResult;
      try {
        rawResult = await this.#executor.executePSC(normalizedRequest);
      } catch (error) {
        if (error instanceof CrashSignal) throw error;
        throw error instanceof ExecutionError ? error : new ExecutionError(error.message);
      }

      await faults.afterExecute?.({ reservationId: reservation.reservationId, result: rawResult });

      let result;
      try {
        result = validatePSCExecutionResult(rawResult);
      } catch (error) {
        throw new ExecutionError(`Mock executor returned an unusable result: ${error.message}`);
      }

      await faults.beforePersist?.({ reservationId: reservation.reservationId, result });
      const committedResult = this.#store.persistAndCommit({
        reservationId: reservation.reservationId,
        result,
        now: this.#clock.now(),
        policy: this.#policy,
        beforeCommit: faults.beforeCommit,
      });
      committed = true;

      await faults.afterCommit?.({
        reservationId: reservation.reservationId,
        reading: committedResult.reading,
      });
      return committedResult;
    } catch (error) {
      if (!committed && !(error instanceof CrashSignal)) {
        this.#store.releaseReservation({
          reservationId: reservation.reservationId,
          failureCode: error.code ?? "SYSTEM_FAILURE",
          now: this.#clock.now(),
        });
      }
      if (
        error instanceof CrashSignal
        || error instanceof ExecutionError
        || error instanceof PersistenceError
        || error instanceof QuotaExceededError
        || error instanceof IdempotencyCollisionError
      ) {
        throw error;
      }
      throw new PersistenceError(error.message);
    }
  }

  quota(identity) {
    requireIdentity(identity);
    return this.#store.getQuota({
      userId: identity.userId,
      now: this.#clock.now(),
      policy: this.#policy,
    });
  }

  history(identity) {
    requireIdentity(identity);
    return this.#store.listReadings(identity.userId);
  }

  reopen(identity, readingId) {
    requireIdentity(identity);
    if (!readingId) throw new ValidationError("readingId is required");
    return this.#store.getReading(identity.userId, readingId);
  }

  recoverStaleReservations() {
    return this.#store.recoverStaleReservations(this.#clock.now());
  }
}
