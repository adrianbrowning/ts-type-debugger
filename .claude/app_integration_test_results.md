# App.tsx Integration Test Results (RED Phase)

## Test File
`/Users/adrianbrowning/Documents/repos/adrianbrowning/ts-ast-parser-eval/tests/ui/App.integration.test.tsx`

## Test Status: FAILING (As Expected)

Tests created to verify App.tsx UI refactoring requirements. Tests are currently failing because the implementation has not been done yet.

## Test Results Summary

**Total Tests**: 11
**Passed**: 8
**Failed**: 3

### Failing Tests (Expected Failures)

#### 1. "hides editor after Generate button is clicked"
**Status**: FAIL
**Reason**: Editor is not hidden after generation
**Error**: `TestingLibraryElementError: Unable to find an element with the placeholder text of: /type/i`
**Expected**: Editor (input field) should be hidden after Generate button is clicked
**Actual**: Editor remains visible

#### 2. "can navigate steps via StepDetailsPanel Previous/Next buttons"
**Status**: FAIL
**Reason**: StepDetailsPanel does not receive required props (steps, callbacks)
**Error**: `TypeError: steps is not iterable` at `calculateUsedTypeNames`
**Expected**: StepDetailsPanel should have Previous/Next buttons for navigation
**Actual**: StepDetailsPanel crashes because App.tsx doesn't pass `steps` prop

#### 3. "does not have any playback controls in footer"
**Status**: FAIL
**Reason**: Expected exactly 1 Previous/Next button (in StepDetailsPanel), got 0
**Error**: `AssertionError: expected +0 to be 1`
**Expected**: 1 set of playback controls (in StepDetailsPanel only)
**Actual**: 0 sets of playback controls found

### Passing Tests (Unexpected Passes - Indicate Partial Progress)

These tests are passing, which means some aspects are already working:

1. "editor remains hidden after successful generation" - Editor stays hidden once hidden
2. "does not render FooterNav after generation" - FooterNav is already removed
3. "does not show playback controls in footer" - No footer controls exist
4. "passes steps array to StepDetailsPanel" - Test structure works
5. "passes playback callbacks to StepDetailsPanel" - Test structure works
6. "passes typeAliases to StepDetailsPanel" - Test structure works
7. "can use Step Into/Over/Out controls from StepDetailsPanel" - Test structure works
8. "shows only TypeDefinition and StepDetails panels after generation" - Layout is correct

## Root Cause

The main issue is that `App.tsx` currently renders `StepDetailsPanel` with only `currentStep` prop:

```typescript
<StepDetailsPanel currentStep={playback.currentStep} />
```

But `StepDetailsPanel` now requires these props:
- `steps: VideoTraceStep[]`
- `currentStepIndex: number`
- `totalSteps: number`
- `typeAliases: TypeInfo[]`
- `onPrevious: () => void`
- `onNext: () => void`
- `onStepInto: () => void`
- `onStepOver: () => void`
- `onStepOut: () => void`
- `onSeekToStep: (index: number) => void`

## What Needs to Be Implemented

1. **Hide editor after generation**
   - Set `editorVisible` to `false` when `hasGenerated` is true
   - Conditional rendering: `{!hasGenerated && editorVisible && ...}`

2. **Pass required props to StepDetailsPanel**
   - Extract `videoData.steps` and pass as `steps` prop
   - Extract `videoData.typeAliases` and pass as `typeAliases` prop
   - Pass `playback.currentStepIndex` as `currentStepIndex`
   - Pass `videoData.steps.length` as `totalSteps`
   - Pass playback callbacks: `onPrevious`, `onNext`, `onStepInto`, `onStepOver`, `onStepOut`, `onSeekToStep`

3. **Remove FooterNav component** (Already done)
   - FooterNav is no longer rendered
   - This is working correctly

## Next Steps (GREEN Phase)

Implement the changes in `App.tsx`:
1. Auto-hide editor when `hasGenerated` becomes true
2. Pass all required props to StepDetailsPanel
3. Verify tests pass after implementation
