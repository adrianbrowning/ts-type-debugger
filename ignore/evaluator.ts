import { TypeParser } from './typeParser.ts';
import type { AnyType } from './typeParser.ts';
import { ScopeManager } from './scopeManager.ts';
import type { Scope } from './scopeManager.ts';

export interface TraceStep {
  expression: string;
  type: string;
  parameters?: Record<string, string>;
  args?: Record<string, string>;
  locals?: Record<string, string>;
  level: number;
  position?: { line: [number, number]; column: [number, number] };
  result?: string;
  map_result?: Record<string, string> | string;
  branch_result?: Record<string, unknown>;
  'substitution_result'?: string;
}

export class TypeEvaluator {
  private parser: TypeParser;
  private scopeManager: ScopeManager;
  private traces: TraceStep[] = [];
  private customTypesText: string;
  private visitedNodes: Set<string> = new Set();

  constructor(customTypesText: string) {
    this.customTypesText = customTypesText;
    this.parser = new TypeParser(customTypesText);
    this.scopeManager = new ScopeManager();
  }

  /**
   * Evaluate a type expression and return traces
   */
  evaluate(expression: string): TraceStep[] {
    this.traces = [];
    this.scopeManager.reset();
    this.visitedNodes.clear();

    this.evaluateExpression(expression);

    return this.traces;
  }

  private addTrace(step: Omit<TraceStep, 'level'>): void {
    const scope = this.scopeManager.getScope();
    const trace: TraceStep = {
      ...step,
      level: scope.level,
    };

    if (Object.keys(scope.parameters).length > 0) {
      trace.parameters = scope.parameters;
    }
    if (Object.keys(scope.args).length > 0) {
      trace.args = scope.args;
    }
    if (Object.keys(scope.locals).length > 0) {
      trace.locals = scope.locals;
    }

    this.traces.push(trace);
  }

  private evaluateExpression(expr: string): void {
    // Parse generic call like `getter<"">`
    const genericMatch = expr.match(/^(\w+)<(.+)>$/);
    if (genericMatch) {
      const typeName = genericMatch[1];
      const argStr = genericMatch[2];

      // Record trace for generic call
      this.addTrace({
        expression: expr,
        type: 'generic_call',
        args: { path: `"${argStr.replace(/^"|"$/g, '')}"` },
      });

      // Get type definition
      const typeNode = this.parser.getType(typeName);
      if (typeNode) {
        // Push new scope for generic instantiation
        this.scopeManager.pushGenericScope(
          { path: `"${argStr.replace(/^"|"$/g, '')}"` },
          ['path']
        );

        // Evaluate the type body
        this.evaluateTypeNode(typeNode);

        // Pop scope
        this.scopeManager.popScope();
      }
      return;
    }

    // Single identifier - type reference
    const typeNode = this.parser.getType(expr);
    if (typeNode) {
      this.evaluateTypeNode(typeNode);
      return;
    }

    // Otherwise it's a simple value
    this.addTrace({
      expression: expr,
      type: 'literal',
      result: expr,
    });
  }

