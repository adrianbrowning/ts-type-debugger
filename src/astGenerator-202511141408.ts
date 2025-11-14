import ts, {TypeReference} from 'typescript';
import {CustomTypes} from "./base";
import * as process from "node:process";
import {checkTypeCondition} from "./eval_local";

/**
 * Represents a single step in type evaluation trace
 */
export interface TraceEntry {
  step: number;
  type: 'generic_call' | 'generic_def' | 'condition' | 'conditional_evaluate_left' | 'conditional_evaluate_right' | 'conditional_evaluation' | 'branch_true' | 'branch_false' | 'template_literal' | 'alias_reference' | 'substitution';
  expression: string;
  parameters?: Record<string, string>;
  args?: Record<string, string>;
  result?: string;
  level: number;
  position?: {
    start: { line: number; character: number };
    end: { line: number; character: number };
  };
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
  const entry: TraceEntry = {
    step: context.trace.length + 1,
    type,
    expression,
    level: context.level,
    // Always include current parameters in scope
    parameters: context.parameters.size > 0 ? Object.fromEntries(context.parameters) : undefined,
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
  addTrace(context, 'generic_def', `type ${typeName}<${paramList}> = ...`, {
    position: getNodePosition(aliasDecl, context.sourceFile),
  });

  // Evaluate the type expression
  context.level++;
  const result = evaluateTypeNode(aliasDecl.type, context);
  context.level--;

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
 * @param condType Conditional type node
 * @param context Evaluation context
 * @returns The resolved type from the taken branch
 */
export function evaluateConditional(condType: ts.ConditionalTypeNode, context: EvalContext): string {
  const checkStr = condType.checkType.getText(context.sourceFile);
  const extendsStr = condType.extendsType.getText(context.sourceFile);
  const trueStr = condType.trueType.getText(context.sourceFile);
  const falseStr = condType.falseType.getText(context.sourceFile);

  // Log condition entry
  addTrace(context, 'condition', `${checkStr} extends ${extendsStr} ? ${trueStr} : ${falseStr}`, {
    position: getNodePosition(condType, context.sourceFile),
  });

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

  // For now, we'll evaluate both branches and make a simple decision
  // In a full implementation, this would need proper type checking
  // const isTruthy = isTypeCompatible(checkStr, extendsStr);

  const isTruthy = checkTypeCondition(substituteParameters(checkStr, context.parameters ), substituteParameters(extendsStr, context.parameters ), context.sourceFile.text)

  // Log evaluation result
  addTrace(context, 'conditional_evaluation', `${isTruthy}`, {
    result: isTruthy ? 'true' : 'false',
  });

  // Log branch taken
  addTrace(context, isTruthy ? 'branch_true' : 'branch_false', isTruthy ? trueStr : falseStr, {
    position: getNodePosition(isTruthy ? condType.trueType : condType.falseType, context.sourceFile),
  });

  context.level++;
  const result = isTruthy
    ? evaluateTypeNode(condType.trueType, context)
    : evaluateTypeNode(condType.falseType, context);
  context.level--;

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

  const entry: TraceEntry = {
    step: context.trace.length + 1,
    type: 'template_literal',
    expression: text,
    level: context.level,
  };

  context.trace.push(entry);
  entry.result = text;
  return text;
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
 * Main type node evaluator
 */
export function evaluateTypeNode(typeNode: ts.TypeNode, context: EvalContext): string {
  if (ts.isTypeReferenceNode(typeNode)) {
    return evaluateGenericCall(typeNode, context);
  } else if (ts.isConditionalTypeNode(typeNode)) {
    return evaluateConditional(typeNode, context);
  } else if (ts.isTemplateLiteralTypeNode(typeNode)) {
    return evaluateTemplateLiteral(typeNode, context);
  } else if (ts.isUnionTypeNode(typeNode)) {
    context.level++;
    const members = typeNode.types.map(t => evaluateTypeNode(t, context));
    context.level--;
    return members.join(' | ');
  } else if (ts.isIntersectionTypeNode(typeNode)) {
    context.level++;
    const members = typeNode.types.map(t => evaluateTypeNode(t, context));
    context.level--;
    return members.join(' & ');
  }

  // Fallback for simple types
  return typeNode.getText(context.sourceFile);
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

// Example code
const ast = generateAST("type _result = getter<\"\">;\n" + CustomTypes);

const resultNode = getNodeByName(ast, '_result');
if(!resultNode) process.exit(1);

console.log('=== Type Evaluation Trace for _result ===\n');
const trace = traceTypeResolution(ast, '_result');

trace.forEach(entry => {
  const indent = '  '.repeat(entry.level);
  console.log(`${indent}Step ${entry.step}: [${entry.type}] ${entry.expression}`);

  if (entry.position) {
    const { start, end } = entry.position;
    console.log(`${indent}  Location: Line ${start.line}:${start.character} - ${end.line}:${end.character}`);
  }
  if (entry.parameters && Object.keys(entry.parameters).length > 0) {
    console.log(`${indent}  Parameters: ${JSON.stringify(entry.parameters)}`);
  }
  if (entry.args && Object.keys(entry.args).length > 0) {
    console.log(`${indent}  Args: ${JSON.stringify(entry.args)}`);
  }
  if (entry.result) {
    console.log(`${indent}  Result: ${entry.result}`);
  }
  console.log();
});
