import { describe, it, expect } from "vitest";
import { generateTypeVideo } from "../../src/core/typeDebugger.ts";
import { SIMPLE_TYPES, COMPLEX_TYPES } from "../fixtures/types.ts";

describe("Generic Type Resolution Integration", () => {
  it("resolves simple identity generic", async () => {
    const result = await generateTypeVideo(SIMPLE_TYPES.identity, "Identity<string>");

    expect(result).toBeDefined();
    expect(result!.steps.length).toBeGreaterThan(0);
    expect(result!.steps).toMatchSnapshot();
  });

  it("resolves nested generics", async () => {
    const code = "type Identity<T> = T;";
    const result = await generateTypeVideo(code, "Identity<Identity<number>>");

    expect(result).toBeDefined();
    const genericCalls = result!.steps.filter(s => s.original.type === "generic_call");
    expect(genericCalls.length).toBeGreaterThanOrEqual(2);
  });

  it("resolves generics with constraints", async () => {
    const code = "type Constrained<T extends string> = T;";
    const result = await generateTypeVideo(code, "Constrained<\"hello\">");

    expect(result).toBeDefined();
    expect(result!.steps.length).toBeGreaterThan(0);
  });

  it("resolves Pick/Omit utility types", async () => {
    const result = await generateTypeVideo(
      COMPLEX_TYPES.pick,
      "MyPick<{a: string; b: number}, \"a\">"
    );

    expect(result).toBeDefined();
    const mappedTypes = result!.steps.filter(s => s.original.type === "mapped_type_start");
    expect(mappedTypes.length).toBeGreaterThan(0);
  });

  it("resolves recursive generics", async () => {
    const result = await generateTypeVideo(
      COMPLEX_TYPES.deepReadonly,
      "DeepReadonly<{a: {b: string}}>"
    );

    expect(result).toBeDefined();
    expect(result!.steps.length).toBeGreaterThan(0);
  });
});
