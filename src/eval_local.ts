// @vite-ignore
import { createSystem, createVirtualTypeScriptEnvironment } from "@typescript/vfs";
import * as ts from "typescript";
import { libFiles } from "./services/typescript/lib-bundle.ts";

// Memoization caches to avoid expensive env creation for repeated evaluations
const evalCache = new Map<string, string>();
const checkCache = new Map<string, boolean>();

function hashArgs(...args: Array<string>): string {
  let hash = 0;
  const str = args.join("|");
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

function loadLibs() {
  return new Map<string, string>(Object.entries(libFiles));
}

export function checkTypeCondition(typeBody: string, checker: string, context?: string): boolean {
  // Check cache first
  const cacheKey = hashArgs(typeBody, checker, context || "");
  const cached = checkCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const fsMap = loadLibs();
  const fileName = "temp.ts";
  const code = `
    type path = ${typeBody};
    type _r = path extends ${checker} ? true : false;
    ${context ? context + ";" : ""}
    declare const _result: _r;
  `;
  fsMap.set(fileName, code);

  // 4. Create system and virtual env
  const system = createSystem(fsMap);
  const env = createVirtualTypeScriptEnvironment(
    system,
    [ fileName ],
    ts,
    { rootDir: "/", target: ts.ScriptTarget.ESNext, lib: [ "esnext", "dom" ] }
  );

  const typeChecker = env.languageService.getProgram()!.getTypeChecker();
  const sourceFile = env.languageService.getProgram()!.getSourceFile(fileName);

  // 5. Find type of _result and compare — same as before
  let resultType: ts.Type | undefined;

  ts.forEachChild(sourceFile!, node => {
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (
          ts.isVariableDeclaration(decl) &&
                    decl.name.getText() === "_result"
        ) {
          resultType = typeChecker.getTypeAtLocation(decl);
        }
      }
    }
  });

  if (!resultType) throw new Error("Could not determine result type");
  const result = typeChecker.typeToString(resultType) === "true";
  checkCache.set(cacheKey, result);
  return result;
}

export function evalTypeString(expr: string): string;
export function evalTypeString(context: string, expr: string): string;
export function evalTypeString(contextOrExpr: string, expr?: string): string {
  const context = expr === undefined ? "" : contextOrExpr;
  const actualExpr = expr === undefined ? contextOrExpr : expr;

  // Check cache first
  const cacheKey = hashArgs(context, actualExpr);
  const cached = evalCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const fsMap = loadLibs();
  const fileName = "/main.ts";
  fsMap.set(fileName, `${context}\ntype _Eval = ${actualExpr};`);
  const system = createSystem(fsMap);
  const env = createVirtualTypeScriptEnvironment(system, [ fileName ], ts, {
    rootDir: "/",
    target: ts.ScriptTarget.ESNext,
  });
  const checker = env.languageService.getProgram()!.getTypeChecker();
  const source = env.languageService.getProgram()!.getSourceFile(fileName)!;

  // Find the _Eval type alias node
  let node: ts.TypeAliasDeclaration | undefined;
  ts.forEachChild(source, child => {
    if (
      ts.isTypeAliasDeclaration(child) &&
        String(child.name.escapedText) === "_Eval"
    ) node = child;
  });
  if (!node) throw new Error("_Eval not found");

  // Get the type
  const type = checker.getTypeAtLocation(node);

  // Helper type for number literals (runtime method exists but not in type defs)
  type NumberLiteralType = ts.Type & { value: number; };
  const isNumberLiteralType = (t: ts.Type): t is NumberLiteralType =>
    (t.flags & ts.TypeFlags.NumberLiteral) !== 0;

  // Helper: expand union of literals into "A" | "B"
  function typeString(type: ts.Type): string {
    if (type.isUnion()) {
      const parts = (type).types;
      if (parts.every(t => t.isStringLiteral())) {
        return parts.map(t => JSON.stringify(t.value)).join(" | ");
      }
      // Handle numeric and other literal unions
      const allLiterals = parts.every(t => isNumberLiteralType(t) || t.isStringLiteral() ||
                       checker.typeToString(t) === "never");
      if (allLiterals) {
        return parts.map(t => {
          if (isNumberLiteralType(t)) {
            return t.value.toString();
          }
          if (t.isStringLiteral()) return JSON.stringify(t.value);
          return checker.typeToString(t);
        }).join(" | ");
      }
    }
    if (type.isStringLiteral()) return JSON.stringify(type.value);
    return checker.typeToString(type);
  }

  const result = typeString(type);
  evalCache.set(cacheKey, result);
  return result;
}

/**
 * Extract inferred type bindings from a conditional type pattern
 * @param checkValue The value being checked (e.g., "foo.bar" or the substituted type)
 * @param extendsPattern The pattern with infer keywords (e.g., `${infer Head}.${infer Tail}`)
 * @param inferNames Array of infer variable names to extract
 * @param additionalContext Optional additional type definitions for context
 * @returns Map of infer name to extracted value, or null if pattern doesn't match
 */
export function extractInferredBindings(
  checkValue: string,
  extendsPattern: string,
  inferNames: Array<string>,
  additionalContext?: string
): Map<string, string> | null {
  if (inferNames.length === 0) return new Map();

  const fsMap = loadLibs();
  const fileName = "/infer.ts";

  // Build code that extracts each infer variable
  // Wrap in parentheses to handle complex types like functions
  let code = additionalContext ? `${additionalContext}\n` : "";
  code += `type _Match = (${checkValue}) extends (${extendsPattern}) ? true : false;\n`;
  for (const name of inferNames) {
    code += `type _Infer_${name} = (${checkValue}) extends (${extendsPattern}) ? ${name} : never;\n`;
  }

  fsMap.set(fileName, code);

  const system = createSystem(fsMap);
  const env = createVirtualTypeScriptEnvironment(system, [ fileName ], ts, {
    rootDir: "/",
    target: ts.ScriptTarget.ESNext,
  });
  const checker = env.languageService.getProgram()!.getTypeChecker();
  const source = env.languageService.getProgram()!.getSourceFile(fileName)!;

  // Helper to get type string for a type alias
  function getTypeAliasValue(aliasName: string): string | null {
    let node: ts.TypeAliasDeclaration | undefined;
    ts.forEachChild(source, child => {
      if (ts.isTypeAliasDeclaration(child) && String(child.name.escapedText) === aliasName) {
        node = child;
      }
    });
    if (!node) return null;

    const type = checker.getTypeAtLocation(node);
    if (type.isStringLiteral()) return JSON.stringify(type.value);
    return checker.typeToString(type);
  }

  // Check if pattern matches
  const matchResult = getTypeAliasValue("_Match");
  if (matchResult !== "true") return null;

  // Extract each infer binding
  const bindings = new Map<string, string>();
  for (const name of inferNames) {
    const value = getTypeAliasValue(`_Infer_${name}`);
    if (value !== null && value !== "never") {
      bindings.set(name, value);
    }
  }

  return bindings;
}
