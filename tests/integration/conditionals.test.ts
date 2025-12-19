import { describe, it, expect } from "vitest";
import { generateTypeVideo } from "../../src/core/typeDebugger.ts";
import { COMPLEX_TYPES, EDGE_CASES } from "../fixtures/types.ts";

describe("Conditional Type Resolution Integration", () => {
  it("resolves simple conditional (true branch)", async () => {
    const code = "type Test = \"a\" extends string ? \"yes\" : \"no\";";
    const result = await generateTypeVideo(code, "Test");

    expect(result).toBeDefined();
    const branchTrue = result!.steps.find(s => s.original.type === "branch_true");
    expect(branchTrue).toBeDefined();
    expect(result!.steps).toMatchSnapshot();
  });

  it("resolves simple conditional (false branch)", async () => {
    const code = "type Test = number extends string ? \"yes\" : \"no\";";
    const result = await generateTypeVideo(code, "Test");

    expect(result).toBeDefined();
    const branchFalse = result!.steps.find(s => s.original.type === "branch_false");
    expect(branchFalse).toBeDefined();
  });

  it("distributes unions over discriminative conditionals", async () => {
    const result = await generateTypeVideo(
      COMPLEX_TYPES.unionStepping,
      "Loop2<\"a\" | \"b\" | \"x\">"
    );

    expect(result).toBeDefined();
    const unionDistribute = result!.steps.find(s => s.original.type === "conditional_union_distribute");
    expect(unionDistribute).toBeDefined();

    const unionMembers = result!.steps.filter(s => s.original.type === "conditional_union_member");
    expect(unionMembers.length).toBe(3);
  });

  it("does not distribute over non-discriminative conditionals", async () => {
    const result = await generateTypeVideo(
      EDGE_CASES.nonDistributiveConditional,
      "NoDistribute<string | number>"
    );

    expect(result).toBeDefined();
    const unionDistribute = result!.steps.find(s => s.original.type === "conditional_union_distribute");
    expect(unionDistribute).toBeUndefined();
  });

  it("resolves nested conditionals (3+ levels)", async () => {
    const result = await generateTypeVideo(
      COMPLEX_TYPES.nestedConditionals,
      "Nested<\"a\">"
    );

    expect(result).toBeDefined();
    const conditions = result!.steps.filter(s => s.original.type === "condition");
    expect(conditions.length).toBeGreaterThanOrEqual(2);
  });
});
