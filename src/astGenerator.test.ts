import { describe, it, expect } from 'vitest';
import { generateAST, traceTypeResolution } from './astGenerator.ts';
import { SIMPLE_TYPES, COMPLEX_TYPES, EDGE_CASES } from '../tests/fixtures/types.ts';
import { getTraceTypes, findTraceByType, countTraceType } from '../tests/fixtures/testHelpers.ts';

describe('AST Generation', () => {
  it('creates valid SourceFile', () => {
    const code = 'type Test = string;';
    const ast = generateAST(code);

    expect(ast).toBeDefined();
    expect(ast.kind).toBe(308); // ts.SyntaxKind.SourceFile
  });

  it('handles invalid syntax gracefully', () => {
    const code = 'type Broken = {{{;';
    const ast = generateAST(code);

    // Should still create AST, but with errors
    expect(ast).toBeDefined();
  });
});

describe('Type Resolution Tracing', () => {
  it('traces simple identity generic', () => {
    const code = SIMPLE_TYPES.identity + '\ntype Result = Identity<string>;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    expect(trace.length).toBeGreaterThan(0);
    expect(findTraceByType(trace, 'type_alias_start')).toBeDefined();
    expect(findTraceByType(trace, 'generic_call')).toBeDefined();
  });

  it('traces conditional type - true branch', () => {
    const code = 'type Test = "a" extends string ? true : false;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Test');

    expect(findTraceByType(trace, 'condition')).toBeDefined();
    expect(findTraceByType(trace, 'branch_true')).toBeDefined();
  });

  it('traces conditional type - false branch', () => {
    const code = 'type Test = number extends string ? true : false;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Test');

    expect(findTraceByType(trace, 'condition')).toBeDefined();
    expect(findTraceByType(trace, 'branch_false')).toBeDefined();
  });

  it('traces union distribution in conditional', () => {
    const code = COMPLEX_TYPES.unionStepping + '\ntype Result = Loop2<"a" | "b" | "x">;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    expect(findTraceByType(trace, 'conditional_union_distribute')).toBeDefined();
    expect(findTraceByType(trace, 'conditional_union_member')).toBeDefined();
    expect(findTraceByType(trace, 'union_reduce')).toBeDefined();

    // Should have 3 union member traces (one for each: "a", "b", "x")
    expect(countTraceType(trace, 'conditional_union_member')).toBe(3);
  });

  it('traces template literal with union', () => {
    const code = 'type Test<S> = `Prop ${S}`;\ntype Result = Test<"a" | "b">;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    expect(findTraceByType(trace, 'template_literal_start')).toBeDefined();
    expect(findTraceByType(trace, 'template_union_distribute')).toBeDefined();
    expect(findTraceByType(trace, 'template_result')).toBeDefined();
  });

  it('traces template literal cartesian product', () => {
    const code = COMPLEX_TYPES.templateCartesian + '\ntype Result = Grid<"a" | "b", 1 | 2>;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    expect(findTraceByType(trace, 'template_literal_start')).toBeDefined();
    // Should generate 4 results: a-1, a-2, b-1, b-2
    expect(findTraceByType(trace, 'template_result')).toBeDefined();
  });

  it('traces nested conditionals', () => {
    const code = COMPLEX_TYPES.nestedConditionals + '\ntype Result = Nested<"a">;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    const conditions = countTraceType(trace, 'condition');
    expect(conditions).toBeGreaterThanOrEqual(2); // At least 2 nested conditions
  });

  it('traces mapped type with keyof', () => {
    const code = 'type MyReadonly<T> = { readonly [K in keyof T]: T[K] };\ntype Result = MyReadonly<{a: string}>;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    expect(findTraceByType(trace, 'mapped_type_start')).toBeDefined();
    expect(findTraceByType(trace, 'mapped_type_constraint')).toBeDefined();
    expect(findTraceByType(trace, 'map_iteration')).toBeDefined();
    expect(findTraceByType(trace, 'mapped_type_end')).toBeDefined();
  });

  it('traces indexed access type', () => {
    const code = 'type Test<T, K extends keyof T> = T[K];\ntype Result = Test<{a: string}, "a">;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    expect(findTraceByType(trace, 'indexed_access')).toBeDefined();
    expect(findTraceByType(trace, 'indexed_access_result')).toBeDefined();
  });

  it('handles non-existent type gracefully', () => {
    const code = 'type Test = string;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'NonExistent');

    // Should return empty or minimal trace
    expect(trace).toBeDefined();
  });

  it('captures complete trace with snapshots', () => {
    const code = SIMPLE_TYPES.identity + '\ntype Result = Identity<number>;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    // Snapshot the full trace structure
    expect(trace).toMatchSnapshot();
  });
});

describe('Generic Type Evaluation', () => {
  it('evaluates simple Identity generic', () => {
    const code = SIMPLE_TYPES.identity + '\ntype Result = Identity<string>;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    expect(findTraceByType(trace, 'generic_call')).toBeDefined();
    expect(findTraceByType(trace, 'generic_def')).toBeDefined();
    expect(findTraceByType(trace, 'generic_result')).toBeDefined();
  });

  it('evaluates nested generics', () => {
    const code = 'type Identity<T> = T;\ntype Result = Identity<Identity<string>>;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    const genericCalls = countTraceType(trace, 'generic_call');
    expect(genericCalls).toBeGreaterThanOrEqual(2); // Nested calls
  });

  it('evaluates Pick utility type', () => {
    const code = COMPLEX_TYPES.pick + '\ntype Result = MyPick<{a: string; b: number}, "a">;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    expect(findTraceByType(trace, 'mapped_type_start')).toBeDefined();
  });
});

