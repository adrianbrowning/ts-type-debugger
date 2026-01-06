import ts from "typescript";
import { checkTypeCondition, evalTypeString, extractInferredBindings } from "./eval_local.ts";

/**
 * Represents a single step in type evaluation trace
 */
export interface TraceEntry {
  step: number;
  type: "type_alias_start" | "type_alias_result" | "generic_call" | "generic_def" | "generic_result" | "condition" | "conditional_evaluate_left" | "conditional_evaluate_right" | "conditional_comparison" | "conditional_evaluation" | "branch_true" | "branch_false" | "result_assignment" | "template_literal" | "template_literal_start" | "template_union_distribute" | "template_union_member" | "template_union_member_result" | "template_span_eval" | "template_result" | "alias_reference" | "substitution" | "mapped_type_start" | "mapped_type_constraint" | "mapped_type_constraint_result" | "map_iteration" | "mapped_type_result" | "mapped_type_end" | "indexed_access" | "indexed_access_result" | "conditional_union_distribute" | "conditional_union_member" | "union_reduce" | "infer_pattern_start" | "infer_pattern_match" | "infer_binding" | "infer_pattern_result" | "intrinsic_type_start" | "intrinsic_union_distribute" | "intrinsic_union_member" | "intrinsic_result";
  expression: string;
  parameters?: Record<string, string>;
  args?: Record<string, string>;
  result?: string;
  level: number;
  position?: {
    start: { line: number; character: number; };
    end: { line: number; character: number; };
  };
  currentUnionMember?: string;
  currentUnionResults?: string;
}

/**
 * Generates a full TypeScript AST from a code string
 * @param code TypeScript source code
 * @param fileName Optional filename for diagnostics
 * @returns TypeScript AST (SourceFile node)
 */
export function generateAST(code: string, fileName = "generated.ts"): ts.SourceFile {
  return ts.createSourceFile(
    fileName,
    code,
    ts.ScriptTarget.Latest,
    true // setParentNodes - enables parent references in AST
  );
}

/**
 * Visits all nodes in AST with callback
 * @param node Root node to start traversal
 * @param visitor Callback function for each node
 */
function visitNodes(node: ts.Node, visitor: (n: ts.Node) => void): void {
  visitor(node);
  ts.forEachChild(node, child => visitNodes(child, visitor));
}

/**
 * Gets all nodes of a specific kind from AST
 * @param ast SourceFile AST
 * @param kind SyntaxKind to filter by
 */
function findNodes(ast: ts.SourceFile, kind: ts.SyntaxKind): Array<ts.Node> {
  const results: Array<ts.Node> = [];

  visitNodes(ast, node => {
    if (node.kind === kind) {
      results.push(node);
    }
  });

  return results;
}

/**K
 * Gets a node by name (for declarations like type aliases, interfaces, functions, etc.)
 * @param ast SourceFile AST
 * @param name Name to search for
 * @returns First node with matching name, or undefined
 */
export function getNodeByName(ast: ts.SourceFile, name: string): ts.Node | undefined {
  let result: ts.Node | undefined;

  visitNodes(ast, node => {
    if (result) return; // Early exit once found

    if (
      ts.isTypeAliasDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isFunctionDeclaration(node) ||
      ts.isVariableDeclaration(node) ||
      ts.isEnumDeclaration(node)
    ) {
      if (ts.getNameOfDeclaration(node)?.getText() === name) {
        result = node;
      }
    }
  });

  return result;
}

/**
 * Gets all TypeAliasDeclarations from AST
 * @param ast SourceFile AST
 * @returns Array of type alias nodes
 */
function getTypeAliases(ast: ts.SourceFile): Array<ts.TypeAliasDeclaration> {
  return findNodes(ast, ts.SyntaxKind.TypeAliasDeclaration) as Array<ts.TypeAliasDeclaration>;
}

/**
 * Type evaluation context for tracing
 */
// TypeScript's hardcoded max recursion depth is 1000
const MAX_RECURSION_DEPTH = 1000;

interface EvalContext {
  sourceFile: ts.SourceFile;
  trace: Array<TraceEntry>;
  level: number;
  depth: number; // Track recursion depth for circular type detection
  parameters: Map<string, string>;
  allTypeAliases: Map<string, ts.TypeAliasDeclaration>;
  currentNode?: ts.Node; // Track the node being evaluated for result steps
  currentUnionMember?: string; // Track which union member is being evaluated
  currentUnionResults?: string; // Track accumulating union results
  evaluatingArgs?: Set<string>; // Track type arguments being evaluated to prevent recursion
  inferredBindings?: Map<string, string>; // Track inferred type variables during pattern matching
  currentInferPattern?: string; // Track current pattern being matched
}

/**
 * Helper to get position info from AST node
 */
function getNodePosition(node: ts.Node, sourceFile: ts.SourceFile): { start: { line: number; character: number; }; end: { line: number; character: number; }; } | undefined {
  try {
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
    return {
      start: { line: start.line + 1, character: start.character },
      end: { line: end.line + 1, character: end.character },
    };
  }
  catch {
    return undefined;
  }
}

/**
 * Find all infer type nodes in a type node tree
 * Returns array of infer variable names with their positions
 */
function findInferTypes(node: ts.TypeNode, sourceFile: ts.SourceFile): Array<{
  name: string;
  position: ReturnType<typeof getNodePosition>;
  constraint?: string;
}> {
  const infers: Array<{ name: string; position: ReturnType<typeof getNodePosition>; constraint?: string; }> = [];

  function visit(n: ts.Node) {
    if (n.kind === ts.SyntaxKind.InferType) {
      const inferNode = n as ts.InferTypeNode;
      const name = inferNode.typeParameter.name.text;
      const constraint = inferNode.typeParameter.constraint?.getText(sourceFile);
      infers.push({
        name,
        position: getNodePosition(n, sourceFile),
        constraint,
      });
    }
    ts.forEachChild(n, visit);
  }

  visit(node);
  return infers;
}

/**
 * Add trace entry helper
 */
