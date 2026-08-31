// TEST-ONLY interface specimen, never a runtime checkout or payment adapter.
// Its one-second clock bound exists only to qualify expiry without a live provider.
import { randomUUID } from "node:crypto";
import { validateCheckoutAttempt, validatePaymentCompletion } from "../../src/commerce/contract.mjs";

export class SyntheticCommerceFixture {
  #attempts = new Map();
  #clock;
  #counters;
  constructor({ clock, counters }) { this.#clock = clock; this.#counters = counters; }
  get size() { return this.#attempts.size; }
  create(input) {
    const admitted = validateCheckoutAttempt(input);
    const checkout_attempt_id = randomUUID();
    this.#attempts.set(checkout_attempt_id, { ...admitted, expiresAt: this.#clock.now() + 1_000, completed: false });
    this.#counters.increment("checkout_attempt_created");
    return Object.freeze({ checkout_attempt_id });
  }
  complete(input) {
    const { checkout_attempt_id } = validatePaymentCompletion(input);
    const attempt = this.#attempts.get(checkout_attempt_id);
    if (!attempt || this.#clock.now() >= attempt.expiresAt) {
      this.#attempts.delete(checkout_attempt_id);
      throw new Error("Synthetic attempt is unavailable");
    }
    if (attempt.completed) return false;
    attempt.completed = true;
    this.#counters.increment("payment_completed");
    return true;
  }
  close() { this.#attempts.clear(); }
}
