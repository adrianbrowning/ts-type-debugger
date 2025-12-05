- ALWAYS prefer types to interfaces unless otherwise told
- Be extremely concise. Sacrifice grammar for the sake of concision.
- list any unresolved questions at the end, if any
- Always use todo lists. Write them to the .claude folder. Make sure they can be use to restart the current set of tasks if the session ever dies, always mark as done when a task is completed
- Node supports running .ts file directly. Never use `tsx` or `node-ts` unless told to. Always make sure the tsconfig includes `allowImportingTsExtensions:true` and `erasableSyntaxOnly:true`
- ALWAYS use pnpm instead of npn. Unless I say otherwise
- Always use todo lists. In memory and on the file system + context to keep track of current tasks. List all taks, break them down into small atoms

## Union Stepping Implementation
- **Key insight**: TypeScript only distributes unions over conditionals in specific cases:
  - NOT at top level (unions are treated as single type)
  - ONLY inside generics with discriminative conditionals
  - ONLY when extends clause is restrictive (like `"a"`, not `string`)

- **Implementation**: `astGenerator.ts:324-428`
  - `evaluateConditional()` detects discriminative conditionals via `getDiscriminativeParameter()`
  - For each union member, sets `context.currentUnionMember` to track which member is evaluated
  - Tracks `context.currentUnionResults` as members are accumulated
  - After each member, calls `evalTypeString()` to reduce union (removes `never`)
  - Adds `[union_reduce]` trace entry if reduction changed anything
  - New trace types: `conditional_union_distribute`, `conditional_union_member`, `union_reduce`

- **Live Visualization**: Trace includes:
  - `currentUnionMember`: Which member is being evaluated
  - `currentUnionResults`: Accumulated union so far
  - Right panel should show both for live feedback during stepping

- **Union Reduction**: Automatic simplification
  - After each member evaluation, union is reduced
  - Removes `never` types and redundant members
  - Uses TypeScript's own type checker for accuracy
  - Enhanced `evalTypeString()` to handle numeric literals (1, 2, etc)

- **Example**: `Loop2<"a" | "b" | "x">` where conditionals return `1, 2, never`:
  - Shows `"a" => 1`, `"b" => 2`, `"x" => never`
  - Auto-reduces: `1 | 2 | never => 1 | 2`
  - Final result: `1 | 2`