function addTrace(context: EvalContext, type: TraceEntry["type"], expression: string, opts: Partial<TraceEntry> = {}): void {
  // For result steps without explicit position, use current node context
  // Exclude semantic steps that don't correspond to specific code locations
  const resultTypes = new Set([ "mapped_type_constraint_result", "mapped_type_result", "mapped_type_end", "indexed_access_result", "template_literal", "template_result" ]);
  const semanticSteps = new Set([ "conditional_evaluation" ]); // No auto-position for these

  const shouldUseContextNode = resultTypes.has(type) && !opts.position && context.currentNode;
  const isSemanticStep = semanticSteps.has(type);

  // Compute position: semantic steps get none, result steps use current node if available
  const computedPosition = (() => {
    if (isSemanticStep) return undefined;
    if (shouldUseContextNode && context.currentNode) {
      return getNodePosition(context.currentNode, context.sourceFile);
    }
    return undefined;
  })();

  const entry: TraceEntry = {
    step: context.trace.length,
    type,
    expression,
    level: context.level,
    // Always include current parameters in scope
    parameters: context.parameters.size > 0 ? Object.fromEntries(context.parameters) : undefined,
    position: computedPosition,
    // Track which union member is currently being evaluated
    currentUnionMember: context.currentUnionMember,
    // Track accumulated union results
    currentUnionResults: context.currentUnionResults,
    ...opts,
  };
  context.trace.push(entry);
}

/**
 * Evaluates type arguments with recursion prevention
 */
function evaluateTypeArguments(
  typeRef: ts.TypeReferenceNode,
  context: EvalContext
): Array<string> {
  const typeArgs = typeRef.typeArguments?.map(arg => arg.getText(context.sourceFile)) || [];
  const evaluatedArgs: Array<string> = [];

  if (!typeRef.typeArguments) {
    return typeArgs.map(arg => {
      if (context.parameters.has(arg)) {
        return context.parameters.get(arg)!;
      }
      return arg;
    });
  }

  // Initialize evaluatingArgs set if not present
  if (!context.evaluatingArgs) {
    context.evaluatingArgs = new Set();
  }

  for (const argNode of typeRef.typeArguments) {
    const argText = argNode.getText(context.sourceFile);

    if (ts.isTypeReferenceNode(argNode)) {
      const argTypeName = argNode.typeName.getText(context.sourceFile);
      // Check if it's a parameter reference first
      if (!argNode.typeArguments?.length && context.parameters.has(argTypeName)) {
        evaluatedArgs.push(context.parameters.get(argTypeName)!);
      }
      else if (context.evaluatingArgs.has(argText)) {
        // Prevent infinite recursion - use text form if already evaluating
        evaluatedArgs.push(argText);
      }
      else {
        // Evaluate the nested generic/reference
        context.evaluatingArgs.add(argText);
        context.level++;
        const evaluated = evaluateGenericCall(argNode, context);
        context.level--;
        context.evaluatingArgs.delete(argText);
        evaluatedArgs.push(evaluated);
      }
    }
    else {
      // For non-reference types, evaluate them
      context.level++;
      const evaluated = evaluateTypeNode(argNode, context);
      context.level--;
      evaluatedArgs.push(evaluated);
    }
  }

  return evaluatedArgs.length > 0 ? evaluatedArgs : typeArgs.map(arg => {
    if (context.parameters.has(arg)) {
      return context.parameters.get(arg)!;
    }
    return arg;
  });
}

/**
 * Binds type parameters to arguments with defaults
 */
function bindTypeParameters(
  aliasDecl: ts.TypeAliasDeclaration,
  substitutedArgs: Array<string>,
  context: EvalContext
): Map<string, string> {
  const oldParams = new Map(context.parameters);

  aliasDecl.typeParameters?.forEach((param, i) => {
    const paramName = param.name.text;
    let argValue: string;

    if (substitutedArgs[i]) {
      argValue = substitutedArgs[i];
    }
    else if (param.default) {
      argValue = param.default.getText(context.sourceFile);
    }
    else {
      argValue = "unknown";
    }

    context.parameters.set(paramName, argValue);
  });

  return oldParams;
}

/**
 * Extracts generic parameters from type alias declaration
 */
function extractGenericParams(
  aliasDecl: ts.TypeAliasDeclaration,
  context: EvalContext
): Record<string, string> {
  const genericParams: Record<string, string> = {};

  aliasDecl.typeParameters?.forEach(p => {
    const paramName = p.name.text;
    const argValue = context.parameters.get(paramName);
    if (argValue) {
      genericParams[paramName] = argValue;
    }
  });

  return genericParams;
}

/**
 * Intrinsic type names that TypeScript handles natively
 */
const INTRINSIC_TYPES = new Set([ "Uppercase", "Lowercase", "Capitalize", "Uncapitalize" ]);

/**
 * Evaluates intrinsic string transformation types (Uppercase, Lowercase, etc.)
 * @param typeName Name of the intrinsic type
 * @param typeArgs Evaluated type arguments
 * @param context Evaluation context
 * @param position Source position for tracing
 * @returns Evaluated result or null if not an intrinsic type
 */
function evaluateIntrinsicType(
  typeName: string,
  typeArgs: Array<string>,
  context: EvalContext,
  position?: TraceEntry["position"]
): string | null {
  if (!INTRINSIC_TYPES.has(typeName)) return null;
  if (typeArgs.length !== 1) return null;

  const arg = typeArgs[0]!; // Safe: checked length above
  const expr = `${typeName}<${arg}>`;

  // Check if argument is a union - need to distribute
  const unionMembers = parseUnionMembers(arg);

  if (unionMembers.length > 1) {
    // Union distribution: Uppercase<"a" | "b"> => "A" | "B"
    addTrace(context, "intrinsic_union_distribute", expr, {
      args: { input: arg },
      position,
    });

    const results: Array<string> = [];
    for (const member of unionMembers) {
      // Track current union member for visualization
      context.currentUnionMember = member;
      context.currentUnionResults = results.length > 0 ? results.join(" | ") : undefined;

      addTrace(context, "intrinsic_union_member", `${typeName}<${member}>`, {
        args: { member },
        position,
        currentUnionMember: member,
        currentUnionResults: context.currentUnionResults,
      });

      // Evaluate single member
      const memberResult = evalTypeString(`${typeName}<${member}>`);
      results.push(memberResult);
    }

    // Clear union tracking
    context.currentUnionMember = undefined;
    context.currentUnionResults = undefined;

    // Reduce and return
    const finalResult = evalTypeString(results.join(" | "));
    addTrace(context, "intrinsic_result", `${typeName}<${arg}> => ${finalResult}`, {
      result: finalResult,
      position,
    });

    return finalResult;
  }

  // Single value - direct evaluation
  addTrace(context, "intrinsic_type_start", expr, {
    args: { input: arg },
    position,
  });

  const result = evalTypeString(expr);

  addTrace(context, "intrinsic_result", `${expr} => ${result}`, {
    result,
    position,
  });

  return result;
}