  private evaluateTypeNode(node: AnyType, depth = 0): void {
    if (!node || depth > 30) return;

    const scope = this.scopeManager.getScope();

    switch (node.kind) {
      case 'generic': {
        const generic = node as any;
        const typeName = generic.name;

        // Evaluate type arguments first
        const args: Record<string, string> = {};
        generic.typeArgs.forEach((arg: AnyType, i: number) => {
          // Substitute parameters in arg text
          let argText = arg.text;
          const resolved = this.scopeManager.resolve(argText.replace(/['"]/g, ''));
          if (resolved) {
            args[`arg${i}`] = resolved;
          } else {
            args[`arg${i}`] = argText;
          }
        });

        this.addTrace({
          expression: node.text,
          type: 'generic_call',
          args,
        });

        // Get the type definition
        const typeDef = this.parser.getType(typeName);
        if (typeDef) {
          // Determine type parameters based on generic name
          const typeParams = this.getTypeParams(typeName);

          // Push generic scope with the resolved args
          this.scopeManager.pushGenericScope(args, typeParams);

          // Add trace for the alias expansion itself
          this.addTrace({
            expression: (typeDef as AnyType).text,
            type: 'alias',
          });

          // Evaluate type definition body - CONTINUE RECURSING DEEPLY
          this.evaluateTypeNode(typeDef, depth + 1);

          // Pop scope
          this.scopeManager.popScope();
        }
        break;
      }

      case 'conditional': {
        const cond = node as any;

        this.addTrace({
          expression: node.text,
          type: 'condition',
        });

        // Push level for conditional branches
        this.scopeManager.pushAliasScope(scope.parameters);

        // Trace the check part
        this.addTrace({
          expression: (cond.check as AnyType).text,
          type: 'condition_check',
        });
        this.evaluateTypeNode(cond.check, depth + 1);

        // Trace the extends part
        this.addTrace({
          expression: (cond.extends as AnyType).text,
          type: 'condition_extends',
        });
        this.evaluateTypeNode(cond.extends, depth + 1);

        // Try to evaluate both branches - in reality, one will be selected based on extends check
        // But for tracing purposes, we evaluate both to show the full tree
        this.addTrace({
          expression: (cond.trueType as AnyType).text,
          type: 'condition_true_branch',
        });
        this.evaluateTypeNode(cond.trueType, depth + 1);

        this.addTrace({
          expression: (cond.falseType as AnyType).text,
          type: 'condition_false_branch',
        });
        this.evaluateTypeNode(cond.falseType, depth + 1);

        // Pop conditional scope
        this.scopeManager.popScope();
        break;
      }

      case 'string_literal': {
        const literal = node as any;
        this.addTrace({
          expression: node.text,
          type: 'literal',
          result: node.text,
        });
        break;
      }

      case 'type_ref': {
        const ref = node as any;
        const resolved = this.scopeManager.resolve(ref.name);
        if (resolved) {
          this.addTrace({
            expression: node.text,
            type: 'substitution',
            result: resolved,
          });
        } else {
          // Try to resolve as a type name
          const typeDef = this.parser.getType(ref.name);
          if (typeDef) {
            this.addTrace({
              expression: node.text,
              type: 'alias',
            });
            this.scopeManager.pushAliasScope({});
            this.evaluateTypeNode(typeDef, depth + 1);
            this.scopeManager.popScope();
          }
        }
        break;
      }

      case 'mapped': {
        const mapped = node as any;
        this.addTrace({
          expression: node.text,
          type: 'mapped',
          map_result: {},
        });

        // Trace the key iteration and value type
        this.scopeManager.pushMapScope();

        if (mapped.keyConstraint) {
          this.evaluateTypeNode(mapped.keyConstraint, depth + 1);
        }

        if (mapped.valueType) {
          this.evaluateTypeNode(mapped.valueType, depth + 1);
        }

        this.scopeManager.popScope();
        break;
      }

      case 'union': {
        const union = node as any;
        union.members.forEach((member: AnyType) => {
          this.evaluateTypeNode(member, depth + 1);
        });
        break;
      }

      case 'intersection': {
        const inter = node as any;
        inter.members.forEach((member: AnyType) => {
          this.evaluateTypeNode(member, depth + 1);
        });
        break;
      }

      case 'template_literal': {
        this.addTrace({
          expression: node.text,
          type: 'template_literal',
        });
        break;
      }

      case 'index_access': {
        const index = node as any;
        this.addTrace({
          expression: node.text,
          type: 'index_access',
        });

        this.evaluateTypeNode(index.object, depth + 1);
        this.evaluateTypeNode(index.index, depth + 1);
        break;
      }

      case 'type_operator': {
        const op = node as any;
        this.addTrace({
          expression: node.text,
          type: 'type_operator',
        });

        this.evaluateTypeNode(op.operand, depth + 1);
        break;
      }

      case 'object': {
        const obj = node as any;
        this.addTrace({
          expression: node.text,
          type: 'object',
        });

        for (const [key, prop] of Object.entries(obj.properties)) {
          this.evaluateTypeNode(prop as AnyType, depth + 1);
        }
        break;
      }

      case 'array': {
        const arr = node as any;
        this.addTrace({
          expression: node.text,
          type: 'array',
        });

        this.evaluateTypeNode(arr.elementType, depth + 1);
        break;
      }

      case 'infer': {
        this.addTrace({
          expression: node.text,
          type: 'infer',
        });
        break;
      }

      default:
        this.addTrace({
          expression: node.text,
          type: node.kind,
        });
    }
  }

  private getTypeParams(typeName: string): string[] {
    // Map type names to their parameters
    const params: Record<string, string[]> = {
      getter: ['path'],
      validateLeafPath: ['o', 'path', 'prefix'],
      getKey: ['o', 'k'],
      isLeaf: ['T'],
      getLeafPaths: ['o', 'prefix'],
      getSuggestions: ['o', 'currentPath', 'prefix'],
      keyOf: ['o'],
    };

    return params[typeName] || [];
  }

  getTraces(): TraceStep[] {
    return this.traces;
  }
}
