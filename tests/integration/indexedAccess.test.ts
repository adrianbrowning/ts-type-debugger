import { describe, it, expect } from "vitest";
import { generateTypeVideo } from "../../src/core/typeDebugger.ts";

describe("Indexed Access Resolution Integration", () => {
  it("resolves simple indexed access", async () => {
    const code = "type Test = {a: string}[\"a\"];";
    const result = await generateTypeVideo(code, "Test");

    expect(result).toBeDefined();
    const indexedAccess = result!.steps.find(s => s.original.type === "indexed_access");
    expect(indexedAccess).toBeDefined();

    const indexedResult = result!.steps.find(s => s.original.type === "indexed_access_result");
    expect(indexedResult).toBeDefined();
  });

  it("resolves indexed access with union keys", async () => {
    const code = "type Test = {a: string; b: number}[\"a\" | \"b\"];";
    const result = await generateTypeVideo(code, "Test");

    expect(result).toBeDefined();
    const indexedAccess = result!.steps.find(s => s.original.type === "indexed_access");
    expect(indexedAccess).toBeDefined();
  });
});
