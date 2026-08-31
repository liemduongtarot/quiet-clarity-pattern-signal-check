// Pure admission firewall. There is no checkout/payment provider or runtime store.
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function keysOfPlainRecord(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Commerce request is not allowed");
  }
  const prototype = Object.getPrototypeOf(input);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError("Commerce request is not allowed");
  }
  const descriptors = Object.getOwnPropertyDescriptors(input);
  const keys = Reflect.ownKeys(descriptors);
  const values = Object.create(null);
  for (const key of keys) {
    if (typeof key !== "string" || !Object.hasOwn(descriptors[key], "value")) {
      throw new TypeError("Commerce request is not allowed");
    }
    values[key] = descriptors[key].value;
  }
  return { keys, values };
}

export function validateCheckoutAttempt(input) {
  const { keys, values } = keysOfPlainRecord(input);
  if (keys.some((key) => key !== "variant") || keys.length > 1) {
    throw new TypeError("Commerce request is not allowed");
  }
  if (keys.length === 0) return Object.freeze({});
  const variant = values.variant;
  if (variant !== "A" && variant !== "B") {
    throw new TypeError("Commerce request is not allowed");
  }
  return Object.freeze({ variant });
}

export function validatePaymentCompletion(input) {
  const { keys, values } = keysOfPlainRecord(input);
  const id = values.checkout_attempt_id;
  if (keys.length !== 1 || keys[0] !== "checkout_attempt_id"
      || typeof id !== "string" || !UUID_V4.test(id)) {
    throw new TypeError("Commerce request is not allowed");
  }
  return Object.freeze({ checkout_attempt_id: id });
}
