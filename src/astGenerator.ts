import ts from 'typescript';
import {CustomTypes} from "./base.ts";
import * as process from "node:process";
import {checkTypeCondition, evalTypeString} from "./eval_local.ts";

/**
 * Represents a single step in type evaluation trace
 */
export interface TraceEntry {
  step: number;
  type: 'type_alias_start' | 'generic_call' | 'generic_def' | 'generic_result' | 'condition' | 'conditional_evaluate_left' | 'conditional_evaluate_right' | 'conditional_comparison' | 'conditional_evaluation' | 'branch_true' | 'branch_false' | 'result_assignment' | 'template_literal' | 'alias_reference' | 'substitution' | 'mapped_type_start' | 'mapped_type_constraint' | 'mapped_type_constraint_result' | 'map_iteration' | 'mapped_type_result' | 'mapped_type_end' | 'indexed_access' | 'indexed_access_result' | 'conditional_union_distribute' | 'conditional_union_member' | 'union_reduce';
  expression: string;
  parameters?: Record<string, string>;
  args?: Record<string, string>;
  result?: string;
  level: number;
  position?: {
    start: { line: number; character: number };
    end: { line: number; character: number };
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
export function generateAST(code: string, fileName = 'generated.ts'): ts.SourceFile {
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
export function visitNodes(node: ts.Node, visitor: (n: ts.Node) => void): void {
  visitor(node);
  ts.forEachChild(node, (child) => visitNodes(child, visitor));
}

/**
 * Prints AST structure for debugging
 * @param ast SourceFile AST
 * @param maxDepth Max recursion depth
 */
export function printAST(ast: ts.SourceFile, maxDepth = 10): string {
  const lines: string[] = [];

  function print(node: ts.Node, depth = 0) {
    if (depth > maxDepth) return;

    const indent = '  '.repeat(depth);
    const kind = ts.SyntaxKind[node.kind];
    const text = node.getText(ast).slice(0, 40).replace(/\n/g, ' ');

    lines.push(`${indent}${kind}${text ? ` "${text}..."` : ''}`);

    ts.forEachChild(node, (child) => print(child, depth + 1));
  }

  print(ast);
  return lines.join('\n');
}

/**
 * Gets all nodes of a specific kind from AST
 * @param ast SourceFile AST
 * @param kind SyntaxKind to filter by
 */
export function findNodes(ast: ts.SourceFile, kind: ts.SyntaxKind): ts.Node[] {
  const results: ts.Node[] = [];

  visitNodes(ast, (node) => {
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

  visitNodes(ast, (node) => {
    if (result) return; // Early exit once found

    if (
      ts.isTypeAliasDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isFunctionDeclaration(node) ||
      ts.isVariableDeclaration(node) ||
      ts.isEnumDeclaration(node)
    ) {
      if ((node as any).name?.text === name) {
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
export function getTypeAliases(ast: ts.SourceFile): ts.TypeAliasDeclaration[] {
  return findNodes(ast, ts.SyntaxKind.TypeAliasDeclaration) as ts.TypeAliasDeclaration[];
}

/**
 * Gets a TypeAliasDeclaration by name
 * @param ast SourceFile AST
 * @param name Type alias name
 * @returns TypeAliasDeclaration or undefined
 */
export function getTypeAliasByName(ast: ts.SourceFile, name: string): ts.TypeAliasDeclaration | undefined {
  const aliases = getTypeAliases(ast);
  return aliases.find((alias) => alias.name.text === name);
}

/**
 * Extracts the type expression from a TypeAliasDeclaration
 * @param alias TypeAliasDeclaration node
 * @param sourceFile SourceFile for getText()
 * @returns Type expression as string
 */
export function getTypeAliasType(alias: ts.TypeAliasDeclaration, sourceFile: ts.SourceFile): string {
  return alias.type.getText(sourceFile);
}

/**
 * Type evaluation context for tracing
 */
interface EvalContext {
  sourceFile: ts.SourceFile;
  trace: TraceEntry[];
  level: number;
  parameters: Map<string, string>;
  allTypeAliases: Map<string, ts.TypeAliasDeclaration>;
  currentNode?: ts.Node; // Track the node being evaluated for result steps
  currentUnionMember?: string; // Track which union member is being evaluated
  currentUnionResults?: string; // Track accumulating union results
}

/**
 * Helper to get position info from AST node
 */
function getNodePosition(node: ts.Node, sourceFile: ts.SourceFile): { start: { line: number; character: number }; end: { line: number; character: number } } | undefined {
  try {
    const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd());
    return {
      start: { line: start.line + 1, character: start.character },
      end: { line: end.line + 1, character: end.character },
    };
  } catch {
    return undefined;
  }
}

/**
 * Add trace entry helper
 */
function addTrace(context: EvalContext, type: TraceEntry['type'], expression: string, opts: Partial<TraceEntry> = {}): void {
  // For result steps without explicit position, use current node context
  // Exclude semantic steps that don't correspond to specific code locations
  const resultTypes = new Set(['mapped_type_constraint_result', 'mapped_type_result', 'mapped_type_end', 'indexed_access_result', 'template_literal']);
  const semanticSteps = new Set(['conditional_evaluation']); // No auto-position for these

  const shouldUseContextNode = resultTypes.has(type) && !opts.position && context.currentNode;
  const isSemanticStep = semanticSteps.has(type);

  const entry: TraceEntry = {
    step: context.trace.length + 1,
    type,
    expression,
    level: context.level,
    // Always include current parameters in scope
    parameters: context.parameters.size > 0 ? Object.fromEntries(context.parameters) : undefined,
    // For result steps, use current node position if no explicit position provided
    // Semantic steps don't get auto-positioned
    position: isSemanticStep ? undefined : (shouldUseContextNode && context.currentNode ? getNodePosition(context.currentNode, context.sourceFile) : undefined),
    // Track which union member is currently being evaluated
    currentUnionMember: context.currentUnionMember,
    // Track accumulated union results
    currentUnionResults: context.currentUnionResults,
    ...opts,
  };
  context.trace.push(entry);
}

/**
 * Evaluates a generic type instantiation and records trace steps
 * @param typeRef The generic type reference with arguments
 * @param context Evaluation context
 * @returns The resolved type string
 */
export function evaluateGenericCall(typeRef: ts.TypeReferenceNode, context: EvalContext): string {
  const typeName = typeRef.typeName.getText(context.sourceFile);
  const typeArgs = typeRef.typeArguments?.map(arg => arg.getText(context.sourceFile)) || [];

  // Substitute any parameters in the type arguments
  const substitutedArgs = typeArgs.map(arg => {
    // If arg is a parameter name that's in scope, replace it with its bound value
    if (context.parameters.has(arg)) {
      return context.parameters.get(arg)!;
    }
    return arg;
  });

  // Log generic call
  addTrace(context, 'generic_call', `${typeName}<${substitutedArgs.join(', ')}>`, {
    args: substitutedArgs.reduce((acc, arg, i) => ({ ...acc, [`arg${i}`]: arg }), {}),
    position: getNodePosition(typeRef, context.sourceFile),
  });

  // Look up the generic function/type alias
  const aliasDecl = context.allTypeAliases.get(typeName);
  if (!aliasDecl || !aliasDecl.typeParameters) {
    return `${typeName}<${substitutedArgs.join(', ')}>`;
  }

  // Bind parameters to arguments FIRST
  const oldParams = new Map(context.parameters);
  aliasDecl.typeParameters.forEach((param, i) => {
    const paramName = param.name.text;
    let argValue: string;

    if (substitutedArgs[i]) {
      // Use provided argument (already substituted)
      argValue = substitutedArgs[i];
    } else if (param.default) {
      // Use default value from type parameter definition
      argValue = param.default.getText(context.sourceFile);
    } else {
      // No argument and no default
      argValue = 'unknown';
    }

    context.parameters.set(paramName, argValue);
  });

  // Log generic definition (now with parameters in scope)
  const paramList = aliasDecl.typeParameters
    .map((p, i) => {
      const paramName = p.name.text;
      const argValue = context.parameters.get(paramName);
      return `${paramName}${argValue ? ` = ${argValue}` : ''}`;
    })
    .join(', ');

  // For generic_def, only show the parameters defined by THIS generic, not all in-scope params
  const genericParams: Record<string, string> = {};
  aliasDecl.typeParameters.forEach((p) => {
    const paramName = p.name.text;
    const argValue = context.parameters.get(paramName);
    if (argValue) {
      genericParams[paramName] = argValue;
    }
  });

  addTrace(context, 'generic_def', `type ${typeName}<${paramList}> = ...`, {
    position: getNodePosition(aliasDecl, context.sourceFile),
    parameters: Object.keys(genericParams).length > 0 ? genericParams : undefined,
  });

  // Evaluate the type expression
  context.level++;
  const result = evaluateTypeNode(aliasDecl.type, context);
  context.level--;

  // Log the result of this generic call
  addTrace(context, 'generic_result', `${typeName} => ${result.slice(0, 60)}${result.length > 60 ? '...' : ''}`, {
    result: result,
    parameters: Object.keys(genericParams).length > 0 ? genericParams : undefined,
    position: getNodePosition(aliasDecl, context.sourceFile),
  });

  // Restore old parameters
  context.parameters.clear();
  oldParams.forEach((v, k) => context.parameters.set(k, v));

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
        for (const [paramName, paramValue] of sortedParams) {
          // Use word boundary to avoid partial matches
          const regex = new RegExp(`\\b${paramName}\\b`, 'g');
          result = result.replace(regex, paramValue);
        }
        return result;
      }

/**
 * Evaluates a conditional type and traces the branch taken
 * Handles union distribution for discriminative conditionals
 * @param condType Conditional type node
 * @param context Evaluation context
 * @returns The resolved type from the taken branch
 */
export function evaluateConditional(condType: ts.ConditionalTypeNode, context: EvalContext): string {
  const checkStr = condType.checkType.getText(context.sourceFile);
  const extendsStr = condType.extendsType.getText(context.sourceFile);
  const trueStr = condType.trueType.getText(context.sourceFile);
  const falseStr = condType.falseType.getText(context.sourceFile);

  // Log condition entry with position of the entire conditional expression
  addTrace(context, 'condition', `${checkStr} extends ${extendsStr} ? ${trueStr} : ${falseStr}`, {
    position: getNodePosition(condType, context.sourceFile),
  });

  // Check if this is a discriminative conditional with a union
  const discriminativeParam = getDiscriminativeParameter(condType.checkType, condType.extendsType, context.sourceFile);

  if (discriminativeParam && context.parameters.has(discriminativeParam)) {
    const paramValue = context.parameters.get(discriminativeParam)!;
    const unionMembers = parseUnionType(paramValue);

    // Only distribute if we have a union (multiple members)
    if (unionMembers.length > 1) {
      // Log union distribution
      addTrace(context, 'conditional_union_distribute', `Union ${discriminativeParam} = ${paramValue}`, {
        position: getNodePosition(condType.checkType, context.sourceFile),
      });

      // Evaluate conditional for each union member
      const results: string[] = [];
      const oldUnionMember = context.currentUnionMember;
      const oldUnionResults = context.currentUnionResults;

      for (const member of unionMembers) {
        // Set the union member context
        context.currentUnionMember = member;

        // Temporarily bind the parameter to this member
        const oldValue = context.parameters.get(discriminativeParam)!;
        context.parameters.set(discriminativeParam, member);

        // Log which member we're evaluating
        addTrace(context, 'conditional_union_member', `Evaluating for ${discriminativeParam} = ${member}`, {
          position: getNodePosition(condType.checkType, context.sourceFile),
          currentUnionMember: member,
          currentUnionResults: results.length > 0 ? results.join(' | ') : undefined,
        });

        // Check if this member satisfies the condition
        const memberCheckStr = substituteParameters(checkStr, context.parameters);
        const memberExtendsStr = substituteParameters(extendsStr, context.parameters);
        const memberIsTruthy = checkTypeCondition(memberCheckStr, memberExtendsStr, context.sourceFile.text);

        // Log which branch is taken for this member
        const branchNode = memberIsTruthy ? condType.trueType : condType.falseType;
        addTrace(context, memberIsTruthy ? 'branch_true' : 'branch_false', memberIsTruthy ? trueStr : falseStr, {
          position: getNodePosition(branchNode, context.sourceFile),
          currentUnionMember: member,
          currentUnionResults: results.length > 0 ? results.join(' | ') : undefined,
        });

        // Evaluate the appropriate branch for this member
        context.level++;
        const memberResult = memberIsTruthy
          ? evaluateTypeNode(condType.trueType, context)
          : evaluateTypeNode(condType.falseType, context);
        context.level--;

        results.push(memberResult);

        // Update accumulated results for visualization
        const accumulatedUnion = results.join(' | ');
        context.currentUnionResults = accumulatedUnion;

        // Reduce the union (remove never, simplify) after each member
        let reducedUnion = accumulatedUnion;
        try {
          reducedUnion = evalTypeString(context.sourceFile.text, accumulatedUnion);
        } catch {
          // If reduction fails, keep the unreduced version
          reducedUnion = accumulatedUnion;
        }

        // Log reduction if it changed
        if (reducedUnion !== accumulatedUnion) {
          addTrace(context, 'union_reduce', `${accumulatedUnion} => ${reducedUnion}`, {
            position: getNodePosition(branchNode, context.sourceFile),
            currentUnionMember: member,
            currentUnionResults: reducedUnion,
            result: reducedUnion,
          });
          context.currentUnionResults = reducedUnion;
        }

        // Restore the parameter
        context.parameters.set(discriminativeParam, oldValue);
      }

      // Final reduced result
      const finalResult = context.currentUnionResults || results.join(' | ');
      context.currentUnionMember = oldUnionMember;
      context.currentUnionResults = oldUnionResults;
      return finalResult;
    }
  }

  // Non-discriminative or non-union case: standard evaluation
  // Log left side (check type)
  context.level++;
  addTrace(context, 'conditional_evaluate_left', checkStr, {
    position: getNodePosition(condType.checkType, context.sourceFile),
  });

  // Log right side (extends type)
  addTrace(context, 'conditional_evaluate_right', extendsStr, {
    position: getNodePosition(condType.extendsType, context.sourceFile),
  });
  context.level--;

  // Log comparison operation (check extends extends)
  addTrace(context, 'conditional_comparison', `${checkStr} extends ${extendsStr}`,
      {
        position: getNodePosition(condType.checkType, context.sourceFile),
    });

  const isTruthy = checkTypeCondition(substituteParameters(checkStr, context.parameters ), substituteParameters(extendsStr, context.parameters ), context.sourceFile.text)

  // Get branch node for highlighting
  const branchNode = isTruthy ? condType.trueType : condType.falseType;

  // Log evaluation result (point to the branch that was selected)
  addTrace(context, 'conditional_evaluation', `${isTruthy}`, {
    position: getNodePosition(branchNode, context.sourceFile),
    result: isTruthy ? 'true' : 'false',
  });

  // Log branch taken
  addTrace(context, isTruthy ? 'branch_true' : 'branch_false', isTruthy ? trueStr : falseStr, {
    position: getNodePosition(branchNode, context.sourceFile),
  });

  context.level++;
  const result = isTruthy
    ? evaluateTypeNode(condType.trueType, context)
    : evaluateTypeNode(condType.falseType, context);
  context.level--;

  // Log final result assignment (highlight the type alias name)
  if (context.currentNode) {
    addTrace(context, 'result_assignment', result, {
      position: getNodePosition(context.currentNode, context.sourceFile),
    });
  }

  return result;
}

/**
 * Evaluates a template literal type with pattern matching
 * @param templateType Template literal type node
 * @param context Evaluation context
 * @returns The resolved type
 */
export function evaluateTemplateLiteral(templateType: ts.TemplateLiteralTypeNode, context: EvalContext): string {
  const text = templateType.getText(context.sourceFile);

  addTrace(context, 'template_literal', text, {
    position: getNodePosition(templateType, context.sourceFile),
    result: text,
  });

  return text;
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
  const nonDiscriminativeTypes = new Set(['string', 'number', 'boolean', 'any', 'unknown', 'symbol', 'bigint', 'never', '{}', 'object', 'string | number', 'PropertyKey']);

  if (nonDiscriminativeTypes.has(extendsStr)) {
    return null;
  }

  // If extends type starts with a quote (string literal) or has specific structure, it's discriminative
  if (extendsStr.startsWith('"') || extendsStr.startsWith("'") || extendsStr.startsWith('{') || extendsStr.startsWith('[')) {
    return checkStr;
  }

  return null;
}

/**
 * Parse a union type string into its component types
 * Handles "A | B | C" format
 */
function parseUnionType(typeStr: string): string[] {
  const parts = typeStr.split(' | ').map(p => p.trim());
  return parts.filter(p => p.length > 0);
}

/**
 * Simple type compatibility check (simplified - real TS would do full type checking)
 */
function isTypeCompatible(check: string, extendsType: string): boolean {
  // Basic heuristics
  if (extendsType === 'string' && (check.startsWith('"') || check.startsWith("'"))) {
    return true;
  }
  if (check === extendsType) return true;
  if (extendsType === 'any') return true;
  return false;
}

/**
 * Evaluate a mapped type and trace iterations
 */
function evaluateMappedType(mappedType: ts.MappedTypeNode, context: EvalContext): string {
  const mappedStr = mappedType.getText(context.sourceFile);
  addTrace(context, 'mapped_type_start', `mapped type: ${mappedStr.slice(0, 60)}...`, {
    position: getNodePosition(mappedType, context.sourceFile),
  });

  // Get the type parameter (loop variable)
  const typeParam = mappedType.typeParameter;
  const loopVarName = typeParam.name.text;

  // Log constraint evaluation
  const constraintStr = typeParam.constraint?.getText(context.sourceFile) || 'string | number | symbol';
  addTrace(context, 'mapped_type_constraint', `${loopVarName} in ${constraintStr}`, {
    position: getNodePosition(typeParam.constraint || mappedType, context.sourceFile),
  });

  // Evaluate the constraint to get iteration keys
  let keys: string[] = [];
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
    } catch {
      // Fallback to traced result if evaluation fails
      realResult = constraintResult;
    }
    keys = parseUnionType(realResult);

    // Log the resolved constraint
    addTrace(context, 'mapped_type_constraint_result', `${loopVarName} in (${keys.join(' | ')})`, {
      result: realResult,
    });
  }

  // Evaluate mapped type body for each key and build object entries
  const mappedEntries: Record<string, string> = {};
  const mappedResults: string[] = [];
  const oldParams = new Map(context.parameters);

  for (const key of keys) {
    // Bind loop variable to current key
    context.parameters.set(loopVarName, key);

    addTrace(context, 'map_iteration', `${loopVarName} = ${key}`, {
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
  addTrace(context, 'mapped_type_result', `Constructed object: ${objStr.slice(0, 60)}${objStr.length > 60 ? '...' : ''}`, {
    result: objStr,
  });

  // Return union of all mapped values
  const resultStr = mappedResults.join(' | ');
  addTrace(context, 'mapped_type_end', `mapped type union: ${resultStr.slice(0, 60)}${resultStr.length > 60 ? '...' : ''}`, {
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

  addTrace(context, 'indexed_access', `${objTypeStr}[${indexTypeStr}]`, {
    position: getNodePosition(indexedType, context.sourceFile),
  });

  // Evaluate the object type FIRST (this could be a mapped type)
  context.level++;
  const objResult = evaluateTypeNode(indexedType.objectType, context);
  context.level--;

  // Then evaluate the index type to get the key(s)
  context.level++;
  const indexResult = evaluateTypeNode(indexedType.indexType, context);
  context.level--;

  // Use real TS type checker to resolve the final result
  let finalResult = indexResult;
  try {
    // Substitute any remaining parameter references
    const substitutedResult = substituteParameters(indexResult, context.parameters);
    // Evaluate with real TS type checker to get resolved type
    finalResult = evalTypeString(context.sourceFile.text, substitutedResult);
  } catch {
    // Fallback to traced result if evaluation fails
    finalResult = indexResult;
  }

  // Log the result of indexing
  addTrace(context, 'indexed_access_result', `Extracted: ${finalResult.slice(0, 60)}${finalResult.length > 60 ? '...' : ''}`, {
    result: finalResult,
  });

  return finalResult;
}

/**
 * Main type node evaluator
 */
export function evaluateTypeNode(typeNode: ts.TypeNode, context: EvalContext): string {
  // Save previous node and set current node
  const previousNode = context.currentNode;
  context.currentNode = typeNode;

  let result: string;

  if (ts.isTypeReferenceNode(typeNode)) {
    result = evaluateGenericCall(typeNode, context);
  } else if (ts.isConditionalTypeNode(typeNode)) {
    result = evaluateConditional(typeNode, context);
  } else if (ts.isTemplateLiteralTypeNode(typeNode)) {
    result = evaluateTemplateLiteral(typeNode, context);
  } else if (ts.isMappedTypeNode(typeNode)) {
    result = evaluateMappedType(typeNode, context);
  } else if (ts.isIndexedAccessTypeNode(typeNode)) {
    result = evaluateIndexedAccess(typeNode, context);
  } else if (ts.isUnionTypeNode(typeNode)) {
    context.level++;
    const members = typeNode.types.map(t => evaluateTypeNode(t, context));
    context.level--;
    result = members.join(' | ');
  } else if (ts.isIntersectionTypeNode(typeNode)) {
    context.level++;
    const members = typeNode.types.map(t => evaluateTypeNode(t, context));
    context.level--;
    result = members.join(' & ');
  } else {
    // Fallback for simple types
    result = typeNode.getText(context.sourceFile);
  }

  // Restore previous node
  context.currentNode = previousNode;
  return result;
}

/**
 * Main entry point: trace the resolution of a type alias
 * @param ast SourceFile AST
 * @param typeName Name of the type to trace
 * @returns Array of trace entries showing evaluation steps
 */
export function traceTypeResolution(ast: ts.SourceFile, typeName: string): TraceEntry[] {
  // Build map of all type aliases
  const allTypeAliases = new Map<string, ts.TypeAliasDeclaration>();
  const typeAliases = getTypeAliases(ast);
  typeAliases.forEach(alias => {
    allTypeAliases.set(alias.name.text, alias);
  });

  // Find the target type
  const targetAlias = allTypeAliases.get(typeName);
  if (!targetAlias || !targetAlias.type) {
    return [];
  }

  // Create evaluation context
  const context: EvalContext = {
    sourceFile: ast,
    trace: [],
    level: 0,
    parameters: new Map(),
    allTypeAliases,
  };

  // Add initial trace entry for the type alias definition
  addTrace(context, 'type_alias_start', `type ${typeName} = ...`, {
    position: getNodePosition(targetAlias, ast),
  });

  // Start evaluation
  evaluateTypeNode(targetAlias.type, context);

  return context.trace;
}

/**
 * Checks if a type node is a conditional type (T extends U ? X : Y)
 * @param typeNode Type node to check
 * @returns true if conditional type
 */
export function isConditionalType(typeNode: ts.TypeNode): typeNode is ts.ConditionalTypeNode {
  return typeNode.kind === ts.SyntaxKind.ConditionalType;
}

/**
 * Extracts parts of a conditional type
 * @param condType ConditionalTypeNode
 * @param sourceFile SourceFile for getText()
 * @returns Object with check, extends, true, false branches
 */
export function parseConditionalType(
  condType: ts.ConditionalTypeNode,
  sourceFile: ts.SourceFile
): {
  check: string;
  extendsType: string;
  trueType: string;
  falseType: string;
} {
  return {
    check: condType.checkType.getText(sourceFile),
    extendsType: condType.extendsType.getText(sourceFile),
    trueType: condType.trueType.getText(sourceFile),
    falseType: condType.falseType.getText(sourceFile),
  };
}
//
// // Example code
// const ast = generateAST("type _result = getter<\"\">;\n" + CustomTypes);
//
// const resultNode = getNodeByName(ast, '_result');
// if(!resultNode) process.exit(1);
//
// console.log('=== Type Evaluation Trace for _result ===\n');
// const trace = traceTypeResolution(ast, '_result');
// console.dir(trace, { depth: null });
// trace.forEach(entry => {
//   const indent = '  '.repeat(entry.level);
//   console.log(`${indent}Step ${entry.step}: [${entry.type}] ${entry.expression}`);
//
//   if (entry.position) {
//     const { start, end } = entry.position;
//     console.log(`${indent}  Location: Line ${start.line}:${start.character} - ${end.line}:${end.character}`);
//   }
//   if (entry.parameters && Object.keys(entry.parameters).length > 0) {
//     console.log(`${indent}  Parameters: ${JSON.stringify(entry.parameters)}`);
//   }
//   if (entry.args && Object.keys(entry.args).length > 0) {
//     console.log(`${indent}  Args: ${JSON.stringify(entry.args)}`);
//   }
//   if (entry.result) {
//     console.log(`${indent}  Result: ${entry.result}`);
//   }
//   console.log();
// });
