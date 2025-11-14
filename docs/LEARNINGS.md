Key Learnings from This Implementation

1. TypeScript Compiler API Limitations

- The TS compiler API doesn't expose internal type evaluation steps
- We can't hook into the checker's conditional resolution, template literal substitution, or mapped type iteration
- The getTypeAtLocation() only gives final results, not intermediate steps
- Lesson: We need to build our own type evaluator, not rely on TS compiler internals

2. Type Definition Parsing Challenges

- Type definitions in template strings don't always have semicolons
- Need to look for next type keyword or function keyword as delimiters
- Must track bracket/brace/paren depth to find true end of type body
- Must handle strings and template literals to avoid false positives
- Lesson: Robust parsing requires state machine tracking multiple contexts (strings, templates, nesting depth)

3. Scope and Parameter Tracking

- Need three distinct contexts: parameters, args, locals
- parameters: Type parameter bindings inherited through scope chain
- args: Arguments passed to current generic call
- locals: Loop variables in mapped types (e.g., k in [k in Union])
- Scopes must be pushed/popped as we enter/exit generics, aliases, conditionals, mapped types
- Lesson: Explicit scope management is critical for parameter substitution

4. Recursion Strategy

- Must continue evaluating after each generic call - don't stop at the call
- Each generic call should expand to its alias body and recurse deeper
- Conditionals should trace all parts: check, extends, true branch, false branch
- Mapped types need to iterate over union members and track each iteration separately
- Lesson: Full tree traversal requires continuing after recording each step

5. Trace Step Types Needed (from test1.md analysis)

- generic_call: Type instantiation with args
- alias: Type alias expansion
- condition: Conditional type evaluation
- substitution: Parameter replacement
- mapped: Mapped type iteration
- mapped_key: Key source for iteration
- mapped_loop: Union iteration
- mapped_key_union_loop_N: Individual union member iteration
- template_literal: Template literal matching
- literal: Literal type values
- literal_eval: Final literal computation
- substitution_conditional: Conditional inside template
- branch_true/branch_false: Branch selection
- branch_result: Selected branch result
- indexed_map: Index access on mapped type [keyof T]
- result: Intermediate/final value at each step

6. Level Tracking

- Level increments when entering: generic call, alias expansion, conditional, mapped type
- Level is preserved for sibling operations (e.g., both branches of conditional at same level)
- Level is key for showing nesting hierarchy
- Lesson: Level = depth in evaluation tree

7. Evaluation Order (from test1.md)

Must show incremental evaluation:
- Substitution should be one-by-one: `${a}` → `resolved${b}` → `resolvedresolved`
- Mapped types should show each union member iteration separately
- Template literals should show pattern matching attempts
- Conditionals should show the condition check before branch selection
- Lesson: Granular steps matter for understanding type evaluation

8. What Didn't Work

- Using TS compiler's type checker for evaluation (too opaque)
- Regex-based type extraction (too fragile)
- Simple visited node tracking (prevented valid recursion)
- Stopping at generic calls instead of expanding them
- Not tracking which conditional branch actually matches

9. What Did Work

- Manual parsing with tokenizer + recursive descent
- Explicit scope stack management
- Treating each type construct as evaluatable node
- Continuing to recurse after recording trace steps
- Looking for type/function keywords as delimiters instead of just semicolons

10. What's Still Needed

- Conditional branch resolution: Determine which branch actually matches
- Template literal pattern matching: Match "" extends \${infer head}.${infer tail}` and extract inferred types
- Mapped type iteration: Actually iterate union types and track k="User", k="Post" separately
- Template literal substitution: Show incremental `${prefix}${k}` → `${""}${k}` → `${""}${"User"}` → "User"
- Index access resolution: Resolve {...}[keyof<o>] to extract union of values
- Type operator evaluation: Evaluate keyof, typeof, etc. to actual types
- Result propagation: Track result values up the tree
- map_result accumulation: Build up {"User": "User"} then {"User": "User", "Post": "Post"}
- Final result computation: Calculate actual final type

11. Architecture for Fresh Start

Should have:
1. TypeParser: Parse type definitions to IR (we have this working)
2. TypeEvaluator: Core engine that:
   - Maintains scope stack
   - Records trace for each micro-step
   - Evaluates conditionals (checks extends, selects branch)
   - Iterates mapped types over unions
   - Substitutes template literals incrementally
   - Resolves type operators
3. Scope Manager: Track parameters/args/locals (we have this)
4. Type Resolver: Given scope, resolve type references to actual values
5. Trace Recorder: Format and emit trace steps with full context

Key insight: We need to implement type evaluation semantics ourselves, not just traverse AST nodes. We must interpret what each construct means and compute actual type results.
