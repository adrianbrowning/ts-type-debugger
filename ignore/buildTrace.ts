import { TypeEvaluator } from './evaluator.ts';
import type { TraceStep } from './evaluator.ts';

export async function buildTrace(
  expression: string,
  options: { customTypes: string }
): Promise<{ trace: TraceStep[]; finalResult: string }> {
  const evaluator = new TypeEvaluator(options.customTypes);
  const trace = evaluator.evaluate(expression);

  // For now, use expression as final result
  // This will be improved to track actual evaluation result
  const finalResult = expression;

  return {
    trace,
    finalResult,
  };
}
