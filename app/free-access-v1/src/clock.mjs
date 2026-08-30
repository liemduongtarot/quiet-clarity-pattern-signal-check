export class SystemClock {
  now() {
    return Date.now();
  }
}

export class ManualClock {
  #current;

  constructor(initial = Date.parse("2026-01-01T00:00:00.000Z")) {
    this.#current = initial;
  }

  now() {
    return this.#current;
  }

  set(value) {
    this.#current = value instanceof Date ? value.getTime() : Number(value);
  }

  advance(milliseconds) {
    this.#current += milliseconds;
  }
}
