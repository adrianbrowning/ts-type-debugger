import { describe, it, expect } from "vitest";
import { createMockStep } from "../../../tests/fixtures/mockVideoData.ts";
import { buildCallStack } from "../callStack.ts";
import type { VideoTraceStep } from "../types.ts";

describe("buildCallStack", () => {
  it("returns single frame at root level", () => {
    const steps: Array<VideoTraceStep> = [
      createMockStep({
        stepIndex: 0,
        original: {
          step: 0,
          type: "type_alias_start",
          expression: "Result",
          level: 0,
          position: { start: { line: 1, character: 0 }, end: { line: 1, character: 10 } },
        },
      }),
    ];

    const stack = buildCallStack(steps, 0);

    expect(stack).toHaveLength(1);
    expect(stack[0]).toEqual({
      name: "Result",
      line: 1,
      stepIndex: 0,
      level: 0,
    });
  });

  it("builds stack with nested generic call", () => {
    const steps: Array<VideoTraceStep> = [
      createMockStep({
        stepIndex: 0,
        original: {
          step: 0,
          type: "type_alias_start",
          expression: "Result",
          level: 0,
          position: { start: { line: 1, character: 0 }, end: { line: 1, character: 10 } },
        },
      }),
      createMockStep({
        stepIndex: 1,
        original: {
          step: 1,
          type: "generic_call",
          expression: "Foo<\"a\">",
          level: 1,
          position: { start: { line: 2, character: 5 }, end: { line: 2, character: 15 } },
        },
      }),
      createMockStep({
        stepIndex: 2,
        original: {
          step: 2,
          type: "generic_def",
          expression: "Foo<T>",
          level: 2,
          position: { start: { line: 5, character: 0 }, end: { line: 5, character: 10 } },
        },
      }),
    ];

    const stack = buildCallStack(steps, 2);

    expect(stack).toHaveLength(3);
    expect(stack[0]).toMatchObject({ name: "Result", level: 0 });
    // generic_call extracts just the type name without args for cleaner display
    expect(stack[1]).toMatchObject({ name: "Foo", level: 1 });
    expect(stack[2]).toMatchObject({ name: "Foo<T>", level: 2 });
  });

  it("pops frame when level decreases", () => {
    const steps: Array<VideoTraceStep> = [
      createMockStep({
        stepIndex: 0,
        original: { step: 0, type: "type_alias_start", expression: "Result", level: 0 },
      }),
      createMockStep({
        stepIndex: 1,
        original: { step: 1, type: "generic_call", expression: "Foo<\"a\">", level: 1 },
      }),
      createMockStep({
        stepIndex: 2,
        original: { step: 2, type: "generic_result", expression: "string", level: 1 },
      }),
      createMockStep({
        stepIndex: 3,
        original: { step: 3, type: "result_assignment", expression: "Result = string", level: 0 },
      }),
    ];

    // At step 3, we're back at level 0, stack should only have Result
    const stack = buildCallStack(steps, 3);

    expect(stack).toHaveLength(1);
    expect(stack[0]).toMatchObject({ name: "Result", level: 0 });
  });

  it("filters out non-generic frames (condition, branch)", () => {
    // Call stack should only show generic-related types, not conditions/branches
    const steps: Array<VideoTraceStep> = [
      createMockStep({
        stepIndex: 0,
        original: { step: 0, type: "type_alias_start", expression: "Result", level: 0 },
      }),
      createMockStep({
        stepIndex: 1,
        original: { step: 1, type: "condition", expression: "\"a\" extends string", level: 1 },
      }),
      createMockStep({
        stepIndex: 2,
        original: { step: 2, type: "branch_true", expression: "true branch", level: 2 },
      }),
    ];

    const stack = buildCallStack(steps, 2);

    // Only type_alias_start is included, conditions/branches are filtered out
    expect(stack).toHaveLength(1);
    expect(stack[0]).toMatchObject({ name: "Result", level: 0 });
  });

  it("filters out union distribution frames (not generic calls)", () => {
    // Union distribution is shown in Iteration section, not call stack
    const steps: Array<VideoTraceStep> = [
      createMockStep({
        stepIndex: 0,
        original: {
          step: 0,
          type: "conditional_union_distribute",
          expression: "\"a\" | \"b\"",
          level: 0,
        },
      }),
      createMockStep({
        stepIndex: 1,
        original: {
          step: 1,
          type: "conditional_union_member",
          expression: "\"a\"",
          level: 1,
          currentUnionMember: "\"a\"",
        },
      }),
      createMockStep({
        stepIndex: 2,
        original: {
          step: 2,
          type: "branch_true",
          expression: "1",
          level: 2,
        },
      }),
    ];

    const stack = buildCallStack(steps, 2);

    // None of these types are generic calls, so stack is empty
    expect(stack).toHaveLength(0);
  });

  it("filters out template literal frames (not generic calls)", () => {
    // Template literals are evaluated inline, not shown in call stack
    const steps: Array<VideoTraceStep> = [
      createMockStep({
        stepIndex: 0,
        original: {
          step: 0,
          type: "template_literal_start",
          expression: "`Prop ${T}`",
          level: 0,
        },
      }),
      createMockStep({
        stepIndex: 1,
        original: {
          step: 1,
          type: "template_span_eval",
          expression: "T",
          level: 1,
        },
      }),
    ];

    const stack = buildCallStack(steps, 1);

    // Template literal types are not generic calls, so stack is empty
    expect(stack).toHaveLength(0);
  });

  it("returns empty array for invalid step index", () => {
    const steps: Array<VideoTraceStep> = [
      createMockStep({ stepIndex: 0, original: { step: 0, type: "type_alias_start", expression: "Result", level: 0 } }),
    ];

    expect(buildCallStack(steps, -1)).toEqual([]);
    expect(buildCallStack(steps, 999)).toEqual([]);
  });

  it("handles empty steps array", () => {
    expect(buildCallStack([], 0)).toEqual([]);
  });
});
