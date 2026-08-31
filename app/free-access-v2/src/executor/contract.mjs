import { createHash } from "node:crypto";
import { ValidationError } from "../errors.mjs";

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

export function normalizePSCRequest(request) {
  if (!request || typeof request !== "object" || Array.isArray(request)) {
    throw new ValidationError("request must be an object");
  }
  const prompt = typeof request.prompt === "string" ? request.prompt.trim() : "";
  if (!prompt) throw new ValidationError("request.prompt is required");
  if (prompt.length > 4_000) throw new ValidationError("request.prompt exceeds 4,000 characters");
  const context = request.context && typeof request.context === "object" && !Array.isArray(request.context)
    ? canonicalize(request.context)
    : {};
  return Object.freeze({ prompt, context });
}

export function canonicalRequestJson(request) {
  return JSON.stringify(canonicalize(normalizePSCRequest(request)));
}

export function requestHash(requestJson) {
  return createHash("sha256").update(requestJson).digest("hex");
}

export function validatePSCExecutionResult(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new ValidationError("PSCExecutionResult must be an object");
  }
  if (result.schemaVersion !== "psc-execution-result/v1") {
    throw new ValidationError("PSCExecutionResult.schemaVersion is invalid");
  }
  if (result.executionMode !== "mock") {
    throw new ValidationError("Only mock PSC execution results are accepted before core integration");
  }
  if (typeof result.executionId !== "string" || !result.executionId) {
    throw new ValidationError("PSCExecutionResult.executionId is required");
  }
  if (typeof result.inputHash !== "string" || !/^[a-f0-9]{64}$/.test(result.inputHash)) {
    throw new ValidationError("PSCExecutionResult.inputHash is invalid");
  }
  const reading = result.reading;
  if (!reading || typeof reading !== "object" || typeof reading.summary !== "string") {
    throw new ValidationError("PSCExecutionResult.reading.summary is required");
  }
  if (!Array.isArray(reading.signals) || !Array.isArray(reading.nextSteps)) {
    throw new ValidationError("PSCExecutionResult reading arrays are required");
  }
  return structuredClone(result);
}
