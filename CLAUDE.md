- Prefer `const` over `let` unless you need to reassign a variable.
- Prefer function declarations over arrow functions unless you need to reassign a variable.
- ALWAYS prefer types to interfaces unless otherwise told
- Be extremely concise. Sacrifice grammar for the sake of concision.
- list any unresolved questions at the end, if any
- Always use todo lists. Write them to the .claude folder. Make sure they can be use to restart the current set of tasks if the session ever dies, always mark as done when a task is completed
- Node supports running .ts file directly. Never use `tsx` or `node-ts` unless told to. Always make sure the tsconfig includes `allowImportingTsExtensions:true` and `erasableSyntaxOnly:true`
- ALWAYS use pnpm instead of npn. Unless I say otherwise
- Always use todo lists. In memory and on the file system + context to keep track of current tasks. List all taks, break them down into small atoms
- Always update CLAUDE.md with any learnings to help you in the future under `### CLAUDE LEARNINGS ###`
  - This could be critical files of components or how this work


### CLAUDE LEARNINGS ###

## Union Stepping Implementation
- **Key insight**: TypeScript only distributes unions over conditionals in specific cases:
  - NOT at top level (unions are treated as single type)
  - ONLY inside generics with discriminative conditionals
  - ONLY when extends clause is restrictive (like `"a"`, not `string`)

- **Implementation**: `astGenerator.ts:324-446`
  - `evaluateConditional()` detects discriminative conditionals via `getDiscriminativeParameter()`
  - For each union member, sets `context.currentUnionMember` to track which member is evaluated
  - Trace entries include `currentUnionMember` field for visualization
  - New trace types: `conditional_union_distribute`, `conditional_union_member`

- **Visualization**: Right-hand panel should show `currentUnionMember` from trace entries to indicate which union member is being stepped through at each trace point.

- **Test file**: `test-union-stepping.ts` verifies all 4 cases work correctly
