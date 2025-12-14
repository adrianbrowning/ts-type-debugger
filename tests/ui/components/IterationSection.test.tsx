import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IterationSection } from '../../../src/web/components/IterationSection';

describe('IterationSection Component', () => {
  it('renders CollapsibleSection with "Iteration" title', () => {
    render(
      <IterationSection
        currentMember='"a"'
        accumulatedResults='1 | 2'
      />
    );

    expect(screen.getByText('Iteration')).toBeDefined();
  });

  it('returns null when currentMember is not provided', () => {
    const { container } = render(
      <IterationSection
        accumulatedResults='1 | 2'
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('returns null when currentMember is undefined', () => {
    const { container } = render(
      <IterationSection
        currentMember={undefined}
        accumulatedResults='1 | 2'
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('displays "Current Member:" label with value', () => {
    render(
      <IterationSection
        currentMember='"a"'
        accumulatedResults='1 | 2'
      />
    );

    expect(screen.getByText(/Current Member:/)).toBeDefined();
    expect(screen.getByText(/"a"/)).toBeDefined();
  });

  it('displays "Accumulated:" label with value', () => {
    render(
      <IterationSection
        currentMember='"a"'
        accumulatedResults='1 | 2'
      />
    );

    expect(screen.getByText(/Accumulated:/)).toBeDefined();
    expect(screen.getByText(/1 \| 2/)).toBeDefined();
  });

  it('displays "none" when accumulatedResults is empty', () => {
    render(
      <IterationSection
        currentMember='"a"'
        accumulatedResults=''
      />
    );

    expect(screen.getByText(/Accumulated:/)).toBeDefined();
    expect(screen.getByText(/none/)).toBeDefined();
  });

  it('displays "none" when accumulatedResults is undefined', () => {
    render(
      <IterationSection
        currentMember='"a"'
        accumulatedResults={undefined}
      />
    );

    expect(screen.getByText(/Accumulated:/)).toBeDefined();
    expect(screen.getByText(/none/)).toBeDefined();
  });

  it('displays index "1 of ?" when accumulatedResults is empty', () => {
    render(
      <IterationSection
        currentMember='"a"'
        accumulatedResults=''
      />
    );

    expect(screen.getByText(/Index:/)).toBeDefined();
    expect(screen.getByText(/1 of \?/)).toBeDefined();
  });

  it('displays correct index for single member in accumulated results', () => {
    render(
      <IterationSection
        currentMember='"a"'
        accumulatedResults='1'
      />
    );

    expect(screen.getByText(/Index:/)).toBeDefined();
    expect(screen.getByText(/1 of \?/)).toBeDefined();
  });

  it('displays correct index for two members in accumulated results', () => {
    render(
      <IterationSection
        currentMember='"b"'
        accumulatedResults='1 | 2'
      />
    );

    expect(screen.getByText(/Index:/)).toBeDefined();
    expect(screen.getByText(/2 of \?/)).toBeDefined();
  });

  it('displays correct index for three members in accumulated results', () => {
    render(
      <IterationSection
        currentMember='"c"'
        accumulatedResults='1 | 2 | 3'
      />
    );

    expect(screen.getByText(/Index:/)).toBeDefined();
    expect(screen.getByText(/3 of \?/)).toBeDefined();
  });

  it('filters out "never" from member count', () => {
    render(
      <IterationSection
        currentMember='"x"'
        accumulatedResults='1 | 2 | never'
      />
    );

    expect(screen.getByText(/Index:/)).toBeDefined();
    expect(screen.getByText(/2 of \?/)).toBeDefined();
  });

  it('handles accumulated results with only "never"', () => {
    render(
      <IterationSection
        currentMember='"x"'
        accumulatedResults='never'
      />
    );

    expect(screen.getByText(/Index:/)).toBeDefined();
    expect(screen.getByText(/0 of \?/)).toBeDefined();
  });

  it('handles accumulated results with multiple "never" types', () => {
    render(
      <IterationSection
        currentMember='"x"'
        accumulatedResults='never | never | never'
      />
    );

    expect(screen.getByText(/Index:/)).toBeDefined();
    expect(screen.getByText(/0 of \?/)).toBeDefined();
  });

  it('handles complex union types in accumulated results', () => {
    render(
      <IterationSection
        currentMember='"d"'
        accumulatedResults='"Prop a" | "Prop b" | "Prop c"'
      />
    );

    expect(screen.getByText(/Index:/)).toBeDefined();
    expect(screen.getByText(/3 of \?/)).toBeDefined();
  });

  it('renders with all props provided', () => {
    render(
      <IterationSection
        currentMember='"b"'
        accumulatedResults='1 | 2'
      />
    );

    expect(screen.getByText('Iteration')).toBeDefined();
    expect(screen.getByText(/Current Member:/)).toBeDefined();
    expect(screen.getByText(/"b"/)).toBeDefined();
    expect(screen.getByText(/Accumulated:/)).toBeDefined();
    expect(screen.getByText(/1 \| 2/)).toBeDefined();
    expect(screen.getByText(/Index:/)).toBeDefined();
    expect(screen.getByText(/2 of \?/)).toBeDefined();
  });

  it('can be collapsed and expanded', async () => {
    const user = userEvent.setup();

    render(
      <IterationSection
        currentMember='"a"'
        accumulatedResults='1'
      />
    );

    // Initially expanded - content visible
    expect(screen.getByText(/Current Member:/)).toBeDefined();

    // Click header to collapse
    const header = screen.getByText('Iteration');
    await user.click(header);

    // Content should be hidden
    expect(screen.queryByText(/Current Member:/)).toBeNull();
  });

  it('handles whitespace in accumulated results', () => {
    render(
      <IterationSection
        currentMember='"a"'
        accumulatedResults='1|2|3'
      />
    );

    // Should handle both with and without spaces around |
    expect(screen.getByText(/Index:/)).toBeDefined();
  });

  it('handles member count with mixed spacing', () => {
    render(
      <IterationSection
        currentMember='"c"'
        accumulatedResults='1| 2 |3'
      />
    );

    expect(screen.getByText(/Index:/)).toBeDefined();
    expect(screen.getByText(/3 of \?/)).toBeDefined();
  });

  it('uses CollapsibleSection component internally', () => {
    const { container } = render(
      <IterationSection
        currentMember='"a"'
        accumulatedResults='1'
      />
    );

    // Check for down arrow indicating CollapsibleSection
    expect(container.textContent).toContain('▼');
  });
});
