# Step Navigation Feature - Failing Test Results (RED Phase)

## Test Status: FAILING (As Expected)

### 1. CallStack Pure Function Tests
**File**: `/Users/adrianbrowning/Documents/repos/adrianbrowning/ts-ast-parser-eval/src/core/__tests__/callStack.test.ts`

**Status**: FAIL - Module not found

```
Error: Cannot find module '../callStack.ts' imported from
  '/Users/adrianbrowning/Documents/repos/adrianbrowning/ts-ast-parser-eval/src/core/__tests__/callStack.test.ts'
```

**Reason**: `buildCallStack` function doesn't exist yet

**Tests Defined** (14 tests):
- Returns single frame at root level
- Builds stack with nested generic call
- Pops frame when level decreases
- Tracks conditional frames
- Tracks union distribution frames
- Handles template literal frames
- Returns empty array for invalid step index
- Handles empty steps array

---

### 2. usePlayback Hook Tests
**File**: `/Users/adrianbrowning/Documents/repos/adrianbrowning/ts-ast-parser-eval/src/web/hooks/__tests__/usePlayback.test.ts`

**Status**: FAIL - Functions not implemented

```
ReferenceError: document is not defined
```

**Reason**:
1. Tests fail at renderHook stage (missing DOM - test config issue)
2. More importantly: `stepOver()`, `stepOut()`, `stepInto()` functions don't exist in usePlayback hook

**Tests Defined** (10 tests):

**stepOver** (4 tests):
- Moves to next step at same level (skips nested calls)
- Moves to next step when already at deepest level
- Stops at end if no steps at same level
- Pauses playback when stepping

**stepOut** (4 tests):
- Exits current frame to parent level
- Exits nested conditional to parent
- Does nothing at root level
- Pauses playback when stepping out

**stepInto** (2 tests):
- Moves to next step regardless of level
- Enters nested call when available

---

## Missing Implementation

### Required Files:
1. `/Users/adrianbrowning/Documents/repos/adrianbrowning/ts-ast-parser-eval/src/core/callStack.ts`
   - Export `buildCallStack(steps: VideoTraceStep[], currentIndex: number): CallFrame[]`

2. `/Users/adrianbrowning/Documents/repos/adrianbrowning/ts-ast-parser-eval/src/core/types.ts`
   - Add `CallFrame` type

3. `/Users/adrianbrowning/Documents/repos/adrianbrowning/ts-ast-parser-eval/src/web/hooks/usePlayback.ts`
   - Add `stepOver()` function
   - Add `stepOut()` function
   - Add `stepInto()` function
   - Return these functions from hook

---

## Test Verification Commands

```bash
# Run callStack tests
pnpm test src/core/__tests__/callStack.test.ts

# Run usePlayback tests (note: needs DOM fix OR browser config update)
pnpm test src/web/hooks/__tests__/usePlayback.test.ts
```

---

## Next Steps (GREEN Phase)
1. Add `CallFrame` type to `src/core/types.ts`
2. Implement `buildCallStack()` in `src/core/callStack.ts`
3. Implement `stepOver()`, `stepOut()`, `stepInto()` in `usePlayback.ts`
4. Verify tests pass