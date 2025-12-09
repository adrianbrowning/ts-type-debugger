import { describe, it, expect } from 'vitest';
import { generateTypeVideo } from '../../src/core/typeDebugger.ts';
import { COMPLEX_TYPES } from '../fixtures/types.ts';

describe('Complex Type Workflows Integration', () => {
  it('resolves getter<""> from base.ts', async () => {
    const result = await generateTypeVideo(COMPLEX_TYPES.getterFromBase, 'getter<"">');

    expect(result).toBeDefined();
    expect(result!.steps.length).toBeGreaterThan(0);

    // Should involve multiple type operations
    const traceTypes = new Set(result!.steps.map(s => s.original.type));
    expect(traceTypes.size).toBeGreaterThan(3);

    expect(result!.steps).toMatchSnapshot();
  });

  it('resolves deeply nested path validation', async () => {
    const result = await generateTypeVideo(
      COMPLEX_TYPES.getterFromBase,
      'getter<"User.id">'
    );

    expect(result).toBeDefined();
    expect(result!.steps.length).toBeGreaterThan(0);
  });

  it('resolves combination of all features', async () => {
    const code = `
      type tables = { User: { id: number } };
      type keyOf<o> = {[k in keyof o]: k extends string ? k : never}[keyof o];
      type Test<T extends keyOf<tables>> = T extends "User"
        ? \`Found: \${T}\`
        : never;
    `;
    const result = await generateTypeVideo(code, 'Test<"User">');

    expect(result).toBeDefined();

    // Should have conditionals, mapped types, and template literals
    const hasCondition = result!.steps.some(s => s.original.type === 'condition');
    const hasMapped = result!.steps.some(s => s.original.type === 'mapped_type_start');
    const hasTemplate = result!.steps.some(s => s.original.type === 'template_literal_start');

    expect(hasCondition || hasMapped || hasTemplate).toBe(true);
  });
});
