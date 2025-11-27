# Union Stepping Improvements

## Summary
Implemented proper union distribution in discriminative conditionals for better type stepping visualization.

## Changes Made

### 1. Extended TraceEntry Interface (astGenerator.ts:9-22)
- Added `currentUnionMember?: string` field to track which union member is being evaluated
- This allows the right-hand side panel to show which member is currently being stepped through

### 2. Extended EvalContext Interface (astGenerator.ts:152-160)
- Added `currentUnionMember?: string` to track context during union distribution

### 3. Updated addTrace Helper (astGenerator.ts:181-205)
- Now includes `currentUnionMember` in all trace entries
- Allows visualization layer to know which union member is being evaluated at any step

### 4. Added Discriminative Conditional Detection (astGenerator.ts:471-502)
- New function `getDiscriminativeParameter()` determines if a conditional is discriminative
- **Non-discriminative**: `T extends string` (broad type that accepts all members)
- **Discriminative**: `T extends "a"` (specific type that only accepts certain members)
- Only discriminative conditionals trigger union distribution

### 5. Rewrote evaluateConditional() (astGenerator.ts:324-446)
- Detects discriminative conditionals with union parameters
- For each union member:
  - Sets `context.currentUnionMember` to current member
  - Temporarily binds the parameter to that member
  - Adds `conditional_union_member` trace entry showing which member is being evaluated
  - Evaluates the conditional for that member
  - Logs which branch is taken for that member
  - Collects the result
- Unions all member results together
- Falls back to standard (non-distributing) evaluation for non-discriminative conditionals

## New Trace Types
- `conditional_union_distribute`: Marks where a union starts being distributed
- `conditional_union_member`: Marks evaluation of a specific union member with the member shown in `currentUnionMember`

## Example Behavior

### Case 1: Top-Level Union, Non-Discriminative
```
type __EvalTarget__1 = "a" | "b" extends string ? 1 : 2;
// Result: 1
```
Trace shows: condition evaluated once with full union, no distribution

### Case 2: Top-Level Union, Discriminative
```
type __EvalTarget__2 = "a" | "b" extends "a" ? 1 : 2;
// Result: 2
```
Trace shows: condition evaluated once with full union (top-level never distributes)

### Case 3: Generic with Union, Non-Discriminative
```
type Loop1<str extends string> = str extends string ? 1 : 2;
type __EvalTarget__3 = Loop1<"a" | "b">;
// Result: 1
```
Trace shows: union passed to parameter, but since condition is non-discriminative (extends string), no distribution occurs. Both members would take same branch anyway.

### Case 4: Generic with Union, Discriminative
```
type Loop2<str extends string> = str extends "a" ? 1 : 2;
type __EvalTarget__4 = Loop2<"a" | "b">;
// Result: 1 | 2
```
Trace shows:
1. `conditional_union_distribute` - Union str = "a" | "b"
2. `conditional_union_member` - Evaluating for str = "a" (currentUnionMember: "a")
3. `branch_true` - 1 (currentUnionMember: "a")
4. `conditional_union_member` - Evaluating for str = "b" (currentUnionMember: "b")
5. `branch_false` - 2 (currentUnionMember: "b")

## Visualization Integration
The `currentUnionMember` field in each trace entry should be used by the right-hand side panel to highlight/indicate which union member is being evaluated at each step. This makes it clear to users which path the type system is taking through union members.

## Key Insight
TypeScript distributes unions over conditionals only in specific cases:
- NOT at top level (unions at top level are treated as a single type)
- ONLY inside generics with discriminative conditionals
- ONLY when the conditional check type is a parameter that appears in the extends clause
- ONLY when the extends clause is restrictive (not a broad type like `string`)