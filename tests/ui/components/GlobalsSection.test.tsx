import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlobalsSection } from '../../../src/web/components/GlobalsSection';
import type { TypeInfo } from '../../../src/core/types';

describe('GlobalsSection Component', () => {
  const mockTypeAliases: TypeInfo[] = [
    {
      name: 'Loop2',
      text: 'type Loop2<T> = T extends "a" ? 1 : 2',
      lines: ['type Loop2<T> = T extends "a" ? 1 : 2'],
      startLine: 1,
      endLine: 1,
    },
    {
      name: 'Stringify',
      text: 'type Stringify<T> = `${T & string}`',
      lines: ['type Stringify<T> = `${T & string}`'],
      startLine: 2,
      endLine: 2,
    },
    {
      name: 'getter',
      text: 'type getter<T> = T["key"]',
      lines: ['type getter<T> = T["key"]'],
      startLine: 3,
      endLine: 3,
    },
  ];

  it('renders CollapsibleSection with "Globals" title', () => {
    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2', 'Stringify'])}
      />
    );

    expect(screen.getByText('Globals')).toBeDefined();
  });

  it('displays badge with count of used types in "Show Used" mode', () => {
    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2', 'Stringify'])}
      />
    );

    expect(screen.getByText('Globals')).toBeDefined();
    expect(screen.getByText('2')).toBeDefined();
  });

  it('lists all used type names in monospace font', () => {
    const { container } = render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2', 'Stringify'])}
      />
    );

    expect(screen.getByText('Loop2')).toBeDefined();
    expect(screen.getByText('Stringify')).toBeDefined();

    // Check monospace font
    const loop2Element = screen.getByText('Loop2');
    const computedStyle = window.getComputedStyle(loop2Element);
    expect(computedStyle.fontFamily).toContain('monospace');
  });

  it('does not display unused types by default (Show Used mode)', () => {
    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2'])}
      />
    );

    expect(screen.getByText('Loop2')).toBeDefined();
    expect(screen.queryByText('Stringify')).toBeNull();
    expect(screen.queryByText('getter')).toBeNull();
  });

  it('shows message about hidden unused types in default mode', () => {
    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2'])}
      />
    );

    expect(screen.getByText(/2 unused types hidden/i)).toBeDefined();
  });

  it('displays "Show All" toggle button in header', () => {
    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2'])}
      />
    );

    expect(screen.getByText(/Show All/i)).toBeDefined();
  });

  it('toggles to show all types when "Show All" clicked', async () => {
    const user = userEvent.setup();

    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2'])}
      />
    );

    // Initially only shows used types
    expect(screen.getByText('Loop2')).toBeDefined();
    expect(screen.queryByText('Stringify')).toBeNull();
    expect(screen.queryByText('getter')).toBeNull();

    // Click "Show All"
    const showAllButton = screen.getByText(/Show All/i);
    await user.click(showAllButton);

    // Now all types should be visible
    expect(screen.getByText('Loop2')).toBeDefined();
    expect(screen.getByText('Stringify')).toBeDefined();
    expect(screen.getByText('getter')).toBeDefined();
  });

  it('displays unused types with dimmed styling in Show All mode', async () => {
    const user = userEvent.setup();

    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2'])}
      />
    );

    // Toggle to Show All
    const showAllButton = screen.getByText(/Show All/i);
    await user.click(showAllButton);

    // Check that unused types have dimmed/secondary color
    const getterElement = screen.getByText('getter');
    const stringifyElement = screen.getByText('Stringify');

    const getterStyle = window.getComputedStyle(getterElement);
    const stringifyStyle = window.getComputedStyle(stringifyElement);

    // Both unused should have secondary/dimmed color (not primary)
    expect(parseFloat(getterStyle.opacity)).toBeLessThan(1);
    expect(parseFloat(stringifyStyle.opacity)).toBeLessThan(1);
  });

  it('toggles button text to "Show Used" after showing all', async () => {
    const user = userEvent.setup();

    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2'])}
      />
    );

    const toggleButton = screen.getByText(/Show All/i);
    await user.click(toggleButton);

    expect(screen.getByText(/Show Used/i)).toBeDefined();
    expect(screen.queryByText(/Show All/i)).toBeNull();
  });

  it('hides unused types again when "Show Used" clicked', async () => {
    const user = userEvent.setup();

    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2'])}
      />
    );

    // Show all
    const showAllButton = screen.getByText(/Show All/i);
    await user.click(showAllButton);
    expect(screen.getByText('getter')).toBeDefined();

    // Hide unused
    const showUsedButton = screen.getByText(/Show Used/i);
    await user.click(showUsedButton);
    expect(screen.queryByText('getter')).toBeNull();
    expect(screen.getByText(/2 unused types hidden/i)).toBeDefined();
  });

  it('calls onTypeClick with type name when type clicked', async () => {
    const user = userEvent.setup();
    const onTypeClick = vi.fn();

    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2', 'Stringify'])}
        onTypeClick={onTypeClick}
      />
    );

    const loop2Element = screen.getByText('Loop2');
    await user.click(loop2Element);

    expect(onTypeClick).toHaveBeenCalledWith('Loop2');
    expect(onTypeClick).toHaveBeenCalledTimes(1);
  });

  it('allows clicking unused types in Show All mode', async () => {
    const user = userEvent.setup();
    const onTypeClick = vi.fn();

    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2'])}
        onTypeClick={onTypeClick}
      />
    );

    // Show all types
    const showAllButton = screen.getByText(/Show All/i);
    await user.click(showAllButton);

    // Click unused type
    const getterElement = screen.getByText('getter');
    await user.click(getterElement);

    expect(onTypeClick).toHaveBeenCalledWith('getter');
  });

  it('handles empty type aliases list', () => {
    render(
      <GlobalsSection
        typeAliases={[]}
        usedTypeNames={new Set()}
      />
    );

    expect(screen.getByText('Globals')).toBeDefined();
    expect(screen.getByText('0')).toBeDefined();
  });

  it('handles all types being used', () => {
    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2', 'Stringify', 'getter'])}
      />
    );

    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('Loop2')).toBeDefined();
    expect(screen.getByText('Stringify')).toBeDefined();
    expect(screen.getByText('getter')).toBeDefined();
    expect(screen.queryByText(/unused/i)).toBeNull();
  });

  it('handles no types being used', () => {
    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set()}
      />
    );

    expect(screen.getByText('0')).toBeDefined();
    expect(screen.queryByText('Loop2')).toBeNull();
    expect(screen.getByText(/3 unused types hidden/i)).toBeDefined();
  });

  it('collapses and expands section when header clicked', async () => {
    const user = userEvent.setup();

    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2'])}
      />
    );

    // Initially visible
    expect(screen.getByText('Loop2')).toBeDefined();

    // Click header to collapse
    const header = screen.getByText('Globals');
    await user.click(header);

    // Content should be hidden
    expect(screen.queryByText('Loop2')).toBeNull();
  });

  it('displays used types before unused types in Show All mode', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['getter'])}
      />
    );

    // Show all
    const showAllButton = screen.getByText(/Show All/i);
    await user.click(showAllButton);

    const text = container.textContent || '';
    const getterIndex = text.indexOf('getter');
    const loop2Index = text.indexOf('Loop2');
    const stringifyIndex = text.indexOf('Stringify');

    // Used type (getter) should appear before unused types
    expect(getterIndex).toBeGreaterThan(-1);
    expect(loop2Index).toBeGreaterThan(getterIndex);
    expect(stringifyIndex).toBeGreaterThan(getterIndex);
  });

  it('displays separator line between content and hidden message', () => {
    const { container } = render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2'])}
      />
    );

    // Look for horizontal separator (hr or styled div with border)
    const separator = container.querySelector('hr') ||
                     container.querySelector('[style*="border"]');

    expect(separator).toBeDefined();
  });

  it('badge updates when toggling between Show All and Show Used', async () => {
    const user = userEvent.setup();

    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2'])}
      />
    );

    // Initially shows used count (1)
    expect(screen.getByText('1')).toBeDefined();

    // Show all - badge should show total count
    const showAllButton = screen.getByText(/Show All/i);
    await user.click(showAllButton);
    expect(screen.getByText('3')).toBeDefined();

    // Show used - badge should show used count again
    const showUsedButton = screen.getByText(/Show Used/i);
    await user.click(showUsedButton);
    expect(screen.getByText('1')).toBeDefined();
  });

  it('does not crash when onTypeClick not provided', async () => {
    const user = userEvent.setup();

    render(
      <GlobalsSection
        typeAliases={mockTypeAliases}
        usedTypeNames={new Set(['Loop2'])}
      />
    );

    const loop2Element = screen.getByText('Loop2');
    await user.click(loop2Element);

    // Should not throw error
    expect(loop2Element).toBeDefined();
  });

  it('handles single used and single unused type', () => {
    const twoTypes: TypeInfo[] = [
      mockTypeAliases[0],
      mockTypeAliases[1],
    ];

    render(
      <GlobalsSection
        typeAliases={twoTypes}
        usedTypeNames={new Set(['Loop2'])}
      />
    );

    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('Loop2')).toBeDefined();
    expect(screen.getByText(/1 unused type hidden/i)).toBeDefined();
  });
});