describe('Template Literal Evaluation', () => {
  it('evaluates static template', () => {
    const code = 'type Test = `static`;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Test');

    expect(findTraceByType(trace, 'template_literal_start')).toBeDefined();
  });

  it('evaluates template with single string interpolation', () => {
    const code = 'type Test = `prefix_${"value"}`;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Test');

    expect(findTraceByType(trace, 'template_span_eval')).toBeDefined();
  });

  it('evaluates template with numeric literals', () => {
    const code = EDGE_CASES.templateWithNumber;
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'NumberTemplate');

    expect(findTraceByType(trace, 'template_literal_start')).toBeDefined();
    expect(findTraceByType(trace, 'template_result')).toBeDefined();
  });

  it('evaluates template with nested generic', () => {
    const code = `
      type Identity<T> = T;
      type Test<S> = \`prefix_\${Identity<S>}\`;
      type Result = Test<"value">;
    `;
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    expect(findTraceByType(trace, 'template_span_eval')).toBeDefined();
    expect(findTraceByType(trace, 'generic_call')).toBeDefined();
  });
});

describe('Conditional Type Evaluation', () => {
  it('evaluates simple extends check - true', () => {
    const code = 'type Test = "a" extends string ? true : false;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Test');

    expect(findTraceByType(trace, 'conditional_comparison')).toBeDefined();
    expect(findTraceByType(trace, 'branch_true')).toBeDefined();
  });

  it('evaluates simple extends check - false', () => {
    const code = 'type Test = number extends string ? true : false;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Test');

    expect(findTraceByType(trace, 'conditional_comparison')).toBeDefined();
    expect(findTraceByType(trace, 'branch_false')).toBeDefined();
  });

  it('distributes discriminative unions', () => {
    const code = 'type ToArray<T> = T extends any ? T[] : never;\ntype Result = ToArray<string | number>;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    expect(findTraceByType(trace, 'conditional_union_distribute')).toBeDefined();
  });

  it('does not distribute non-discriminative unions', () => {
    const code = EDGE_CASES.nonDistributiveConditional + '\ntype Result = NoDistribute<string | number>;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    // Should NOT have union distribution
    expect(findTraceByType(trace, 'conditional_union_distribute')).toBeUndefined();
  });

  it('removes never from union results', () => {
    const code = COMPLEX_TYPES.unionStepping + '\ntype Result = Loop2<"a" | "b" | "x">;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    expect(findTraceByType(trace, 'union_reduce')).toBeDefined();
  });

  it('handles deeply nested conditionals (3+ levels)', () => {
    const code = COMPLEX_TYPES.nestedConditionals + '\ntype Result = Nested<string>;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    const conditions = countTraceType(trace, 'condition');
    expect(conditions).toBeGreaterThanOrEqual(2);
  });
});

describe('Mapped Type Evaluation', () => {
  it('evaluates basic mapped type', () => {
    const code = 'type Test<T> = { [K in keyof T]: T[K] };\ntype Result = Test<{a: string}>;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    expect(findTraceByType(trace, 'mapped_type_start')).toBeDefined();
    expect(findTraceByType(trace, 'map_iteration')).toBeDefined();
    expect(findTraceByType(trace, 'mapped_type_result')).toBeDefined();
  });

  it('evaluates mapped type with optional modifier', () => {
    const code = EDGE_CASES.complexMapped + '\ntype Result = Optional<{a: string}>;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    expect(findTraceByType(trace, 'mapped_type_start')).toBeDefined();
  });

  it('evaluates nested mapped types', () => {
    const code = COMPLEX_TYPES.deepReadonly + '\ntype Result = DeepReadonly<{a: {b: string}}>;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    const mappedStarts = countTraceType(trace, 'mapped_type_start');
    expect(mappedStarts).toBeGreaterThanOrEqual(1);
  });
});

describe('Indexed Access Evaluation', () => {
  it('evaluates simple indexed access', () => {
    const code = 'type Test = {a: string}["a"];';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Test');

    expect(findTraceByType(trace, 'indexed_access')).toBeDefined();
    expect(findTraceByType(trace, 'indexed_access_result')).toBeDefined();
  });

  it('evaluates indexed access with union keys', () => {
    const code = 'type Test = {a: string; b: number}["a" | "b"];';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Test');

    expect(findTraceByType(trace, 'indexed_access')).toBeDefined();
  });

  it('evaluates nested indexed access', () => {
    const code = 'type Test = {a: {b: string}}["a"]["b"];';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Test');

    const indexedAccess = countTraceType(trace, 'indexed_access');
    expect(indexedAccess).toBeGreaterThanOrEqual(2);
  });
});

describe('Edge Cases', () => {
  it('handles empty union (never)', () => {
    const code = EDGE_CASES.emptyUnion;
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Empty');

    expect(trace).toBeDefined();
  });

  it('handles recursive type', () => {
    const code = EDGE_CASES.recursiveType;
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Json');

    expect(trace).toBeDefined();
    // Should handle recursion without infinite loop
  });

  it('handles distributive conditional', () => {
    const code = EDGE_CASES.distributiveConditional + '\ntype Result = ToArray<string | number>;';
    const ast = generateAST(code);
    const trace = traceTypeResolution(ast, 'Result');

    expect(findTraceByType(trace, 'conditional_union_distribute')).toBeDefined();
  });
});
