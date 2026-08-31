import { createHash } from "node:crypto";
import { canonicalRequestJson } from "./contract.mjs";
import { ExecutionError } from "../errors.mjs";

function stableId(input) {
  return createHash("sha256").update(input).digest("hex");
}

export class MockPSCExecutor {
  #behavior;
  #clock;
  #mockExecutions = 0;

  constructor({ clock, behavior } = {}) {
    this.#clock = clock ?? { now: () => Date.now() };
    this.#behavior = behavior;
  }

  get metrics() {
    return Object.freeze({ mockExecutions: this.#mockExecutions, livePscExecutions: 0 });
  }

  async executePSC(request) {
    this.#mockExecutions += 1;
    const sequence = this.#mockExecutions;

    if (this.#behavior) {
      const controlled = await this.#behavior({ request, sequence });
      if (controlled instanceof Error) throw controlled;
      if (controlled !== undefined) return controlled;
    }

    const requestJson = canonicalRequestJson(request);
    const inputHash = stableId(requestJson);
    const promptWords = request.prompt.trim().split(/\s+/).filter(Boolean);
    if (!promptWords.length) throw new ExecutionError();

    return {
      schemaVersion: "psc-execution-result/v1",
      executionMode: "mock",
      executionId: `mock-${stableId(`${requestJson}:${sequence}`).slice(0, 24)}`,
      inputHash,
      generatedAt: new Date(this.#clock.now()).toISOString(),
      reading: {
        summary: `Mock pattern reading for: ${request.prompt.trim()}`,
        signals: [
          { label: "pattern", strength: (parseInt(inputHash.slice(0, 2), 16) % 5) + 1 },
          { label: "clarity", strength: (parseInt(inputHash.slice(2, 4), 16) % 5) + 1 },
        ],
        nextSteps: [
          "Name the smallest observable next action.",
          "Recheck the pattern after new evidence arrives.",
        ],
        disclaimer: "Deterministic mock result; no live PSC inference was performed.",
      },
    };
  }
}
