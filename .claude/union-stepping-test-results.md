# Union Stepping Test Results

## Test Configuration
All tests use the following type definitions:

```typescript
type __EvalTarget__1 = "a" | "b" extends string ? 1 : 2;
type __EvalTarget__2 = "a" | "b" extends "a" ? 1 : 2;

type Loop1<str extends string> = str extends string ? 1 : 2;
type __EvalTarget__3 = Loop1<"a" | "b">;

type Loop2<str extends string> = str extends "a" ? 1 : 2;
type __EvalTarget__4 = Loop2<"a" | "b">;
```

## Test Results

### Case 1: Top-Level Union with Broad Type ✅
**Expression**: `"a" | "b" extends string ? 1 : 2`
**Expected**: `1`
**Actual**: `1`

**Key Trace Steps**:
- `[condition]` - Full conditional evaluated
- `[conditional_evaluate_left]` - "a" | "b"
- `[conditional_evaluate_right]` - string
- `[conditional_evaluation]` - true
- `[branch_true]` - 1

**Insight**: Union is NOT distributed at top level. Entire union is checked against `string` type.

---

### Case 2: Top-Level Union with Specific Type ✅
**Expression**: `"a" | "b" extends "a" ? 1 : 2`
**Expected**: `2`
**Actual**: `2`

**Key Trace Steps**:
- `[condition]` - Full conditional evaluated
- `[conditional_evaluate_left]` - "a" | "b"
- `[conditional_evaluate_right]` - "a"
- `[conditional_evaluation]` - false
- `[branch_false]` - 2

**Insight**: Union is NOT distributed at top level. The union `"a" | "b"` doesn't extend just `"a"` (it's a union, not a single member).

---

### Case 3: Generic Union with Non-Discriminative Conditional ✅
**Expression**: `Loop1<"a" | "b">` where `Loop1<str extends string> = str extends string ? 1 : 2`
**Expected**: `1`
**Actual**: `1`

**Key Trace Steps**:
- `[generic_call]` - Loop1<"a" | "b">
- `[generic_def]` - type Loop1<str = "a" | "b"> = ...
  - `[condition]` - str extends string ? 1 : 2
  - `[conditional_evaluate_left]` - str
  - `[conditional_evaluate_right]` - string
  - `[conditional_comparison]` - str extends string
  - `[conditional_evaluation]` - true
  - `[branch_true]` - 1
  - `[result_assignment]` - 1
- `[generic_result]` - Loop1 => 1

**Insight**: Even though a union is passed to the generic, it's NOT distributed because:
- The conditional `str extends string` is non-discriminative
- All string union members would take the same branch (true)
- TypeScript optimization: why distribute if both paths are the same?

---

### Case 4: Generic Union with Discriminative Conditional ✅
**Expression**: `Loop2<"a" | "b">` where `Loop2<str extends string> = str extends "a" ? 1 : 2`
**Expected**: `1 | 2`
**Actual**: `1 | 2`

**Key Trace Steps**:
- `[generic_call]` - Loop2<"a" | "b">
- `[generic_def]` - type Loop2<str = "a" | "b"> = ...
  - `[condition]` - str extends "a" ? 1 : 2
  - **`[conditional_union_distribute]`** - Union str = "a" | "b"
  - **`[conditional_union_member]`** - Evaluating for str = "a" **(currentUnionMember: "a")**
  - `[branch_true]` - 1 **(currentUnionMember: "a")**
  - **`[conditional_union_member]`** - Evaluating for str = "b" **(currentUnionMember: "b")**
  - `[branch_false]` - 2 **(currentUnionMember: "b")**
- `[generic_result]` - Loop2 => 1 | 2

**Insight**: Union IS distributed because:
- The conditional `str extends "a"` is discriminative (specific type, not broad)
- Different union members take different branches
- `"a" extends "a"` → `1`
- `"b" extends "a"` → `2`
- Result is `1 | 2`
- **`currentUnionMember` field tracks which member is being evaluated at each step**

---

## Visualization Impact

The `currentUnionMember` field in trace entries enables the right-hand side panel to clearly show:
1. **Which union member is active** at each step
2. **Path divergence** - showing how different members take different branches
3. **Member-specific results** - clarifying which result came from which member

Example visualization for Case 4:
```
Step 1: [generic_call] Loop2<"a" | "b">
Step 2: [condition] str extends "a" ? 1 : 2
Step 3: [conditional_union_distribute] Union str = "a" | "b"
Step 4: [conditional_union_member] Evaluating for str = "a"  ← SHOW: "a" in right panel
Step 5: [branch_true] 1
Step 6: [conditional_union_member] Evaluating for str = "b"  ← SHOW: "b" in right panel
Step 7: [branch_false] 2
```

---

## Summary
✅ All 4 test cases pass with correct behavior
✅ Union distribution only occurs for discriminative conditionals in generics
✅ Top-level conditionals never distribute unions
✅ Non-discriminative conditionals don't distribute (optimization)
✅ `currentUnionMember` field properly tracks member context for visualization