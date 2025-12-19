import { describe, it, expect } from "vitest";
import { generateTypeVideo } from "../../src/core/typeDebugger.ts";
import { COMPLEX_TYPES } from "../fixtures/types.ts";

describe("Mapped Type Resolution Integration", () => {
  it("resolves mapped type with keyof", async () => {
    const code = "type MyReadonly<T> = { readonly [K in keyof T]: T[K] };";
    const result = await generateTypeVideo(code, "MyReadonly<{a: string}>");

    expect(result).toBeDefined();
    const mappedStart = result!.steps.find(s => s.original.type === "mapped_type_start");
    expect(mappedStart).toBeDefined();

    const mapIteration = result!.steps.find(s => s.original.type === "map_iteration");
    expect(mapIteration).toBeDefined();

    expect(result!.steps).toMatchSnapshot();
  });

  it("resolves mapped type with union constraint", async () => {
    const code = "type Test = { [K in \"a\" | \"b\"]: string };";
    const result = await generateTypeVideo(code, "Test");

    expect(result).toBeDefined();
    const mappedStart = result!.steps.find(s => s.original.type === "mapped_type_start");
    expect(mappedStart).toBeDefined();
  });

  it("resolves nested mapped types", async () => {
    const result = await generateTypeVideo(
      COMPLEX_TYPES.deepReadonly,
      "DeepReadonly<{a: {b: string}}>"
    );

    expect(result).toBeDefined();
    const mappedStarts = result!.steps.filter(s => s.original.type === "mapped_type_start");
    expect(mappedStarts.length).toBeGreaterThanOrEqual(1);
  });
});
