import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CollapsibleSection } from '../../../src/web/components/CollapsibleSection';

describe('CollapsibleSection Component', () => {
  it('renders with title and expanded by default', () => {
    render(
      <CollapsibleSection title="Test Section">
        <div>Child content</div>
      </CollapsibleSection>
    );

    expect(screen.getByText('Test Section')).toBeDefined();
    expect(screen.getByText('Child content')).toBeDefined();
  });

  it('shows down arrow icon when expanded', () => {
    render(
      <CollapsibleSection title="Test Section">
        <div>Content</div>
      </CollapsibleSection>
    );

    // Look for ▼ character in the header
    const header = screen.getByText('Test Section').closest('button') || screen.getByText('Test Section').closest('div');
    expect(header?.textContent).toContain('▼');
  });

  it('toggles collapsed state when header clicked', async () => {
    const user = userEvent.setup();

    render(
      <CollapsibleSection title="Test Section">
        <div>Child content</div>
      </CollapsibleSection>
    );

    // Initially visible
    expect(screen.getByText('Child content')).toBeDefined();

    // Click header to collapse
    const header = screen.getByText('Test Section');
    await user.click(header);

    // Content should be hidden
    expect(screen.queryByText('Child content')).toBeNull();
  });

  it('shows right arrow when collapsed', async () => {
    const user = userEvent.setup();

    render(
      <CollapsibleSection title="Test Section" defaultExpanded={false}>
        <div>Content</div>
      </CollapsibleSection>
    );

    // Look for ▶ character when collapsed
    const header = screen.getByText('Test Section').closest('button') || screen.getByText('Test Section').closest('div');
    expect(header?.textContent).toContain('▶');
  });

  it('respects defaultExpanded false prop', () => {
    render(
      <CollapsibleSection title="Test Section" defaultExpanded={false}>
        <div>Child content</div>
      </CollapsibleSection>
    );

    expect(screen.getByText('Test Section')).toBeDefined();
    expect(screen.queryByText('Child content')).toBeNull();
  });

  it('displays badge next to title', () => {
    render(
      <CollapsibleSection title="Globals" badge="3">
        <div>Content</div>
      </CollapsibleSection>
    );

    expect(screen.getByText(/Globals/)).toBeDefined();
    expect(screen.getByText(/3/)).toBeDefined();
  });

  it('displays numeric badge', () => {
    render(
      <CollapsibleSection title="Variables" badge={5}>
        <div>Content</div>
      </CollapsibleSection>
    );

    expect(screen.getByText(/Variables/)).toBeDefined();
    expect(screen.getByText(/5/)).toBeDefined();
  });

  it('renders headerRight content on right side', () => {
    render(
      <CollapsibleSection
        title="Test Section"
        headerRight={<button>Show All</button>}
      >
        <div>Content</div>
      </CollapsibleSection>
    );

    expect(screen.getByText('Test Section')).toBeDefined();
    expect(screen.getByText('Show All')).toBeDefined();
  });

  it('toggles back to expanded state', async () => {
    const user = userEvent.setup();

    render(
      <CollapsibleSection title="Test Section">
        <div>Child content</div>
      </CollapsibleSection>
    );

    const header = screen.getByText('Test Section');

    // Collapse
    await user.click(header);
    expect(screen.queryByText('Child content')).toBeNull();

    // Expand again
    await user.click(header);
    expect(screen.getByText('Child content')).toBeDefined();
  });

  it('does not affect headerRight when toggling', async () => {
    const user = userEvent.setup();

    render(
      <CollapsibleSection
        title="Test Section"
        headerRight={<button>Action</button>}
      >
        <div>Content</div>
      </CollapsibleSection>
    );

    const actionButton = screen.getByText('Action');
    expect(actionButton).toBeDefined();

    // Collapse section
    const header = screen.getByText('Test Section');
    await user.click(header);

    // headerRight should still be visible
    expect(screen.getByText('Action')).toBeDefined();
  });

  it('renders without badge when not provided', () => {
    const { container } = render(
      <CollapsibleSection title="Test Section">
        <div>Content</div>
      </CollapsibleSection>
    );

    expect(screen.getByText('Test Section')).toBeDefined();
    // Should not render any badge-related elements
    expect(container.querySelector('[class*="badge"]')).toBeNull();
  });
});