/**
 * Parses a union type string into its members
 * e.g. '"a" | "b" | "c"' => ['"a"', '"b"', '"c"']
 */
function parseUnionMembers(typeStr: string): Array<string> {
  // Simple parsing - split on | but be careful with nested types
  const members: Array<string> = [];
  let current = "";
  let depth = 0;

  for (let i = 0; i < typeStr.length; i++) {
    const char = typeStr[i];
    if (char === "<" || char === "(" || char === "[" || char === "{") {
      depth++;
      current += char;
    }
    else if (char === ">" || char === ")" || char === "]" || char === "}") {
      depth--;
      current += char;
    }
    else if (char === "|" && depth === 0) {
      const trimmed = current.trim();
      if (trimmed) members.push(trimmed);
      current = "";
    }
    else {
      current += char;
    }
  }

  const trimmed = current.trim();
  if (trimmed) members.push(trimmed);

  return members;
}

/**
 * Evaluates a generic type instantiation and records trace steps
 * @param typeRef The generic type reference with arguments
 * @param context Evaluation context
 * @returns The resolved type string
 */
function evaluateGenericCall(typeRef: ts.TypeReferenceNode, context: EvalContext): string {
  const typeName = typeRef.typeName.getText(context.sourceFile);
  const typeArgs = typeRef.typeArguments?.map(arg => arg.getText(context.sourceFile)) || [];

  // Prevent infinite recursion - use TypeScript's max depth of 1000
  context.depth++;
  if (context.depth > MAX_RECURSION_DEPTH) {
    context.depth--;
    return typeArgs.length > 0 ? `${typeName}<${typeArgs.join(", ")}>` : typeName;
  }

  // First check if typeName is a parameter (e.g., `t` when inside `type T<t> = t`)
  // Only if no type arguments - a parameter with args would be invalid
  if (!typeArgs.length && context.parameters.has(typeName)) {
    context.depth--;
    return context.parameters.get(typeName)!;
  }

  // Evaluate type arguments - this traces nested generics
  const substitutedArgs = evaluateTypeArguments(typeRef, context);

  // Check for intrinsic types (Uppercase, Lowercase, etc.) FIRST
  const intrinsicResult = evaluateIntrinsicType(
    typeName,
    substitutedArgs,
    context,
    getNodePosition(typeRef, context.sourceFile)
  );
  if (intrinsicResult !== null) {
    context.depth--;
    return intrinsicResult;
  }

  // Log generic call
  addTrace(context, "generic_call", `${typeName}<${substitutedArgs.join(", ")}>`, {
    args: substitutedArgs.reduce((acc, arg, i) => ({ ...acc, [`arg${i}`]: arg }), {}),
    position: getNodePosition(typeRef, context.sourceFile),
  });

  // Look up the generic function/type alias
  const aliasDecl = context.allTypeAliases.get(typeName);
  if (!aliasDecl) {
    // Built-in or unknown type - return as-is
    context.depth--;
    return typeArgs.length > 0 ? `${typeName}<${substitutedArgs.join(", ")}>` : typeName;
  }

  // Non-generic type alias - still need to evaluate its body
  if (!aliasDecl.typeParameters) {
    // Log alias reference
    addTrace(context, "alias_reference", `${typeName} = ${aliasDecl.type.getText(context.sourceFile)}`, {
      position: getNodePosition(aliasDecl, context.sourceFile),
    });

    // Evaluate the type alias body
    context.level++;
    const result = evaluateTypeNode(aliasDecl.type, context);
    context.level--;

    context.depth--;
    return result;
  }

  // Bind parameters to arguments FIRST
  const oldParams = bindTypeParameters(aliasDecl, substitutedArgs, context);

  // For generic_def, only show the parameters defined by THIS generic, not all in-scope params
  const genericParams = extractGenericParams(aliasDecl, context);

  // Enter the generic definition at a higher level (so step-over skips it)
  context.level++;

  addTrace(context, "generic_def", aliasDecl.getText(context.sourceFile), {
    position: getNodePosition(aliasDecl, context.sourceFile),
    parameters: Object.keys(genericParams).length > 0 ? genericParams : undefined,
  });

  // Evaluate the type expression (already at higher level)
  const result = evaluateTypeNode(aliasDecl.type, context);
  context.level--;

  // Log the result of this generic call - position is the call site, not the definition
  addTrace(context, "generic_result", `${typeName} => ${result}`, {
    result: result,
    parameters: Object.keys(genericParams).length > 0 ? genericParams : undefined,
    position: getNodePosition(typeRef, context.sourceFile),
  });

  // Restore old parameters
  context.parameters.clear();
  oldParams.forEach((v, k) => context.parameters.set(k, v));

  context.depth--;
  return result;
}

/**
   * Substitute parameter references in a type expression
    */
function substituteParameters(expr: string, parameters: Map<string, string>): string {
  let result = expr;
  // Replace parameter references with their bound values
  // Sort by length (descending) to replace longer names first
  const sortedParams = Array.from(parameters.entries()).sort((a, b) => b[0].length - a[0].length);
  for (const [ paramName, paramValue ] of sortedParams) {
    // Use word boundary to avoid partial matches
    const regex = new RegExp(`\\b${paramName}\\b`, "g");
    result = result.replace(regex, paramValue);
  }
  return result;
}

