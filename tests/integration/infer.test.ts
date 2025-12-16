import { describe, it, expect } from 'vitest';
import { generateTypeVideo } from '../../src/core/typeDebugger.ts';

describe('Infer Keyword Visualization', () => {
  describe('Template Literal Patterns', () => {
    it('extracts Head from template literal pattern', async () => {
      const code = `
        type ExtractHead<T extends string> = T extends \`\${infer Head}.\${string}\` ? Head : never;
        type Test = ExtractHead<"foo.bar">;
      `;
      const result = await generateTypeVideo(code, 'Test');

      expect(result).toBeDefined();

      // Should have infer pattern start
      const patternStart = result!.steps.find(s => s.original.type === 'infer_pattern_start');
      expect(patternStart).toBeDefined();

      // Should have successful match
      const patternMatch = result!.steps.find(s => s.original.type === 'infer_pattern_match');
      expect(patternMatch).toBeDefined();
      expect(patternMatch!.original.result).toBe('true');

      // Should have infer binding for Head
      const binding = result!.steps.find(s => s.original.type === 'infer_binding');
      expect(binding).toBeDefined();
      expect(binding!.original.expression).toContain('Head');
      expect(binding!.original.result).toBe('"foo"');
    });

    it('extracts multiple infer variables', async () => {
      const code = `
        type ExtractPath<T extends string> = T extends \`\${infer Head}.\${infer Tail}\` ? [Head, Tail] : never;
        type Test = ExtractPath<"foo.bar.baz">;
      `;
      const result = await generateTypeVideo(code, 'Test');

      expect(result).toBeDefined();

      // Should have two infer bindings
      const bindings = result!.steps.filter(s => s.original.type === 'infer_binding');
      expect(bindings.length).toBe(2);

      // Check Head and Tail are extracted
      const headBinding = bindings.find(b => b.original.expression.includes('Head'));
      const tailBinding = bindings.find(b => b.original.expression.includes('Tail'));
      expect(headBinding).toBeDefined();
      expect(tailBinding).toBeDefined();
      expect(headBinding!.original.result).toBe('"foo"');
      expect(tailBinding!.original.result).toBe('"bar.baz"');
    });
  });

  describe('Function Return Type Infer', () => {
    it('extracts return type with infer R', async () => {
      const code = `
        type ReturnType2<T> = T extends (...args: any[]) => infer R ? R : never;
        type Test = ReturnType2<() => string>;
      `;
      const result = await generateTypeVideo(code, 'Test');

      expect(result).toBeDefined();

      // Should have infer pattern
      const patternStart = result!.steps.find(s => s.original.type === 'infer_pattern_start');
      expect(patternStart).toBeDefined();

      // Should extract R = string
      const binding = result!.steps.find(s => s.original.type === 'infer_binding');
      expect(binding).toBeDefined();
      expect(binding!.original.expression).toContain('R');
      expect(binding!.original.result).toBe('string');
    });
  });

  describe('Array Element Infer', () => {
    it('extracts array element type with infer E', async () => {
      const code = `
        type ElementType<T> = T extends (infer E)[] ? E : never;
        type Test = ElementType<string[]>;
      `;
      const result = await generateTypeVideo(code, 'Test');

      expect(result).toBeDefined();

      const binding = result!.steps.find(s => s.original.type === 'infer_binding');
      expect(binding).toBeDefined();
      expect(binding!.original.expression).toContain('E');
      expect(binding!.original.result).toBe('string');
    });
  });

  describe('Tuple Infer', () => {
    it('extracts first and rest from tuple', async () => {
      const code = `
        type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;
        type Test = First<[1, 2, 3]>;
      `;
      const result = await generateTypeVideo(code, 'Test');

      expect(result).toBeDefined();

      const binding = result!.steps.find(s => s.original.type === 'infer_binding');
      expect(binding).toBeDefined();
      expect(binding!.original.expression).toContain('F');
      expect(binding!.original.result).toBe('1');
    });
  });

  describe('Failed Pattern Match', () => {
    it('shows failed match when pattern does not match', async () => {
      const code = `
        type ExtractPath<T extends string> = T extends \`\${infer Head}.\${infer Tail}\` ? [Head, Tail] : "no match";
        type Test = ExtractPath<"nodot">;
      `;
      const result = await generateTypeVideo(code, 'Test');

      expect(result).toBeDefined();

      // Should have pattern start
      const patternStart = result!.steps.find(s => s.original.type === 'infer_pattern_start');
      expect(patternStart).toBeDefined();

      // Should have failed match
      const patternMatch = result!.steps.find(s => s.original.type === 'infer_pattern_match');
      expect(patternMatch).toBeDefined();
      expect(patternMatch!.original.result).toBe('false');

      // Should have no bindings
      const bindings = result!.steps.filter(s => s.original.type === 'infer_binding');
      expect(bindings.length).toBe(0);

      // Should take false branch
      const falseBranch = result!.steps.find(s => s.original.type === 'branch_false');
      expect(falseBranch).toBeDefined();
    });
  });

  describe('Infer with Constraint', () => {
    it('handles infer with extends constraint', async () => {
      const code = `
        type OnlyNumber<T> = T extends { value: infer V extends number } ? V : never;
        type Test = OnlyNumber<{ value: 42 }>;
      `;
      const result = await generateTypeVideo(code, 'Test');

      expect(result).toBeDefined();

      const binding = result!.steps.find(s => s.original.type === 'infer_binding');
      expect(binding).toBeDefined();
      expect(binding!.original.expression).toContain('V');
      expect(binding!.original.result).toBe('42');
    });
  });

  describe('Recursive Infer Patterns', () => {
    it('traces recursive template literal splitting', async () => {
      const code = `
        type Split<S extends string> =
          S extends \`\${infer H}.\${infer T}\` ? [H, ...Split<T>] : [S];
        type Test = Split<"a.b.c">;
      `;
      const result = await generateTypeVideo(code, 'Test');

      expect(result).toBeDefined();

      // Should have at least one pattern match (first call)
      const patternStarts = result!.steps.filter(s => s.original.type === 'infer_pattern_start');
      expect(patternStarts.length).toBeGreaterThanOrEqual(1);

      // Should have at least one binding
      const bindings = result!.steps.filter(s => s.original.type === 'infer_binding');
      expect(bindings.length).toBeGreaterThanOrEqual(1);

      // Should have infer pattern result
      const patternResults = result!.steps.filter(s => s.original.type === 'infer_pattern_result');
      expect(patternResults.length).toBeGreaterThanOrEqual(1);
    });
  });
});
