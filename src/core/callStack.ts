import type { VideoTraceStep, CallFrame } from './types.ts';

// Trace types that represent "calls" in type evaluation
const CALL_STACK_TYPES = new Set([
  'type_alias_start',
  'generic_call',
  'generic_def',
]);

/**
 * Build call stack from trace steps up to current index
 * Only includes generic calls and type alias starts for cleaner stack
 */
export function buildCallStack(steps: VideoTraceStep[], currentIndex: number): CallFrame[] {
  if (steps.length === 0 || currentIndex < 0 || currentIndex >= steps.length) {
    return [];
  }

  const stack: CallFrame[] = [];

  // Walk through steps up to currentIndex
  for (let i = 0; i <= currentIndex; i++) {
    const step = steps[i];
    const { original } = step;
    const level = original.level;

    // Pop frames that are deeper than current level
    while (stack.length > 0 && stack[stack.length - 1].level > level) {
      stack.pop();
    }

    // Only include call-like types in the stack
    if (!CALL_STACK_TYPES.has(original.type)) {
      continue;
    }

    // Only push if we're going deeper (stack is empty or level is higher)
    // Don't replace frames at the same level
    if (stack.length === 0 || level > stack[stack.length - 1].level) {
      const line = original.position?.start.line;
      // Extract just the type name for cleaner display
      let name = original.expression;
      if (original.type === 'generic_call') {
        // Extract type name from "TypeName<args>"
        const match = name.match(/^(\w+)</);
        if (match) name = match[1];
      }
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
