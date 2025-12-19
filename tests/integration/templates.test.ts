import { describe, it, expect } from "vitest";
import { generateTypeVideo } from "../../src/core/typeDebugger.ts";
import { COMPLEX_TYPES } from "../fixtures/types.ts";

describe("Template Literal Resolution Integration", () => {
  it("resolves template with single union interpolation", async () => {
    const code = "type Test<S> = `Prop ${S}`;";
    const result = await generateTypeVideo(code, "Test<\"a\" | \"b\">");

    expect(result).toBeDefined();
    const templateStart = result!.steps.find(s => s.original.type === "template_literal_start");
    expect(templateStart).toBeDefined();

    const unionDistribute = result!.steps.find(s => s.original.type === "template_union_distribute");
    expect(unionDistribute).toBeDefined();
  });

  it("resolves template with multiple interpolations (cartesian)", async () => {
    const result = await generateTypeVideo(
      COMPLEX_TYPES.templateCartesian,
      "Grid<\"a\" | \"b\", 1 | 2>"
    );

    expect(result).toBeDefined();
    const templateResult = result!.steps.find(s => s.original.type === "template_result");
    expect(templateResult).toBeDefined();
    expect(result!.steps).toMatchSnapshot();
  });

  it("resolves template with nested generic calls", async () => {
    const code = `
      type Identity<T> = T;
      type Test<S> = \`prefix_\${Identity<S>}\`;
    `;
    const result = await generateTypeVideo(code, "Test<\"value\">");

    expect(result).toBeDefined();
    const genericCall = result!.steps.find(s => s.original.type === "generic_call");
    expect(genericCall).toBeDefined();
  });

  it("resolves template with conditional inside interpolation", async () => {
    const code = `
      type Test<T> = \`result: \${T extends string ? "yes" : "no"}\`;
    `;
    const result = await generateTypeVideo(code, "Test<string>");

    expect(result).toBeDefined();
    const condition = result!.steps.find(s => s.original.type === "condition");
    expect(condition).toBeDefined();
  });

  it("traces all generics in template interpolation regardless of alias map", async () => {
    // This test ensures generics are always evaluated, not just those in allTypeAliases
    const code = `
      type Upper<S extends string> = Uppercase<S>;
      type Template<S extends string> = \`PREFIX_\${Upper<S>}_SUFFIX\`;
      type __EvalTarget__ = Template<"hello">;
    `;
    const result = await generateTypeVideo(code, "__EvalTarget__");

    expect(result).toBeDefined();
    // Should trace the Upper generic call
    const upperCalls = result!.steps.filter(s =>
      s.original.type === "generic_call" &&
      s.original.expression.includes("Upper")
    );
    expect(upperCalls.length).toBeGreaterThan(0);
  });
});
