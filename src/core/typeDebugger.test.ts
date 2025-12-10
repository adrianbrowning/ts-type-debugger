import { describe, it, expect } from 'vitest';
import { generateTypeVideo } from './typeDebugger.ts';

describe('generateTypeVideo', () => {
  it('rejects type X= prefix', async () => {
    // Act
    const result = await generateTypeVideo('', 'type Test = string');

    // Assert
    expect(result).toBeNull();
  });

  it('wraps expression in __EvalTarget__', async () => {
    // Act
    const result = await generateTypeVideo('', 'string');

    // Assert
    expect(result).not.toBeNull();
    expect(result!.sourceCode).toContain('__EvalTarget__');
  });

  it('returns valid VideoData structure', async () => {
    // Act
    const result = await generateTypeVideo('', 'string');

    // Assert
    expect(result).not.toBeNull();
    expect(result).toHaveProperty('totalFrames');
    expect(result).toHaveProperty('fps');
    expect(result).toHaveProperty('steps');
    expect(result).toHaveProperty('typeAliases');
    expect(result).toHaveProperty('sourceCode');
    expect(result).toHaveProperty('activeTypeMap');
    expect(Array.isArray(result!.steps)).toBe(true);
  });

  it('handles invalid expression gracefully', async () => {
    // Act
    const result = await generateTypeVideo('', '{{{');

    // Assert - should either return null or handle error gracefully
    expect(result === null || typeof result === 'object').toBe(true);
  });

  it('generates video for simple conditional', async () => {
    // Act
    const result = await generateTypeVideo(
      '',
      '"a" extends string ? true : false'
    );

    // Assert
    expect(result).not.toBeNull();
    expect(result!.steps.length).toBeGreaterThan(0);
    const traceTypes = result!.steps.map(s => s.original.type);
    expect(traceTypes).toContain('condition');
  });
});
