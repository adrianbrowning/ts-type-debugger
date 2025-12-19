import { describe, it, expect } from "vitest";
import { generateTypeVideo } from "../../src/core/typeDebugger.ts";

describe("Nested Generics in Conditional Types", () => {
  describe("generic in extends clause", () => {
    it("traces generic call in conditional extends clause", async () => {
      const code = `
        type IsString<T> = T extends string ? true : false;
        type Check<T> = T extends IsString<T> ? "matches" : "no-match";
        type __EvalTarget__ = Check<string>;
      `;
      const result = await generateTypeVideo(code, "__EvalTarget__");

      expect(result).toBeDefined();
      // Should have generic_call for IsString<T>
      const genericCalls = result!.steps.filter(s =>
        s.original.type === "generic_call" &&
        s.original.expression.includes("IsString")
      );
      expect(genericCalls.length).toBeGreaterThan(0);
    });

    it("traces generic in conditional check type", async () => {
      const code = `
        type Wrapped<T> = { value: T };
        type Test<T> = Wrapped<T> extends { value: string } ? true : false;
        type __EvalTarget__ = Test<string>;
      `;
      const result = await generateTypeVideo(code, "__EvalTarget__");

      expect(result).toBeDefined();
      const genericCalls = result!.steps.filter(s =>
        s.original.type === "generic_call" &&
        s.original.expression.includes("Wrapped")
      );
      expect(genericCalls.length).toBeGreaterThan(0);
    });
  });

  describe("validateLeafPath-style pattern", () => {
    it("traces nested generic in extends clause like validateLeafPath", async () => {
      const code = `
        type ValidatePath<T, P> = P extends keyof T ? P : never;
        type Getter<T, P extends string> = P extends ValidatePath<T, P> ? T[P] : never;
        type __EvalTarget__ = Getter<{a: string; b: number}, "a">;
      `;
      const result = await generateTypeVideo(code, "__EvalTarget__");

      expect(result).toBeDefined();
      const validatePathCalls = result!.steps.filter(s =>
        s.original.type === "generic_call" &&
        s.original.expression.includes("ValidatePath")
      );
      expect(validatePathCalls.length).toBeGreaterThan(0);
    });
  });

  describe("deeply nested generics", () => {
    it("traces deeply nested generics (3+ levels)", async () => {
      const code = `
        type Inner<T> = T;
        type Middle<T> = Inner<T>;
        type Outer<T> = T extends Middle<Inner<T>> ? true : false;
        type __EvalTarget__ = Outer<string>;
      `;
      const result = await generateTypeVideo(code, "__EvalTarget__");

      expect(result).toBeDefined();
      const innerCalls = result!.steps.filter(s =>
        s.original.type === "generic_call" &&
        s.original.expression.includes("Inner")
      );
      const middleCalls = result!.steps.filter(s =>
        s.original.type === "generic_call" &&
        s.original.expression.includes("Middle")
      );
      expect(innerCalls.length).toBeGreaterThan(0);
      expect(middleCalls.length).toBeGreaterThan(0);
    });

    it("traces generic in both check and extends types", async () => {
      const code = `
        type Left<T> = { left: T };
        type Right<T> = { right: T };
        type Compare<T> = Left<T> extends Right<T> ? "same" : "different";
        type __EvalTarget__ = Compare<string>;
      `;
      const result = await generateTypeVideo(code, "__EvalTarget__");

      expect(result).toBeDefined();
      const leftCalls = result!.steps.filter(s =>
        s.original.type === "generic_call" &&
        s.original.expression.includes("Left")
      );
      const rightCalls = result!.steps.filter(s =>
        s.original.type === "generic_call" &&
        s.original.expression.includes("Right")
      );
      expect(leftCalls.length).toBeGreaterThan(0);
      expect(rightCalls.length).toBeGreaterThan(0);
    });
  });

  describe("union distribution with nested generics", () => {
    it("traces generic in extends clause during union distribution", async () => {
      const code = `
        type Validator<T> = T extends string ? true : false;
        type Distribute<T> = T extends Validator<T> ? "valid" : "invalid";
        type __EvalTarget__ = Distribute<"a" | "b">;
      `;
      const result = await generateTypeVideo(code, "__EvalTarget__");

      expect(result).toBeDefined();
      // Should have union distribution
      const unionDistribute = result!.steps.find(s => s.original.type === "conditional_union_distribute");
      expect(unionDistribute).toBeDefined();

      // Should trace Validator generic for each member
      const validatorCalls = result!.steps.filter(s =>
        s.original.type === "generic_call" &&
        s.original.expression.includes("Validator")
      );
      expect(validatorCalls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