/**
 * Helper: Calculate position for conditional comparison highlight
 */
function calculateConditionalPosition(
  condType: ts.ConditionalTypeNode,
  context: EvalContext
): { start: { line: number; character: number; }; end: { line: number; character: number; }; } {
  const comparisonStart = condType.checkType.getStart(context.sourceFile);
  const comparisonEnd = condType.extendsType.getEnd();
  const comparisonPosStart = context.sourceFile.getLineAndCharacterOfPosition(comparisonStart);
  const comparisonPosEnd = context.sourceFile.getLineAndCharacterOfPosition(comparisonEnd);
  return {
    start: { line: comparisonPosStart.line + 1, character: comparisonPosStart.character },
    end: { line: comparisonPosEnd.line + 1, character: comparisonPosEnd.character },
  };
}

/**
 * Helper: Clean up inferred bindings and log result
 */
function cleanupInferBindings(
  hasInfer: boolean,
  inferBindingsToCleanup: Array<string>,
  result: string,
  context: EvalContext,
  condType: ts.ConditionalTypeNode
): void {
  if (hasInfer && inferBindingsToCleanup.length > 0) {
    addTrace(context, "infer_pattern_result", result, {
      position: getNodePosition(condType, context.sourceFile),
      result,
    });
    for (const name of inferBindingsToCleanup) {
      context.parameters.delete(name);
    }
    context.inferredBindings = undefined;
    context.currentInferPattern = undefined;
  }
}

/**
 * Helper: Evaluate infer pattern matching and inject bindings
 */
function evaluateInferPattern(
  condType: ts.ConditionalTypeNode,
  context: EvalContext,
  checkStr: string,
  extendsStr: string,
  inferTypes: Array<{ name: string; position: ReturnType<typeof getNodePosition>; constraint?: string; }>
): { inferPatternMatched: boolean | undefined; inferBindingsToCleanup: Array<string>; } {
  const inferBindingsToCleanup: Array<string> = [];

  // Log pattern matching start
  addTrace(context, "infer_pattern_start", `Pattern: ${extendsStr}`, {
    position: getNodePosition(condType.extendsType, context.sourceFile),
  });

  // Get the resolved check value (substitute parameters)
  const resolvedCheck = substituteParameters(checkStr, context.parameters);

  // Extract inferred bindings
  const bindings = extractInferredBindings(
    resolvedCheck,
    extendsStr,
    inferTypes.map(i => i.name),
    context.sourceFile.text
  );

  if (bindings) {
    // Log successful pattern match
    addTrace(context, "infer_pattern_match", `${resolvedCheck} matches ${extendsStr}`, {
      position: getNodePosition(condType.extendsType, context.sourceFile),
      result: "true",
    });

    // Log each inferred binding
    for (const inferType of inferTypes) {
      const value = bindings.get(inferType.name);
      if (value !== undefined) {
        addTrace(context, "infer_binding", `${inferType.name} = ${value}`, {
          position: inferType.position,
          result: value,
        });

        // Inject binding into parameters for true branch
        context.parameters.set(inferType.name, value);
        inferBindingsToCleanup.push(inferType.name);
      }
    }

    // Store bindings in context for visualization
    context.inferredBindings = bindings;
    context.currentInferPattern = extendsStr;

    return { inferPatternMatched: true, inferBindingsToCleanup };
  }
  else {
    // Log failed pattern match
    addTrace(context, "infer_pattern_match", `${resolvedCheck} does not match ${extendsStr}`, {
      position: getNodePosition(condType.extendsType, context.sourceFile),
      result: "false",
    });

    return { inferPatternMatched: false, inferBindingsToCleanup };
  }
}

/**
 * Helper: Reduce union result and log if changed
 */
function reduceUnionResult(
  context: EvalContext,
  accumulatedUnion: string,
  branchNode: ts.TypeNode,
  member: string
): string {
  let reducedUnion;
  try {
    reducedUnion = evalTypeString(context.sourceFile.text, accumulatedUnion);
  }
  catch {
    // If reduction fails, keep the unreduced version
    reducedUnion = accumulatedUnion;
  }

  // Log reduction if it changed
  if (reducedUnion !== accumulatedUnion) {
    addTrace(context, "union_reduce", `${accumulatedUnion} => ${reducedUnion}`, {
      position: getNodePosition(branchNode, context.sourceFile),
      currentUnionMember: member,
      currentUnionResults: reducedUnion,
      result: reducedUnion,
    });
  }

  return reducedUnion;
}

/**
 * Helper: Evaluate a single union member
 */
function evaluateSingleUnionMember(
  condType: ts.ConditionalTypeNode,
  context: EvalContext,
  unionParam: string,
  member: string,
  checkStr: string,
  extendsStr: string,
  trueStr: string,
  falseStr: string,
  results: Array<string>
): string {
  // Set the union member context
  context.currentUnionMember = member;

  // Temporarily bind the parameter to this member
  const oldValue = context.parameters.get(unionParam)!;
  context.parameters.set(unionParam, member);

  // Log which member we're evaluating
  addTrace(context, "conditional_union_member", `Evaluating for ${unionParam} = ${member}`, {
    position: getNodePosition(condType.checkType, context.sourceFile),
    currentUnionMember: member,
    currentUnionResults: results.length > 0 ? results.join(" | ") : undefined,
  });

  // Check if this member satisfies the condition
  const memberCheckStr = substituteParameters(checkStr, context.parameters);
  const memberExtendsStr = substituteParameters(extendsStr, context.parameters);
  const memberIsTruthy = checkTypeCondition(memberCheckStr, memberExtendsStr, context.sourceFile.text);

  // Log detailed comparison steps for this member (same as non-union case)
  context.level++;
  addTrace(context, "conditional_evaluate_left", memberCheckStr, {
    position: getNodePosition(condType.checkType, context.sourceFile),
    currentUnionMember: member,
  });
  // Recursively evaluate check type to trace any nested generics
  evaluateTypeNode(condType.checkType, context);

  addTrace(context, "conditional_evaluate_right", memberExtendsStr, {
    position: getNodePosition(condType.extendsType, context.sourceFile),
    currentUnionMember: member,
  });
  // Recursively evaluate extends type to trace any nested generics
  evaluateTypeNode(condType.extendsType, context);
  context.level--;

  // Highlight only the comparison part for this member
  const position = calculateConditionalPosition(condType, context);
  addTrace(context, "conditional_comparison", `${memberCheckStr} extends ${memberExtendsStr}`, {
    position,
    currentUnionMember: member,
  });

  // Log evaluation result for this member
  const branchNode = memberIsTruthy ? condType.trueType : condType.falseType;
  addTrace(context, "conditional_evaluation", `${memberIsTruthy}`, {
    position: getNodePosition(branchNode, context.sourceFile),
    currentUnionMember: member,
    result: memberIsTruthy ? "true" : "false",
  });

  // Log which branch is taken for this member
  addTrace(context, memberIsTruthy ? "branch_true" : "branch_false", memberIsTruthy ? trueStr : falseStr, {
    position: getNodePosition(branchNode, context.sourceFile),
    currentUnionMember: member,
    currentUnionResults: results.length > 0 ? results.join(" | ") : undefined,
  });

  // Evaluate the appropriate branch for this member
  context.level++;
  const memberResult = memberIsTruthy
    ? evaluateTypeNode(condType.trueType, context)
    : evaluateTypeNode(condType.falseType, context);
  context.level--;

  // Restore the parameter
  context.parameters.set(unionParam, oldValue);

  return memberResult;
}

