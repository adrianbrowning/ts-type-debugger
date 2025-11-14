// Track parameters, args, and locals through type evaluation

export interface Scope {
  parameters: Record<string, string>; // Type parameter bindings
  locals: Record<string, string>; // Local loop variables (for mapped types)
  args: Record<string, string>; // Current function arguments
  level: number;
  parent?: Scope;
}

export class ScopeManager {
  private currentScope: Scope;
  private scopeStack: Scope[] = [];

  constructor() {
    this.currentScope = {
      parameters: {},
      locals: {},
      args: {},
      level: 0,
    };
  }

  /**
   * Push a new scope for a generic type instantiation
   */
  pushGenericScope(typeArgs: Record<string, string>, typeParams: string[]): Scope {
    const newScope: Scope = {
      parameters: { ...this.currentScope.parameters },
      locals: {},
      args: typeArgs,
      level: this.currentScope.level + 1,
      parent: this.currentScope,
    };

    // Bind type parameters from args
    typeParams.forEach((param, i) => {
      const paramKey = Object.keys(typeArgs)[i];
      if (paramKey) {
        newScope.parameters[param] = typeArgs[paramKey];
      }
    });

    this.scopeStack.push(this.currentScope);
    this.currentScope = newScope;
    return newScope;
  }

  /**
   * Push a scope for a mapped type iteration
   */
  pushMapScope(): Scope {
    const newScope: Scope = {
      parameters: { ...this.currentScope.parameters },
      locals: {},
      args: { ...this.currentScope.args },
      level: this.currentScope.level + 1,
      parent: this.currentScope,
    };

    this.scopeStack.push(this.currentScope);
    this.currentScope = newScope;
    return newScope;
  }

  /**
   * Push a scope for an alias expansion
   */
  pushAliasScope(parameters: Record<string, string>): Scope {
    const newScope: Scope = {
      parameters: { ...this.currentScope.parameters, ...parameters },
      locals: { ...this.currentScope.locals },
      args: {},
      level: this.currentScope.level + 1,
      parent: this.currentScope,
    };

    this.scopeStack.push(this.currentScope);
    this.currentScope = newScope;
    return newScope;
  }

  /**
   * Pop back to parent scope
   */
  popScope(): Scope | null {
    if (this.scopeStack.length === 0) return null;
    this.currentScope = this.scopeStack.pop()!;
    return this.currentScope;
  }

  /**
   * Set a local variable (for mapped type iterations)
   */
  setLocal(name: string, value: string): void {
    this.currentScope.locals[name] = value;
  }

  /**
   * Get current scope
   */
  getScope(): Scope {
    return this.currentScope;
  }

  /**
   * Get current level
   */
  getLevel(): number {
    return this.currentScope.level;
  }

  /**
   * Resolve a type reference in current scope
   */
  resolve(name: string): string | undefined {
    // Check locals first
    if (name in this.currentScope.locals) {
      return this.currentScope.locals[name];
    }
    // Then parameters
    if (name in this.currentScope.parameters) {
      return this.currentScope.parameters[name];
    }
    // Then args
    if (name in this.currentScope.args) {
      return this.currentScope.args[name];
    }
    return undefined;
  }

  /**
   * Substitute all references in expression using current scope
   */
  substitute(expr: string): string {
    let result = expr;

    // Substitute locals
    for (const [name, value] of Object.entries(this.currentScope.locals)) {
      result = result.replace(new RegExp(`\\b${name}\\b`, 'g'), value);
    }

    // Substitute parameters
    for (const [name, value] of Object.entries(this.currentScope.parameters)) {
      result = result.replace(new RegExp(`\\b${name}\\b`, 'g'), value);
    }

    return result;
  }

  /**
   * Clone current scope for branching
   */
  clone(): Scope {
    return {
      parameters: { ...this.currentScope.parameters },
      locals: { ...this.currentScope.locals },
      args: { ...this.currentScope.args },
      level: this.currentScope.level,
      parent: this.currentScope.parent,
    };
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.scopeStack = [];
    this.currentScope = {
      parameters: {},
      locals: {},
      args: {},
      level: 0,
    };
  }
}
