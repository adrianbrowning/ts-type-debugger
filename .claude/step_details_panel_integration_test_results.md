# StepDetailsPanel Integration Test Results (RED Phase)

## Test File
`/Users/adrianbrowning/Documents/repos/adrianbrowning/ts-ast-parser-eval/tests/ui/components/StepDetailsPanel.integration.test.tsx`

## Status: FAILING (As Expected)

**18 tests failed** out of 24 total tests (6 passed)

## Summary

The integration test successfully verifies that the refactored StepDetailsPanel component does NOT yet have the new props and structure. The test is failing because:

1. **Current implementation** only accepts `{ currentStep: VideoTraceStep | null }` prop
2. **Expected implementation** should accept new props:
   - `currentStep`, `steps`, `currentStepIndex`, `totalSteps`, `typeAliases`
   - Callbacks: `onPrevious`, `onNext`, `onStepInto`, `onStepOver`, `onStepOut`, `onSeekToStep`

3. **Current structure** renders old monolithic layout with inline sections
4. **Expected structure** should render Chrome DevTools-style components:
   - DebugToolbar (with step controls)
   - CallStackSection
   - IterationSection (conditional)
   - ScopeSection
   - GlobalsSection
   - Expression (in CollapsibleSection)
   - Result bar (at bottom when result exists)

## Failing Tests Breakdown

### Component Structure (5 tests failed)
- `renders DebugToolbar with step controls` - DebugToolbar not found
- `renders CallStackSection with steps data` - CallStackSection not found
- `renders ScopeSection with parameters from currentStep` - ScopeSection not found
- `renders GlobalsSection with typeAliases` - GlobalsSection not found
- `renders IterationSection when currentUnionMember exists` - IterationSection not found

### Result Bar (1 test failed)
- `shows Result bar at bottom when result exists` - New result bar structure not implemented

### Callback Integration (6 tests failed)
- `calls onPrevious when Previous button clicked` - No Previous button
- `calls onNext when Next button clicked` - No Next button
- `calls onStepInto when Step Into button clicked` - No Step Into button
- `calls onStepOver when Step Over button clicked` - No Step Over button
- `calls onStepOut when Step Out button clicked` - No Step Out button
- `calls onSeekToStep when call stack frame clicked` - No call stack frames

### Data Flow (5 tests failed)
- `passes currentStepIndex and totalSteps to DebugToolbar` - DebugToolbar not present
- `passes all steps to CallStackSection` - CallStackSection not present
- `passes typeAliases and used types to GlobalsSection` - GlobalsSection not present
- `extracts and passes parameters from currentStep to ScopeSection` - ScopeSection not present
- `handles union stepping with full data flow` - IterationSection not present
- `handles nested call stack with parameters at each level` - Multiple components not present

## Passing Tests (6 tests)

These tests pass because they verify behavior that works with the current simple implementation:

1. `shows "Step Details" header when no step selected` - Header exists in current impl
2. `shows "No step selected" message when currentStep is null` - Message exists in current impl
3. `does not render any child sections when no step selected` - Current impl doesn't have child sections anyway
4. `renders Expression in CollapsibleSection` - Expression is displayed (though not in CollapsibleSection)
5. `does not render IterationSection when currentUnionMember is absent` - IterationSection doesn't exist
6. `does not show Result bar when result is absent` - Current impl doesn't have result bar structure

## Expected Error Output

```
TestingLibraryElementError: Unable to find an accessible element with the role "button" and name `/previous/i`
```

The current implementation shows only:
- A "Step Details" header
- A "Step 1" indicator with type badge
- An "Expression" section with the expression text
- No toolbar, no buttons, no child components

## Next Steps

After this RED phase, implement the refactored component to:
1. Accept all new props
2. Render DebugToolbar with all step controls
3. Render CallStackSection, ScopeSection, GlobalsSection
4. Conditionally render IterationSection
5. Wrap Expression in CollapsibleSection
6. Show Result bar at bottom when result exists
7. Wire up all callbacks to child components

Run: `pnpm test:ui -- StepDetailsPanel.integration`
