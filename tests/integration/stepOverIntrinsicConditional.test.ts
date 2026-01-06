import { describe, it, expect } from "vitest";
import { generateTypeVideo } from "../../src/core/typeDebugger.ts";

describe("Step-over with intrinsic in conditional", () => {
  it("step-over from generic_call lands on generic_result (not extra step)", async () => {
    const code = `type Foo<T> = T extends string ? Uppercase<T> : never;`;
    const result = await generateTypeVideo(code, "Foo<\"hello\">");

    expect(result).toBeDefined();

    // Debug: Print all steps with their levels and positions
    console.log("All steps:");
    result!.steps.forEach((step, i) => {
      const pos = step.original.position;
      const posStr = pos ? `pos=${pos.start.line}:${pos.start.character}-${pos.end.line}:${pos.end.character}` : "no-position";
      console.log(`  ${i}: type=${step.original.type}, level=${step.original.level}, ${posStr}, expr="${step.original.expression}"`);
    });

    // Find generic_call at level 0
    const genericCallIdx = result!.steps.findIndex(s =>
      s.original.type === "generic_call" && s.original.level === 0
    );

    expect(genericCallIdx).toBeGreaterThan(-1);
    console.log(`\ngeneric_call at index ${genericCallIdx}`);

    // Simulate step-over: find next step where level <= 0
    let nextIdx = -1;
    for (let i = genericCallIdx + 1; i < result!.steps.length; i++) {
      if (result!.steps[i]!.original.level <= 0) {
        nextIdx = i;
        break;
      }
    }

    console.log(`Step-over lands on index ${nextIdx}: type=${result!.steps[nextIdx]?.original.type}`);

    // Should land directly on generic_result (no extra level-0 step)
    expect(result!.steps[nextIdx]?.original.type).toBe("generic_result");
  });

  it("all steps between generic_call and generic_result have level >= 1", async () => {
    const code = `type Foo<T> = T extends string ? Uppercase<T> : never;`;
    const result = await generateTypeVideo(code, "Foo<\"hello\">");

    expect(result).toBeDefined();

    // Find generic_call and generic_result indices
    const genericCallIdx = result!.steps.findIndex(s =>
      s.original.type === "generic_call" && s.original.level === 0
    );
    const genericResultIdx = result!.steps.findIndex(s =>
      s.original.type === "generic_result" && s.original.level === 0
    );

    expect(genericCallIdx).toBeGreaterThan(-1);
    expect(genericResultIdx).toBeGreaterThan(genericCallIdx);

    // All steps between should have level >= 1
    const stepsBetween = result!.steps.slice(genericCallIdx + 1, genericResultIdx);
    const level0Steps = stepsBetween.filter(s => s.original.level === 0);

    if (level0Steps.length > 0) {
      console.log("Found unexpected level-0 steps between generic_call and generic_result:");
      level0Steps.forEach(s => {
        console.log(`  type=${s.original.type}, expr="${s.original.expression}"`);
      });
    }

    expect(level0Steps.length).toBe(0);
  });

  it("generic_result position matches generic_call position (not type definition)", async () => {
    const code = `type Foo<T> = T extends string ? Uppercase<T> : never;`;
    const result = await generateTypeVideo(code, "Foo<\"hello\">");

    expect(result).toBeDefined();

    // Find generic_call and generic_result
    const genericCall = result!.steps.find(s =>
      s.original.type === "generic_call" && s.original.level === 0
    );
    const genericResult = result!.steps.find(s =>
      s.original.type === "generic_result" && s.original.level === 0
    );

    expect(genericCall).toBeDefined();
    expect(genericResult).toBeDefined();

    // Both should point to the same position (the call site, not the definition)
    // generic_call is at line 1:22-34 (Foo<"hello">)
    // generic_result should also point there, not to line 2 (the type definition)
    expect(genericResult!.original.position).toEqual(genericCall!.original.position);
  });
});
