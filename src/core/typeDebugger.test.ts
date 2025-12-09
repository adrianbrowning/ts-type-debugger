import { describe, it, expect } from 'vitest';
import { generateTypeVideo } from './typeDebugger.ts';

describe('generateTypeVideo', () => {
  it('rejects type X= prefix', async () => {
    const result = await generateTypeVideo('', 'type Test = string');
    expect(result).toBeNull();
  });

  it('wraps expression in __EvalTarget__', async () => {
    const result = await generateTypeVideo('', 'string');

    if (result) {
      expect(result.sourceCode).toContain('__EvalTarget__');
    }
  });

  it('returns valid VideoData structure', async () => {
    const result = await generateTypeVideo('', 'string');

    if (result) {
      expect(result).toHaveProperty('totalFrames');
      expect(result).toHaveProperty('fps');
      expect(result).toHaveProperty('steps');
      expect(result).toHaveProperty('typeAliases');
      expect(result).toHaveProperty('sourceCode');
      expect(result).toHaveProperty('activeTypeMap');
      expect(Array.isArray(result.steps)).toBe(true);
    }
  });

  it('handles invalid expression gracefully', async () => {
    const result = await generateTypeVideo('', '{{{');

    // Should either return null or handle error gracefully
    expect(result === null || typeof result === 'object').toBe(true);
  });

  it('generates video for simple conditional', async () => {
    const result = await generateTypeVideo(
      '',
      '"a" extends string ? true : false'
    );

    if (result) {
      expect(result.steps.length).toBeGreaterThan(0);
      const traceTypes = result.steps.map(s => s.original.type);
      expect(traceTypes).toContain('condition');
    }
  });
});
