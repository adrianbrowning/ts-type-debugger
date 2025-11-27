# Live View + Union Reduction Features

## Summary
Implemented live result visualization with automatic union reduction for cleaner type stepping experience.

## Features

### 1. Live Result View (`currentUnionResults`)
Tracks accumulated results as each union member is evaluated:

```
Step 1: Evaluating member "a" => 1 (accumulated: "1")
Step 2: Evaluating member "b" => 2 (accumulated: "1 | 2")
Step 3: Evaluating member "x" => never (accumulated: "1 | 2 | never")
Step 4: [REDUCE] 1 | 2 | never => 1 | 2 (accumulated: "1 | 2")
```

**Fields added to TraceEntry**:
- `currentUnionMember`: Which member is being evaluated (e.g., `"a"`)
- `currentUnionResults`: Union of all results collected so far (e.g., `"1 | 2"`)

**UI Display** (right panel should show):
```
Current Member: "x"
Current Result: never
Accumulated So Far: 1 | 2 | never
```

### 2. Union Reduction (`union_reduce`)
After each union member is evaluated, automatically simplifies the union:

**What gets removed:**
- `never` types (they represent unreachable code)
- Redundant members

**What gets simplified:**
- `1 | 1` → `1`
- Duplicate union members
- Complex type simplifications (handled by TS type checker)

**Implementation**:
- Calls `evalTypeString()` after accumulating each member's result
- Adds `[union_reduce]` trace entry if result changed
- Shows before and after in trace: `"1 | 2 | never" => "1 | 2"`

**Trace Type**:
- Type: `union_reduce`
- Color: `#FBBF24` (amber highlight)
- Fields:
  - `expression`: Shows the reduction (e.g., `"1 | 2 | never => 1 | 2"`)
  - `result`: The reduced union
  - `currentUnionMember`: Which member caused the reduction

## Example: Three-Member Union with `never`

```typescript
type Loop2<str extends string> = str extends "a" ? 1 : str extends "b" ? 2 : never;
type __EvalTarget__ = Loop2<"a" | "b" | "x">;
```

**Trace Output**:
```
Step 1: [conditional_union_distribute] Union str = "a" | "b" | "x"
Step 2: [conditional_union_member] Evaluating for str = "a" (member: "a")
Step 3: [branch_true] 1 (member: "a")
Step 4: [conditional_union_member] Evaluating for str = "b" (member: "b", accumulated: "1")
Step 5: [branch_false] str extends "b" ? 2 : never (member: "b")
Step 6: [branch_true] 2 (member: "b")
Step 7: [conditional_union_member] Evaluating for str = "x" (member: "x", accumulated: "1 | 2")
Step 8: [branch_false] str extends "b" ? 2 : never (member: "x")
Step 9: [branch_false] never (member: "x", accumulated: "1 | 2")
Step 10: [union_reduce] 1 | 2 | never => 1 | 2 (member: "x", accumulated: "1 | 2")
Step 11: [generic_result] Loop2 => 1 | 2
```

**Final Result**: `1 | 2` (never is automatically removed)

## Implementation Details

### Modified Files:

**1. astGenerator.ts**
- Extended `TraceEntry` with `currentUnionResults?: string`
- Extended `EvalContext` with `currentUnionResults?: string`
- Updated `addTrace()` to include `currentUnionResults`
- Modified `evaluateConditional()`:
  - Tracks accumulated results in `results` array
  - After each member, sets `context.currentUnionResults = results.join(' | ')`
  - Calls `evalTypeString(context.sourceFile.text, accumulatedUnion)` to reduce
  - Adds `union_reduce` trace entry if reduction changed anything
  - Returns the final reduced union

**2. eval_local.ts**
- Enhanced `evalTypeString()` to handle numeric literal unions
- Added detection for number literal types (e.g., `1`, `2`)
- Now properly expands unions of numeric literals into strings like `"1 | 2"`

**3. types.ts**
- Added `union_reduce` to trace type enum
- Added color mapping: `#FBBF24` (amber)

## UI Integration Notes

**For the right-hand side panel:**

Show three pieces of information as the trace progresses:

1. **Current Member** (if in union distribution):
   ```
   Current Member: "a"
   ```
   (Update this from `trace.currentUnionMember`)

2. **Current Results**:
   ```
   Result For This Member: 1
   ```
   (Get from the last `branch_true` or `branch_false` before `union_reduce`)

3. **Accumulated So Far**:
   ```
   Accumulated Union: 1 | 2
   ```
   (Update this from `trace.currentUnionResults`)

**Highlighting `union_reduce` steps:**
- Show reduction visually: `1 | 2 | never` (strikethrough `never`) → `1 | 2`
- Use the amber color to highlight this step
- Maybe animate the removal of `never` to emphasize the simplification

## Examples

### Example 1: Simple Discriminative Union (No `never`)
```typescript
type Cond<T> = T extends "a" ? 1 : 2;
type Result = Cond<"a" | "b">;
// Result: 1 | 2
```
Trace: Shows `"a" => 1`, then `"b" => 2`, no reduction needed

### Example 2: Union with `never` (Reduction)
```typescript
type Cond<T> = T extends "a" ? 1 : never;
type Result = Cond<"a" | "b">;
// Result: 1
```
Trace: Shows `"a" => 1`, then `"b" => never`, then `[union_reduce] 1 | never => 1`

### Example 3: Cascading Conditionals with Mixed Results
```typescript
type Cond<T> = T extends "a" ? 1 : T extends "b" ? 2 : never;
type Result = Cond<"a" | "b" | "c">;
// Result: 1 | 2
```
Trace:
- `"a" => 1` (accumulated: `1`)
- `"b" => 2` (accumulated: `1 | 2`)
- `"c" => never` (accumulated: `1 | 2 | never`)
- **[union_reduce]** `1 | 2 | never => 1 | 2`

## Edge Cases Handled

1. **No union** - Works normally, no reduction needed
2. **Single member union** - Still shows accumulation (trivial case)
3. **All members reduce to never** - Result is `never` (handled correctly by TS)
4. **Reduction fails** - Falls back to unreduced version with error silently caught
5. **Nested conditionals** - Each level has its own union distribution and reduction