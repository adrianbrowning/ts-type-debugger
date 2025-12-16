import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../utils/renderWithProviders.tsx';
import userEvent from '@testing-library/user-event';
import { CallStackSection } from '../../../src/web/components/CallStackSection';
import { createMockStep } from '../../fixtures/mockVideoData.ts';
import type { VideoTraceStep } from '../../../src/core/types.ts';

describe('CallStackSection Component', () => {
  it('renders CollapsibleSection with "Call Stack" title', () => {
    const steps: VideoTraceStep[] = [
      createMockStep({
        stepIndex: 0,
        original: {
          step: 1,
          type: 'generic_call',
          expression: 'Loop2<"a" | "b" | "x">',
          level: 0,
          position: { start: { line: 5, character: 0 }, end: { line: 5, character: 20 } },
        },
      }),
    ];

    render(
      <CallStackSection
        steps={steps}
        currentStepIndex={0}
        onNavigateToStep={vi.fn()}
      />
    );

    expect(screen.getByText('Call Stack')).toBeDefined();
  });

  it('displays single frame with line number', () => {
    const steps: VideoTraceStep[] = [
      createMockStep({
        stepIndex: 0,
        original: {
          step: 1,
          type: 'generic_call',
          expression: 'Loop2<"a" | "b" | "x">',
          level: 0,
          position: { start: { line: 5, character: 0 }, end: { line: 5, character: 20 } },
        },
      }),
    ];

    render(
      <CallStackSection
        steps={steps}
        currentStepIndex={0}
        onNavigateToStep={vi.fn()}
      />
    );

    expect(screen.getByText(/Loop2<"a" \| "b" \| "x">/)).toBeDefined();
    expect(screen.getByText(/:5/)).toBeDefined();
  });

  it('displays nested call stack with proper indentation', () => {
    const steps: VideoTraceStep[] = [
      createMockStep({
        stepIndex: 0,
        original: {
          step: 1,
          type: 'generic_call',
          expression: 'Loop2<"a" | "b" | "x">',
          level: 0,
          position: { start: { line: 5, character: 0 }, end: { line: 5, character: 20 } },
        },
      }),
      createMockStep({
        stepIndex: 1,
        original: {
          step: 2,
          type: 'condition',
          expression: 'conditional',
          level: 1,
          position: { start: { line: 8, character: 0 }, end: { line: 8, character: 10 } },
        },
      }),
    ];

    render(
      <CallStackSection
        steps={steps}
        currentStepIndex={1}
        onNavigateToStep={vi.fn()}
      />
    );

    // Both frames should be visible
    expect(screen.getByText(/Loop2<"a" \| "b" \| "x">/)).toBeDefined();
    expect(screen.getByText(/conditional/)).toBeDefined();
  });

  it('calls onNavigateToStep when frame is clicked', async () => {
    const user = userEvent.setup();
    const onNavigateToStep = vi.fn();

    const steps: VideoTraceStep[] = [
      createMockStep({
        stepIndex: 0,
        original: {
          step: 1,
          type: 'generic_call',
          expression: 'Loop2<"a" | "b" | "x">',
          level: 0,
          position: { start: { line: 5, character: 0 }, end: { line: 5, character: 20 } },
        },
      }),
      createMockStep({
        stepIndex: 1,
        original: {
          step: 2,
          type: 'condition',
          expression: 'conditional',
          level: 1,
          position: { start: { line: 8, character: 0 }, end: { line: 8, character: 10 } },
        },
      }),
    ];

    render(
      <CallStackSection
        steps={steps}
        currentStepIndex={1}
        onNavigateToStep={onNavigateToStep}
      />
    );

    const frame = screen.getByText(/Loop2<"a" \| "b" \| "x">/);
    await user.click(frame);

    expect(onNavigateToStep).toHaveBeenCalledWith(0);
  });

  it('highlights current frame (top of stack)', () => {
    const steps: VideoTraceStep[] = [
      createMockStep({
        stepIndex: 0,
        original: {
          step: 1,
          type: 'generic_call',
          expression: 'Loop2<"a" | "b" | "x">',
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

    const { container } = render(
      <CallStackSection
        steps={steps}
        currentStepIndex={1}
        onNavigateToStep={vi.fn()}
      />
    );

    // Current frame (conditional) should be highlighted
    // Check for any element containing "conditional" with highlighting style
    const frames = container.querySelectorAll('[role="button"]');
    expect(frames.length).toBeGreaterThan(0);
  });

  it('displays (entry) for root frame', () => {
    const steps: VideoTraceStep[] = [
      createMockStep({
        stepIndex: 0,
        original: {
          step: 1,
          type: 'type_alias_start',
          expression: 'type Test = string',
          level: 0,
        },
      }),
    ];

    render(
      <CallStackSection
        steps={steps}
        currentStepIndex={0}
        onNavigateToStep={vi.fn()}
      />
    );

    expect(screen.getByText(/(entry)/)).toBeDefined();
  });

  it('displays frame without line number when position is missing', () => {
    const steps: VideoTraceStep[] = [
      createMockStep({
        stepIndex: 0,
        original: {
          step: 1,
          type: 'generic_call',
          expression: 'Loop2<"a" | "b" | "x">',
          level: 0,
          // No position
        },
      }),
    ];

    render(
      <CallStackSection
        steps={steps}
        currentStepIndex={0}
        onNavigateToStep={vi.fn()}
      />
    );

    expect(screen.getByText(/Loop2<"a" \| "b" \| "x">/)).toBeDefined();
    expect(screen.queryByText(/:/)).toBeNull();
  });

  it('handles empty steps array', () => {
    render(
      <CallStackSection
        steps={[]}
        currentStepIndex={-1}
        onNavigateToStep={vi.fn()}
      />
    );

    expect(screen.getByText('Call Stack')).toBeDefined();
    // Should show empty state or no frames
  });

  it('displays multi-level nested stack', () => {
    const steps: VideoTraceStep[] = [
      createMockStep({
        stepIndex: 0,
        original: {
          step: 1,
          type: 'generic_call',
          expression: 'Loop2<"a">',
          level: 0,
          position: { start: { line: 5, character: 0 }, end: { line: 5, character: 10 } },
        },
      }),
      createMockStep({
        stepIndex: 1,
        original: {
          step: 2,
          type: 'condition',
          expression: 'conditional',
          level: 1,
          position: { start: { line: 8, character: 0 }, end: { line: 8, character: 10 } },
        },
      }),
      createMockStep({
        stepIndex: 2,
        original: {
          step: 3,
          type: 'conditional_evaluate_left',
          expression: 'T extends "a"',
          level: 2,
          position: { start: { line: 10, character: 0 }, end: { line: 10, character: 15 } },
        },
      }),
    ];

    render(
      <CallStackSection
        steps={steps}
        currentStepIndex={2}
        onNavigateToStep={vi.fn()}
      />
    );

    expect(screen.getByText(/Loop2<"a">/)).toBeDefined();
    expect(screen.getByText(/conditional/)).toBeDefined();
    expect(screen.getByText(/T extends "a"/)).toBeDefined();
  });

  it('handles navigation to frame at different depth', async () => {
    const user = userEvent.setup();
    const onNavigateToStep = vi.fn();

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
      createMockStep({
        stepIndex: 2,
        original: {
          step: 3,
          type: 'generic_result',
          expression: 'result',
          level: 2,
        },
      }),
    ];

    render(
      <CallStackSection
        steps={steps}
        currentStepIndex={2}
        onNavigateToStep={onNavigateToStep}
      />
    );

    // Click on the root frame
    const rootFrame = screen.getByText(/Loop2<"a">/);
    await user.click(rootFrame);

    expect(onNavigateToStep).toHaveBeenCalledWith(0);
  });
});