/**
 * Helper: Distribute conditional evaluation over union members
 */
function evaluateUnionDistribution(
  condType: ts.ConditionalTypeNode,
  context: EvalContext,
  unionParam: string,
  checkStr: string,
  extendsStr: string,
  trueStr: string,
  falseStr: string
): string | null {
  if (!context.parameters.has(unionParam)) {
    return null;
  }

  const paramValue = context.parameters.get(unionParam)!;
  const unionMembers = parseUnionType(paramValue);

  // Only distribute if we have a union (multiple members)
  if (unionMembers.length <= 1) {
    return null;
  }

  // Log union distribution
  addTrace(context, "conditional_union_distribute", `Union ${unionParam} = ${paramValue}`, {
    position: getNodePosition(condType.checkType, context.sourceFile),
  });

  // Evaluate conditional for each union member
  const results: Array<string> = [];
  const oldUnionMember = context.currentUnionMember;
  const oldUnionResults = context.currentUnionResults;

  for (const member of unionMembers) {
    const memberResult = evaluateSingleUnionMember(
      condType,
      context,
      unionParam,
      member,
      checkStr,
      extendsStr,
      trueStr,
      falseStr,
      results
    );

    results.push(memberResult);

    // Update accumulated results for visualization
    const accumulatedUnion = results.join(" | ");
    context.currentUnionResults = accumulatedUnion;

    // Reduce the union (remove never, simplify) after each member
    const branchNode = context.currentUnionMember === member ? condType.trueType : condType.falseType;
    const reducedUnion = reduceUnionResult(context, accumulatedUnion, branchNode, member);
    context.currentUnionResults = reducedUnion;
  }

  // Final reduced result
  const finalResult = context.currentUnionResults || results.join(" | ");
  context.currentUnionMember = oldUnionMember;
  context.currentUnionResults = oldUnionResults;

  return finalResult;
}

/**
 * Evaluates a conditional type and traces the branch taken
 * Handles union distribution for discriminative conditionals
 * @param condType Conditional type node
 * @param context Evaluation context
 * @returns The resolved type from the taken branch
 */
function evaluateConditional(condType: ts.ConditionalTypeNode, context: EvalContext): string {
  const checkStr = condType.checkType.getText(context.sourceFile);
  const extendsStr = condType.extendsType.getText(context.sourceFile);
  const trueStr = condType.trueType.getText(context.sourceFile);
  const falseStr = condType.falseType.getText(context.sourceFile);

  // Detect infer types in extends clause
  const inferTypes = findInferTypes(condType.extendsType, context.sourceFile);
  const hasInfer = inferTypes.length > 0;

  // Log condition entry
  addTrace(context, "condition", `${checkStr} extends ${extendsStr} ? ${trueStr} : ${falseStr}`, {
    position: getNodePosition(condType, context.sourceFile),
  });

  // Log LHS/RHS evaluation BEFORE infer pattern matching
  context.level++;
  addTrace(context, "conditional_evaluate_left", checkStr, {
    position: getNodePosition(condType.checkType, context.sourceFile),
  });
  evaluateTypeNode(condType.checkType, context);

  addTrace(context, "conditional_evaluate_right", extendsStr, {
    position: getNodePosition(condType.extendsType, context.sourceFile),
  });
  evaluateTypeNode(condType.extendsType, context);
  context.level--;

  // Handle infer pattern matching
  let inferPatternMatched: boolean | undefined = undefined;
  let inferBindingsToCleanup: Array<string> = [];
  if (hasInfer) {
    const inferResult = evaluateInferPattern(condType, context, checkStr, extendsStr, inferTypes);
    inferPatternMatched = inferResult.inferPatternMatched;
    inferBindingsToCleanup = inferResult.inferBindingsToCleanup;
  }

  // Check for union distribution
  const distributiveParam = getDistributiveParameter(condType.checkType, context.sourceFile);
  const discriminativeParam = getDiscriminativeParameter(condType.checkType, condType.extendsType, context.sourceFile);
  const unionParam = distributiveParam || discriminativeParam;

  if (unionParam) {
    const unionResult = evaluateUnionDistribution(condType, context, unionParam, checkStr, extendsStr, trueStr, falseStr);
    if (unionResult !== null) {
      cleanupInferBindings(hasInfer, inferBindingsToCleanup, unionResult, context, condType);
      return unionResult;
    }
  }

  // Non-union case: standard evaluation
  addTrace(context, "conditional_comparison", `${checkStr} extends ${extendsStr}`, {
    position: calculateConditionalPosition(condType, context),
  });

  // Use infer pattern match result if available, otherwise call checkTypeCondition
  const isTruthy = inferPatternMatched !== undefined
    ? inferPatternMatched
    : checkTypeCondition(substituteParameters(checkStr, context.parameters), substituteParameters(extendsStr, context.parameters), context.sourceFile.text);

  const branchNode = isTruthy ? condType.trueType : condType.falseType;

  addTrace(context, "conditional_evaluation", `${isTruthy}`, {
    position: getNodePosition(branchNode, context.sourceFile),
    result: isTruthy ? "true" : "false",
  });

  addTrace(context, isTruthy ? "branch_true" : "branch_false", isTruthy ? trueStr : falseStr, {
    position: getNodePosition(branchNode, context.sourceFile),
  });

  context.level++;
  const result = isTruthy
    ? evaluateTypeNode(condType.trueType, context)
    : evaluateTypeNode(condType.falseType, context);
  context.level--;

  cleanupInferBindings(hasInfer, inferBindingsToCleanup, result, context, condType);

  return result;
}

