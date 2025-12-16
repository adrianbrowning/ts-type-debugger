import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../utils/renderWithProviders.tsx';
import userEvent from '@testing-library/user-event';
import { StepDetailsPanel } from '../../../src/web/components/StepDetailsPanel';
import { createMockStep, createMockTypeInfo } from '../../fixtures/mockVideoData.ts';
import type { VideoTraceStep, TypeInfo } from '../../../src/core/types.ts';

/**
 * Integration test for refactored StepDetailsPanel
 * Tests the new Chrome DevTools-style component structure
 */
describe('StepDetailsPanel Integration (Refactored)', () => {
  const mockTypeAliases: TypeInfo[] = [
    createMockTypeInfo({
      name: 'Loop2',
      text: 'type Loop2<T> = T extends "a" ? 1 : 2',
    }),
    createMockTypeInfo({
      name: 'Stringify',
      text: 'type Stringify<T> = `${T & string}`',
    }),
  ];

  const defaultProps = {
    steps: [] as VideoTraceStep[],
    currentStep: null,
    currentStepIndex: 0,
    totalSteps: 0,
    typeAliases: mockTypeAliases,
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onStepInto: vi.fn(),
    onStepOver: vi.fn(),
    onStepOut: vi.fn(),
    onSeekToStep: vi.fn(),
  };

  describe('Empty state (no step selected)', () => {
    it('shows "Step Details" header when no step selected', () => {
      render(<StepDetailsPanel {...defaultProps} />);

      expect(screen.getByText('Step Details')).toBeDefined();
    });

    it('shows "No step selected" message when currentStep is null', () => {
      render(<StepDetailsPanel {...defaultProps} />);

      expect(screen.getByText(/No step selected/i)).toBeDefined();
    });

    it('does not render any child sections when no step selected', () => {
      render(<StepDetailsPanel {...defaultProps} />);

      expect(screen.queryByText('Call Stack')).toBeNull();
      expect(screen.queryByText('Iteration')).toBeNull();
      expect(screen.queryByText('Scope')).toBeNull();
      expect(screen.queryByText('Globals')).toBeNull();
    });
  });

  describe('Component structure with step selected', () => {
    it('renders DebugToolbar with step controls', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'generic_call',
            expression: 'Loop2<"a">',
            level: 0,
          },
        }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[0]}
          steps={steps}
          currentStepIndex={0}
          totalSteps={1}
        />
      );

      // Verify DebugToolbar renders with controls
      expect(screen.getByRole('button', { name: /previous/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /next/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /into/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /over/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /out/i })).toBeDefined();
    });

    it('renders CallStackSection with steps data', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'generic_call',
            expression: 'Loop2<"a" | "b">',
            level: 0,
            position: { start: { line: 5, character: 0 }, end: { line: 5, character: 20 } },
          },
        }),
        createMockStep({
          stepIndex: 1,
          original: {
            step: 2,
            type: 'condition',
            expression: 'T extends "a"',
            level: 1,
          },
        }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[1]}
          steps={steps}
          currentStepIndex={1}
          totalSteps={2}
        />
      );

      expect(screen.getByText('Call Stack')).toBeDefined();
      expect(screen.getByText(/Loop2<"a" \| "b">/)).toBeDefined();
      expect(screen.getByText(/T extends "a"/)).toBeDefined();
    });

    it('renders ScopeSection with parameters from currentStep', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'generic_call',
            expression: 'Loop2<"a">',
            level: 0,
            parameters: {
              T: '"a"',
              K: 'string',
            },
          },
        }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[0]}
          steps={steps}
          currentStepIndex={0}
          totalSteps={1}
        />
      );

      expect(screen.getByText('Scope')).toBeDefined();
      expect(screen.getByText(/T = "a"/)).toBeDefined();
      expect(screen.getByText(/K = string/)).toBeDefined();
    });

    it('renders GlobalsSection with typeAliases', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'generic_call',
            expression: 'Loop2<"a">',
            level: 0,
          },
        }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[0]}
          steps={steps}
          currentStepIndex={0}
          totalSteps={1}
        />
      );

      expect(screen.getByText('Globals')).toBeDefined();
      // Should show type aliases that are used
    });

    it('renders Expression in CollapsibleSection', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'generic_call',
            expression: 'Loop2<"a" | "b">',
            level: 0,
          },
        }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[0]}
          steps={steps}
          currentStepIndex={0}
          totalSteps={1}
        />
      );

      // Expression should be in a collapsible section
      expect(screen.getByText(/Loop2<"a" \| "b">/)).toBeDefined();
    });
  });

  describe('Union stepping (IterationSection)', () => {
    it('renders IterationSection when currentUnionMember exists', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'conditional_union_member',
            expression: 'T extends "a" ? 1 : 2',
            level: 0,
            currentUnionMember: '"a"',
            currentUnionResults: '1 | 2',
          },
        }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[0]}
          steps={steps}
          currentStepIndex={0}
          totalSteps={1}
        />
      );

      expect(screen.getByText('Iteration')).toBeDefined();
    });

    it('does not render IterationSection when currentUnionMember is absent', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'generic_call',
            expression: 'Loop2<"a">',
            level: 0,
          },
        }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[0]}
          steps={steps}
          currentStepIndex={0}
          totalSteps={1}
        />
      );

      expect(screen.queryByText('Iteration')).toBeNull();
    });
  });

  describe('Result bar', () => {
    it('shows Result bar at bottom when result exists', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'generic_result',
            expression: 'Loop2<"a">',
            level: 0,
            result: 'MyResult123',
          },
        }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[0]}
          steps={steps}
          currentStepIndex={0}
          totalSteps={1}
        />
      );

      // Result bar shows the result value
      expect(screen.getByText(/MyResult123/)).toBeDefined();
    });

    it('does not show Result bar when result is absent', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'generic_call',
            expression: 'Loop2<"a">',
            level: 0,
          },
        }),
      ];

      const { container } = render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[0]}
          steps={steps}
          currentStepIndex={0}
          totalSteps={1}
        />
      );

      // Result bar should not appear
      const resultElements = Array.from(container.querySelectorAll('*')).filter(
        (el) => el.textContent?.includes('Result') && !el.textContent?.includes('currentUnionResults')
      );
      expect(resultElements.length).toBe(0);
    });
  });

  describe('Callback integration', () => {
    it('calls onPrevious when Previous button clicked', async () => {
      const user = userEvent.setup();
      const onPrevious = vi.fn();

      const steps: VideoTraceStep[] = [
        createMockStep({ stepIndex: 0 }),
        createMockStep({ stepIndex: 1 }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[1]}
          steps={steps}
          currentStepIndex={1}
          totalSteps={2}
          onPrevious={onPrevious}
        />
      );

      const prevButton = screen.getByRole('button', { name: /previous/i });
      await user.click(prevButton);

      expect(onPrevious).toHaveBeenCalledOnce();
    });

    it('calls onNext when Next button clicked', async () => {
      const user = userEvent.setup();
      const onNext = vi.fn();

      const steps: VideoTraceStep[] = [
        createMockStep({ stepIndex: 0 }),
        createMockStep({ stepIndex: 1 }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[0]}
          steps={steps}
          currentStepIndex={0}
          totalSteps={2}
          onNext={onNext}
        />
      );

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      expect(onNext).toHaveBeenCalledOnce();
    });

    it('calls onStepInto when Step Into button clicked', async () => {
      const user = userEvent.setup();
      const onStepInto = vi.fn();

      const steps: VideoTraceStep[] = [createMockStep({ stepIndex: 0 })];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[0]}
          steps={steps}
          currentStepIndex={0}
          totalSteps={1}
          onStepInto={onStepInto}
        />
      );

      const stepIntoButton = screen.getByRole('button', { name: /into/i });
      await user.click(stepIntoButton);

      expect(onStepInto).toHaveBeenCalledOnce();
    });

    it('calls onStepOver when Step Over button clicked', async () => {
      const user = userEvent.setup();
      const onStepOver = vi.fn();

      const steps: VideoTraceStep[] = [createMockStep({ stepIndex: 0 })];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[0]}
          steps={steps}
          currentStepIndex={0}
          totalSteps={1}
          onStepOver={onStepOver}
        />
      );

      const stepOverButton = screen.getByRole('button', { name: /over/i });
      await user.click(stepOverButton);

      expect(onStepOver).toHaveBeenCalledOnce();
    });

    it('calls onStepOut when Step Out button clicked', async () => {
      const user = userEvent.setup();
      const onStepOut = vi.fn();

      const steps: VideoTraceStep[] = [createMockStep({ stepIndex: 0 })];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[0]}
          steps={steps}
          currentStepIndex={0}
          totalSteps={1}
          onStepOut={onStepOut}
        />
      );

      const stepOutButton = screen.getByRole('button', { name: /out/i });
      await user.click(stepOutButton);

      expect(onStepOut).toHaveBeenCalledOnce();
    });

    it('calls onSeekToStep when call stack frame clicked', async () => {
      const user = userEvent.setup();
      const onSeekToStep = vi.fn();

      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'generic_call',
            expression: 'Loop2<"a">',
            level: 0,
          },
        }),
        createMockStep({
          stepIndex: 1,
          original: {
            step: 2,
            type: 'condition',
            expression: 'conditional',
            level: 1,
          },
        }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[1]}
          steps={steps}
          currentStepIndex={1}
          totalSteps={2}
          onSeekToStep={onSeekToStep}
        />
      );

      const frame = screen.getByText(/Loop2<"a">/);
      await user.click(frame);

      expect(onSeekToStep).toHaveBeenCalledWith(0);
    });
  });

  describe('Data flow verification', () => {
    it('passes currentStepIndex and totalSteps to DebugToolbar', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({ stepIndex: 0 }),
        createMockStep({ stepIndex: 1 }),
        createMockStep({ stepIndex: 2 }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[1]}
          steps={steps}
          currentStepIndex={1}
          totalSteps={3}
        />
      );

      // DebugToolbar should display step counter
      expect(screen.getByText(/step 1 \/ 3/i)).toBeDefined();
    });

    it('passes all steps to CallStackSection', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'generic_call',
            expression: 'Outer<T>',
            level: 0,
            position: { start: { line: 1, character: 0 }, end: { line: 1, character: 10 } },
          },
        }),
        createMockStep({
          stepIndex: 1,
          original: {
            step: 2,
            type: 'generic_call',
            expression: 'Inner<K>',
            level: 1,
            position: { start: { line: 2, character: 0 }, end: { line: 2, character: 10 } },
          },
        }),
        createMockStep({
          stepIndex: 2,
          original: {
            step: 3,
            type: 'condition',
            expression: 'K extends string',
            level: 2,
          },
        }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[2]}
          steps={steps}
          currentStepIndex={2}
          totalSteps={3}
        />
      );

      // All frames should be visible in call stack
      expect(screen.getByText(/Outer<T>/)).toBeDefined();
      expect(screen.getByText(/Inner<K>/)).toBeDefined();
      expect(screen.getByText(/K extends string/)).toBeDefined();
    });

    it('passes typeAliases and used types to GlobalsSection', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'generic_call',
            expression: 'Loop2<"a">',
            level: 0,
          },
        }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[0]}
          steps={steps}
          currentStepIndex={0}
          totalSteps={1}
          typeAliases={mockTypeAliases}
        />
      );

      expect(screen.getByText('Globals')).toBeDefined();
      // TypeAliases should be available to GlobalsSection
      // (Used types would be determined by GlobalsSection implementation)
    });

    it('extracts and passes parameters from currentStep to ScopeSection', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'generic_call',
            expression: 'Test<T, K>',
            level: 0,
            parameters: {
              T: '"hello"',
              K: 'number',
              Result: '1 | 2',
            },
          },
        }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[0]}
          steps={steps}
          currentStepIndex={0}
          totalSteps={1}
        />
      );

      expect(screen.getByText('Scope')).toBeDefined();
      expect(screen.getByText(/T = "hello"/)).toBeDefined();
      expect(screen.getByText(/K = number/)).toBeDefined();
      expect(screen.getByText(/Result = 1 \| 2/)).toBeDefined();
    });
  });

  describe('Complex scenarios', () => {
    it('handles union stepping with full data flow', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'conditional_union_distribute',
            expression: 'T extends "a" ? 1 : 2',
            level: 0,
            parameters: {
              T: '"a" | "b" | "x"',
            },
          },
        }),
        createMockStep({
          stepIndex: 1,
          original: {
            step: 2,
            type: 'conditional_union_member',
            expression: 'T extends "a" ? 1 : 2',
            level: 0,
            currentUnionMember: '"a"',
            currentUnionResults: '',
            parameters: {
              T: '"a"',
            },
          },
        }),
        createMockStep({
          stepIndex: 2,
          original: {
            step: 3,
            type: 'conditional_union_member',
            expression: 'T extends "a" ? 1 : 2',
            level: 0,
            currentUnionMember: '"currentMember"',
            currentUnionResults: 'accumulatedValue',
            parameters: {
              T: '"paramValue"',
            },
            result: 'finalResult',
          },
        }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[2]}
          steps={steps}
          currentStepIndex={2}
          totalSteps={3}
        />
      );

      // IterationSection should show union stepping details
      expect(screen.getByText('Iteration')).toBeDefined();

      // ScopeSection should show current parameter value
      expect(screen.getByText('Scope')).toBeDefined();
      expect(screen.getByText(/T = "paramValue"/)).toBeDefined();

      // Result bar should show result
      expect(screen.getByText(/finalResult/)).toBeDefined();
    });

    it('handles nested call stack with parameters at each level', () => {
      const steps: VideoTraceStep[] = [
        createMockStep({
          stepIndex: 0,
          original: {
            step: 1,
            type: 'generic_call',
            expression: 'Outer<string>',
            level: 0,
            parameters: { T: 'string' },
            position: { start: { line: 1, character: 0 }, end: { line: 1, character: 14 } },
          },
        }),
        createMockStep({
          stepIndex: 1,
          original: {
            step: 2,
            type: 'generic_call',
            expression: 'Inner<number>',
            level: 1,
            parameters: { K: 'number' },
            position: { start: { line: 2, character: 0 }, end: { line: 2, character: 14 } },
          },
        }),
      ];

      render(
        <StepDetailsPanel
          {...defaultProps}
          currentStep={steps[1]}
          steps={steps}
          currentStepIndex={1}
          totalSteps={2}
        />
      );

      // CallStackSection shows both frames
      expect(screen.getByText(/Outer<string>/)).toBeDefined();
      expect(screen.getByText(/Inner<number>/)).toBeDefined();

      // ScopeSection shows current level parameters
      expect(screen.getByText(/K = number/)).toBeDefined();
    });
  });
});
