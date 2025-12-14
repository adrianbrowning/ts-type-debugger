import type { VideoTraceStep, CallFrame } from './types.ts';

/**
 * Build call stack from trace steps up to current index
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

    // Only push if we're going deeper (stack is empty or level is higher)
    // Don't replace frames at the same level
    if (stack.length === 0 || level > stack[stack.length - 1].level) {
      const line = original.position?.start.line;
      stack.push({
        name: original.expression,
        line,
        stepIndex: step.stepIndex,
        level,
      });
    }
  }

  return stack;
}