/**
 * Evaluates a template literal type with union distribution
 * Template literals like `Prop ${A | B}` become "Prop A" | "Prop B"
 * Multiple interpolations create cartesian product: `${A|B}-${1|2}` => 4 results
 * @param templateType Template literal type node
 * @param context Evaluation context
 * @returns The resolved type (union of string literals)
 */
function evaluateTemplateLiteral(templateType: ts.TemplateLiteralTypeNode, context: EvalContext): string {
  const text = templateType.getText(context.sourceFile);

  // Check if this template contains infer types (pattern matching context)
  // In pattern context, we don't evaluate ${infer X} as regular interpolations
  const inferTypes = findInferTypes(templateType, context.sourceFile);
  if (inferTypes.length > 0) {
    // This is a pattern template, return raw pattern string without evaluation
    return text;
  }

  // Log template literal start
  addTrace(context, "template_literal_start", text, {
    position: getNodePosition(templateType, context.sourceFile),
  });

  // Parse template structure: head + spans
  // Template: `prefix${T}middle${U}suffix`
  // head = "prefix", spans = [{type: T, literal: "middle"}, {type: U, literal: "suffix"}]
  const head = templateType.head.text; // text before first ${}
  const spans = templateType.templateSpans;

  // If no interpolations, return as simple string literal
  if (spans.length === 0) {
    const result = `"${head}"`;
    addTrace(context, "template_result", result, {
      position: getNodePosition(templateType, context.sourceFile),
      result,
    });
    return result;
  }

  // Evaluate each span's type and collect results
  // Each span can resolve to a union, so we need cartesian product
  type SpanResult = {
    values: Array<string>; // evaluated values (could be union members)
    followingText: string; // literal text after this span
  };

  const spanResults: Array<SpanResult> = [];

  context.level++;
  for (const span of spans) {
    // Evaluate the type inside ${}
    const spanTypeStr = span.type.getText(context.sourceFile);

    // Log span evaluation
    addTrace(context, "template_span_eval", `\${${spanTypeStr}}`, {
      position: getNodePosition(span.type, context.sourceFile),
    });

    // Always evaluate the span type for complete tracing of nested generics
    const evaluatedType = evaluateTypeNode(span.type, context);

    // Use real TS type checker to get accurate result
    let resolvedType: string;
    try {
      resolvedType = evalTypeString(context.sourceFile.text, evaluatedType);
    }
    catch {
      resolvedType = evaluatedType;
    }

    // Parse as union (could be single value or union)
    const values = parseUnionType(resolvedType);

    // Get the text following this span
    const followingText = span.literal.text;

    spanResults.push({ values, followingText });
  }
  context.level--;

  // Check if any span has multiple values (union)
  const hasUnion = spanResults.some(sr => sr.values.length > 1);

  if (hasUnion) {
    // Log union distribution
    const unionSpans = spanResults
      .map((sr, i) => sr.values.length > 1 ? `\${${spans[i]?.type.getText(context.sourceFile)}} = ${sr.values.join(" | ")}` : null)
      .filter(Boolean)
      .join(", ");

    addTrace(context, "template_union_distribute", `Union in ${unionSpans}`, {
      position: getNodePosition(templateType, context.sourceFile),
    });
  }

  // Generate cartesian product of all combinations
  // Track all final results separately from trace accumulation
  const allResults: Array<string> = [];

  // Helper: Remove quotes from string literals
  const cleanLiteralValue = (value: string): string => {
    if ((value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    return value;
  };

  // Helper: Save state, add trace, restore state
  const traceUnionCombination = (
    value: string,
    spanIndex: number,
    resultsBefore: number,
    recurse: () => void
  ): void => {
    const oldUnionMember = context.currentUnionMember;
    const oldUnionResults = context.currentUnionResults;

    context.currentUnionMember = value;
    context.currentUnionResults = allResults.length > 0 ? allResults.join(" | ") : undefined;

    const spanType = spans[spanIndex]?.type;
    addTrace(context, "template_union_member", `Evaluating for ${value}`, {
      position: spanType ? getNodePosition(spanType, context.sourceFile) : undefined,
      currentUnionMember: value,
      currentUnionResults: allResults.length > 0 ? allResults.join(" | ") : undefined,
    });

    recurse();

    // Log the result(s) that were added
    const newResults = allResults.slice(resultsBefore);
    if (newResults.length > 0) {
      const newAccumulated = allResults.join(" | ");
      context.currentUnionMember = value;
      context.currentUnionResults = newAccumulated;

      const spanTypeForResult = spans[spanIndex]?.type;
      addTrace(context, "template_union_member_result", `=> ${newResults.join(" | ")}`, {
        position: spanTypeForResult ? getNodePosition(spanTypeForResult, context.sourceFile) : undefined,
        currentUnionMember: value,
        currentUnionResults: newAccumulated,
        result: newResults.join(" | "),
      });
    }

    context.currentUnionMember = oldUnionMember;
    context.currentUnionResults = oldUnionResults;
  };

  // Helper: Process single value (with or without tracing)
  const processValue = (
    value: string,
    prefix: string,
    span: SpanResult,
    spanIndex: number,
    recurse: (newPrefix: string) => void
  ): void => {
    const cleanValue = cleanLiteralValue(value);
    const newPrefix = prefix + cleanValue + span.followingText;

    // Check if we need tracing for this value
    const needsTrace = hasUnion && span.values.length > 1;
    if (!needsTrace) {
      recurse(newPrefix);
      return;
    }

    const resultsBefore = allResults.length;
    traceUnionCombination(value, spanIndex, resultsBefore, () => {
      recurse(newPrefix);
    });
  };

  // Recursive function to generate all combinations
  const generateCombinations = (
    prefix: string,
    spanIndex: number
  ): void => {
    if (spanIndex >= spanResults.length) {
      allResults.push(`"${prefix}"`);
      return;
    }

    const span = spanResults[spanIndex];
    if (!span) return;

    for (const value of span.values) {
      processValue(value, prefix, span, spanIndex, newPrefix => {
        generateCombinations(newPrefix, spanIndex + 1);
      });
    }
  };

  generateCombinations(head, 0);

  // Join as union
  let finalResult = allResults.join(" | ");

  // Reduce the union using real TS type checker
  try {
    finalResult = evalTypeString(context.sourceFile.text, finalResult);
  }
  catch {
    // Keep unreduced if evaluation fails
  }

  // Log final result
  addTrace(context, "template_result", finalResult, {
    position: getNodePosition(templateType, context.sourceFile),
    result: finalResult,
  });

  return finalResult;
}

/**
 * Check if a conditional should distribute over a union (TypeScript distributive conditional behavior)
 * Distribution happens when check type is a naked type parameter bound to a union
 * For example: T extends any ? T[] : never distributes over string | number
 * Returns the parameter name if distribution should happen
 */
function getDistributiveParameter(checkNode: ts.TypeNode, sourceFile: ts.SourceFile): string | null {
  // Check if checkType is a simple type reference (identifier, not a generic call)
  if (!ts.isTypeReferenceNode(checkNode) || checkNode.typeArguments?.length) {
    return null;
  }

  return checkNode.getText(sourceFile);
}

/**
 * Check if a conditional is discriminative (parameter in check type varies based on extends type)
 * Discriminative means: the check type is a parameter and the extends type restricts that parameter
 * For example: T extends "a" ? ... : ... is discriminative
 * But: T extends string ? ... : ... is NOT discriminative (all strings match equally)
 */
function getDiscriminativeParameter(checkNode: ts.TypeNode, extendsNode: ts.TypeNode, sourceFile: ts.SourceFile): string | null {
  // Check if checkType is a simple type reference (identifier, not a generic call)
  if (!ts.isTypeReferenceNode(checkNode) || checkNode.typeArguments?.length) {
    return null;
  }

  const checkStr = checkNode.getText(sourceFile);
  const extendsStr = extendsNode.getText(sourceFile);

  // For discriminative: the extends type should be more restrictive than just a broad type
  // Examples of discriminative:
  //   str extends "a" ? ...  (checks against specific literal)
  //   str extends { x: any } ? ... (checks against specific structure)
  //   str extends readonly any[] ? ... (checks against specific shape)
  // Not discriminative:
  //   str extends string ? ... (string includes all string literals)
  //   str extends any ? ... (any matches everything)

  // Broad types that are non-discriminative
  const nonDiscriminativeTypes = new Set([ "string", "number", "boolean", "any", "unknown", "symbol", "bigint", "never", "{}", "object", "string | number", "PropertyKey" ]);

  if (nonDiscriminativeTypes.has(extendsStr)) {
    return null;
  }

  // If extends type starts with a quote (string literal) or has specific structure, it's discriminative
  if (extendsStr.startsWith("\"") || extendsStr.startsWith("'") || extendsStr.startsWith("{") || extendsStr.startsWith("[")) {
    return checkStr;
  }

  return null;
}

/**
 * Parse a union type string into its component types
 * Handles "A | B | C" format
 */
function parseUnionType(typeStr: string): Array<string> {
  const parts = typeStr.split(" | ").map(p => p.trim());
  return parts.filter(p => p.length > 0);
}

/**
 * Evaluate a mapped type and trace iterations
 */
function evaluateMappedType(mappedType: ts.MappedTypeNode, context: EvalContext): string {
  const mappedStr = mappedType.getText(context.sourceFile);
  addTrace(context, "mapped_type_start", mappedStr, {
    position: getNodePosition(mappedType, context.sourceFile),
  });

  // Get the type parameter (loop variable)
  const typeParam = mappedType.typeParameter;
  const loopVarName = typeParam.name.text;

  // Log constraint evaluation
  const constraintStr = typeParam.constraint?.getText(context.sourceFile) || "string | number | symbol";
  addTrace(context, "mapped_type_constraint", `${loopVarName} in ${constraintStr}`, {
    position: getNodePosition(typeParam.constraint || mappedType, context.sourceFile),
  });

  // Evaluate the constraint to get iteration keys
  let keys: Array<string> = [];
  if (typeParam.constraint) {
    // First trace through the constraint evaluation (for visibility)
    context.level++;
    const constraintResult = evaluateTypeNode(typeParam.constraint, context);
    context.level--;

    // Then use real TS type checker to get accurate resolved type
    const constraintStr = substituteParameters(
      typeParam.constraint.getText(context.sourceFile),
      context.parameters
    );
    let realResult: string;
    try {
      realResult = evalTypeString(context.sourceFile.text, constraintStr);
    }
    catch {
      // Fallback to traced result if evaluation fails
      realResult = constraintResult;
    }
    keys = parseUnionType(realResult);

    // Log the resolved constraint
    addTrace(context, "mapped_type_constraint_result", `${loopVarName} in (${keys.join(" | ")})`, {
      result: realResult,
    });
  }

  // Evaluate mapped type body for each key and build object entries
  const mappedEntries: Record<string, string> = {};
  const mappedResults: Array<string> = [];
  const oldParams = new Map(context.parameters);

  for (const key of keys) {
    // Bind loop variable to current key
    context.parameters.set(loopVarName, key);

    addTrace(context, "map_iteration", `${loopVarName} = ${key}`, {
      position: getNodePosition(typeParam, context.sourceFile),
    });

    // Evaluate the type body for this iteration
    if (mappedType.type) {
      context.level++;
      const iterResult = evaluateTypeNode(mappedType.type, context);
      context.level--;
      mappedEntries[key] = iterResult;
      mappedResults.push(iterResult);
    }
  }

  // Restore parameters
  context.parameters.clear();
  oldParams.forEach((v, k) => context.parameters.set(k, v));

  // Log the constructed object type
  const objStr = JSON.stringify(mappedEntries);
  addTrace(context, "mapped_type_result", `Constructed object: ${objStr}`, {
    result: objStr,
  });

  // Return union of all mapped values
  const resultStr = mappedResults.join(" | ");
  addTrace(context, "mapped_type_end", `mapped type union: ${resultStr}`, {
    result: resultStr,
  });

  return resultStr;
}

/**
 * Evaluate indexed access type
 */
function evaluateIndexedAccess(indexedType: ts.IndexedAccessTypeNode, context: EvalContext): string {
  const objTypeStr = indexedType.objectType.getText(context.sourceFile);
  const indexTypeStr = indexedType.indexType.getText(context.sourceFile);

  addTrace(context, "indexed_access", `${objTypeStr}[${indexTypeStr}]`, {
    position: getNodePosition(indexedType, context.sourceFile),
  });

  // Evaluate the object type for tracing (shows internal steps)
  context.level++;
  evaluateTypeNode(indexedType.objectType, context);
  context.level--;

  // Evaluate the index type for tracing (shows internal steps)
  context.level++;
  evaluateTypeNode(indexedType.indexType, context);
  context.level--;

  // Use real TS type checker to resolve the FULL indexed access expression
  // Important: Don't use the evaluated results, use the ORIGINAL expression with substituted params
  // This avoids issues where mapped type returns union of values instead of the object structure
  const substitutedObj = substituteParameters(objTypeStr, context.parameters);
  const substitutedIndex = substituteParameters(indexTypeStr, context.parameters);
  const fullExpr = `(${substitutedObj})[${substitutedIndex}]`;

  let finalResult;
  try {
    finalResult = evalTypeString(context.sourceFile.text, fullExpr);
  }
  catch {
    // Fallback to unresolved form if evaluation fails
    finalResult = fullExpr;
  }

  // Log the result of indexing
  addTrace(context, "indexed_access_result", `Extracted: ${finalResult}`, {
    result: finalResult,
  });

  return finalResult;
}

/**
 * Main type node evaluator
 */
function evaluateTypeNode(typeNode: ts.TypeNode, context: EvalContext): string {
  // Prevent infinite recursion
  context.depth++;
  if (context.depth > MAX_RECURSION_DEPTH) {
    context.depth--;
    return typeNode.getText(context.sourceFile);
  }

  // Save previous node and set current node
  const previousNode = context.currentNode;
  context.currentNode = typeNode;

  let result: string;

  if (ts.isTypeReferenceNode(typeNode)) {
    result = evaluateGenericCall(typeNode, context);
  }
  else if (ts.isConditionalTypeNode(typeNode)) {
    result = evaluateConditional(typeNode, context);
  }
  else if (ts.isTemplateLiteralTypeNode(typeNode)) {
    result = evaluateTemplateLiteral(typeNode, context);
  }
  else if (ts.isMappedTypeNode(typeNode)) {
    result = evaluateMappedType(typeNode, context);
  }
  else if (ts.isIndexedAccessTypeNode(typeNode)) {
    result = evaluateIndexedAccess(typeNode, context);
  }
  else if (ts.isUnionTypeNode(typeNode)) {
    context.level++;
    const members = typeNode.types.map(t => evaluateTypeNode(t, context));
    context.level--;
    result = members.join(" | ");
  }
  else if (ts.isIntersectionTypeNode(typeNode)) {
    context.level++;
    const members = typeNode.types.map(t => evaluateTypeNode(t, context));
    context.level--;
    result = members.join(" & ");
  }
  else if (ts.isTupleTypeNode(typeNode)) {
    context.level++;
    const elements = typeNode.elements.map(el => {
      // Handle named tuple elements: [name: Type]
      if (ts.isNamedTupleMember(el)) {
        const name = el.name.getText(context.sourceFile);
        const type = evaluateTypeNode(el.type, context);
        return `${name}: ${type}`;
      }
      return evaluateTypeNode(el, context);
    });
    context.level--;
    result = `[${elements.join(", ")}]`;
  }
  else {
    // Fallback for simple types
    result = typeNode.getText(context.sourceFile);
  }

  // Restore previous node
  context.currentNode = previousNode;
  context.depth--;
  return result;
}

/**
 * Main entry point: trace the resolution of a type alias
 * @param ast SourceFile AST
 * @param typeName Name of the type to trace
 * @returns Array of trace entries showing evaluation steps
 */
export function traceTypeResolution(ast: ts.SourceFile, typeName: string): Array<TraceEntry> {
  // Build map of all type aliases
  const allTypeAliases = new Map<string, ts.TypeAliasDeclaration>();
  const typeAliases = getTypeAliases(ast);
  typeAliases.forEach(alias => {
    allTypeAliases.set(alias.name.text, alias);
  });

  // Find the target type
  const targetAlias = allTypeAliases.get(typeName);
  if (!targetAlias) {
    return [];
  }

  // Create evaluation context
  const context: EvalContext = {
    sourceFile: ast,
    trace: [],
    level: 0,
    depth: 0,
    parameters: new Map(),
    allTypeAliases,
  };

  // Add initial trace entry for the type alias definition
  addTrace(context, "type_alias_start", targetAlias.getText(ast), {
    position: getNodePosition(targetAlias, ast),
  });

  // Start evaluation and capture result
  const result = evaluateTypeNode(targetAlias.type, context);

  // Add final trace entry with the resolved result
  addTrace(context, "type_alias_result", `${typeName} = ${result}`, {
    position: getNodePosition(targetAlias, ast),
    result,
  });

  return context.trace;
}
