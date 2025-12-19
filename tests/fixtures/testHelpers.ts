import { expect } from "vitest";
import type { TraceEntry } from "../../src/astGenerator.ts";

/**
 * Find trace entry by type
 */
export function findTraceByType(
  trace: Array<TraceEntry>,
  type: TraceEntry["type"]
): TraceEntry | undefined {
  return trace.find(t => t.type === type);
}

/**
 * Filter trace entries by type
 */
export function filterTracesByType(
  trace: Array<TraceEntry>,
  type: TraceEntry["type"]
): Array<TraceEntry> {
  return trace.filter(t => t.type === type);
}

/**
 * Get all trace types in order
 */
export function getTraceTypes(trace: Array<TraceEntry>): Array<TraceEntry["type"]> {
  return trace.map(t => t.type);
}

/**
 * Verify trace contains expected types in order
 */
export function assertTraceSequence(
  trace: Array<TraceEntry>,
  expectedTypes: Array<TraceEntry["type"]>
): void {
  const actualTypes = getTraceTypes(trace);
  const subsequence = actualTypes.filter(t => expectedTypes.includes(t));

  expect(subsequence).toEqual(expectedTypes);
}

/**
 * Count occurrences of trace type
 */
export function countTraceType(
  trace: Array<TraceEntry>,
  type: TraceEntry["type"]
): number {
  return filterTracesByType(trace, type).length;
}

/**
 * Assert trace contains type at least once
 */
export function assertTraceContains(
  trace: Array<TraceEntry>,
  type: TraceEntry["type"]
): void {
  const found = findTraceByType(trace, type);
  expect(found).toBeDefined();
}

/**
 * Assert trace does not contain type
 */
export function assertTraceNotContains(
  trace: Array<TraceEntry>,
  type: TraceEntry["type"]
): void {
  const found = findTraceByType(trace, type);
  expect(found).toBeUndefined();
}
