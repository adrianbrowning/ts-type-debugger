import { describe, it, expect } from "vitest";
import { checkTypeCondition, evalTypeString } from "./eval_local.ts";

describe("Type Condition Checking", () => {
  it("checks string literal extends string (true)", () => {
    const result = checkTypeCondition("\"hello\"", "string");
    expect(result).toBe(true);
  });

  it("checks number extends string (false)", () => {
    const result = checkTypeCondition("number", "string");
    expect(result).toBe(false);
  });

  it("checks complex object shapes", () => {
    const result = checkTypeCondition(
      "{ id: number; name: string }",
      "{ id: number }"
    );
    expect(result).toBe(true);
  });

  it("checks union extends type", () => {
    const result = checkTypeCondition("string | number", "string");
    expect(result).toBe(false); // Union doesn't extend string
  });
});

describe("Type String Evaluation", () => {
  it("reduces simple union", () => {
    const result = evalTypeString("1 | 2 | 2");
    expect(result).toBe("1 | 2");
  });

  it("removes never from union", () => {
    const result = evalTypeString("1 | never");
    expect(result).toBe("1");
  });

  it("evaluates numeric literal unions", () => {
    const result = evalTypeString("1 | 2 | 3");
    expect(result).toBe("1 | 2 | 3");
  });

  it("evaluates template literal result", () => {
    const result = evalTypeString("`prefix_${\"a\" | \"b\"}`");
    expect(result).toContain("prefix_");
  });
});
