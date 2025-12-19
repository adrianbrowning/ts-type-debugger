import type { VideoTraceStep, CallFrame } from "./types.ts";

// Trace types that represent "calls" in type evaluation
const CALL_STACK_TYPES = new Set([
  "type_alias_start",
  "generic_call",
  "generic_def",
]);

/**
 * Check if step index is within valid bounds
 */
function isValidStepRange(steps: Array<VideoTraceStep>, currentIndex: number): boolean {
  return steps.length > 0 && currentIndex >= 0 && currentIndex < steps.length;
}

/**
 * Pop stack frames that are deeper than current level
 */
function popStackToLevel(stack: Array<CallFrame>, level: number): void {
  while (stack.length > 0 && stack[stack.length - 1]!.level > level) {
    stack.pop();
  }
}

/**
 * Extract clean type name from expression (e.g., "TypeName" from "TypeName<args>")
 */
function extractFrameName(expression: string, traceType: string): string {
  if (traceType === "generic_call") {
    const match = /^(\w+)</.exec(expression);
    if (match?.[1]) return match[1];
  }
  return expression;
}

/**
 * Build call stack from trace steps up to current index
 * Only includes generic calls and type alias starts for cleaner stack
 */
export function buildCallStack(steps: Array<VideoTraceStep>, currentIndex: number): Array<CallFrame> {
  if (!isValidStepRange(steps, currentIndex)) {
    return [];
  }

  const stack: Array<CallFrame> = [];

  // Walk through steps up to currentIndex
  for (let i = 0; i <= currentIndex; i++) {
    const step = steps[i];
    if (!step) continue;
    const { original } = step;
    const level = original.level;

    popStackToLevel(stack, level);

    // Only include call-like types in the stack
    if (!CALL_STACK_TYPES.has(original.type)) {
      continue;
    }

    // Only push if we're going deeper (stack is empty or level is higher)
    // Don't replace frames at the same level
    if (stack.length === 0 || level > stack[stack.length - 1]!.level) {
      const line = original.position?.start.line;
      const name = extractFrameName(original.expression, original.type);
      stack.push({
        name,
        line,
        stepIndex: step.stepIndex,
        level,
      });
    }
  }

  return stack;
}
