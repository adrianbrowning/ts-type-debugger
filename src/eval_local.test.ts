import { describe, it, expect } from 'vitest';
import { checkTypeCondition, evalTypeString } from './eval_local.ts';

describe('Type Condition Checking', () => {
  it('checks string literal extends string (true)', async () => {
    const result = await checkTypeCondition('"hello"', 'string');
    expect(result).toBe(true);
  });

  it('checks number extends string (false)', async () => {
    const result = await checkTypeCondition('number', 'string');
    expect(result).toBe(false);
  });

  it('checks complex object shapes', async () => {
    const result = await checkTypeCondition(
      '{ id: number; name: string }',
      '{ id: number }'
    );
    expect(result).toBe(true);
  });

  it('checks union extends type', async () => {
    const result = await checkTypeCondition('string | number', 'string');
    expect(result).toBe(false); // Union doesn't extend string
  });
});

describe('Type String Evaluation', () => {
  it('reduces simple union', async () => {
    const result = await evalTypeString('1 | 2 | 2');
    expect(result).toBe('1 | 2');
  });

  it('removes never from union', async () => {
    const result = await evalTypeString('1 | never');
    expect(result).toBe('1');
  });

  it('evaluates numeric literal unions', async () => {
    const result = await evalTypeString('1 | 2 | 3');
    expect(result).toBe('1 | 2 | 3');
  });

  it('evaluates template literal result', async () => {
    const result = await evalTypeString('`prefix_${"a" | "b"}`');
    expect(result).toContain('prefix_');
  });
});
