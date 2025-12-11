# IterationSection Component TDD

## Tasks
- [x] Write failing integration tests for IterationSection component
- [ ] Implement IterationSection component to pass tests
- [ ] Verify all tests pass
- [ ] Integration with StepDetailsPanel

## Test Requirements Verified
- Component uses CollapsibleSection with "Iteration" title
- Returns null when currentMember not provided
- Shows "Current Member:" label with value
- Shows "Accumulated:" label with value or "none" if empty
- Shows "Index: N of ?" by counting union members in accumulatedResults
- Filters out "never" from member count
- Can be collapsed/expanded
- Handles various edge cases (empty, undefined, mixed spacing)

## Test File
`/Users/adrianbrowning/Documents/repos/adrianbrowning/ts-ast-parser-eval/tests/ui/components/IterationSection.test.tsx`

## Failure Status
Tests fail with: "Failed to resolve import IterationSection - Does the file exist?"
Component needs to be created at: `src/web/components/IterationSection.tsx`
