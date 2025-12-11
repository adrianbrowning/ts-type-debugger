import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScopeSection } from '../../../src/web/components/ScopeSection';

describe('ScopeSection Component', () => {
  it('renders CollapsibleSection with "Scope" title', () => {
    render(
      <ScopeSection
        parameters={{
          T: 'string',
          K: '"a" | "b"',
        }}
      />
    );

    expect(screen.getByText('Scope')).toBeDefined();
  });

  it('displays badge with parameter count', () => {
    render(
      <ScopeSection
        parameters={{
          T: 'string',
          K: '"a" | "b"',
          Result: '1 | 2',
        }}
      />
    );

    expect(screen.getByText('Scope')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
  });

  it('displays parameters in Name = Value format', () => {
    render(
      <ScopeSection
        parameters={{
          T: '"a"',
          K: 'string',
        }}
      />
    );

    expect(screen.getByText(/T = "a"/)).toBeDefined();
    expect(screen.getByText(/K = string/)).toBeDefined();
  });

  it('displays parameter values in monospace font', () => {
    const { container } = render(
      <ScopeSection
        parameters={{
          T: 'string',
        }}
      />
    );

    // Find element containing the value and check its font-family
    const valueElement = container.querySelector('[style*="monospace"]') ||
                         container.querySelector('code') ||
                         container.querySelector('[style*="font-family"]');

    expect(valueElement).toBeDefined();
    expect(valueElement?.textContent).toContain('string');
  });

  it('shows "No parameters in scope" when empty', () => {
    render(<ScopeSection parameters={{}} />);

    expect(screen.getByText('Scope')).toBeDefined();
    expect(screen.getByText(/No parameters in scope/i)).toBeDefined();
  });

  it('preserves parameter order from Object.entries', () => {
    const { container } = render(
      <ScopeSection
        parameters={{
          T: '"a"',
          K: 'string',
          Result: '1 | 2',
        }}
      />
    );

    const text = container.textContent || '';
    const tIndex = text.indexOf('T = "a"');
    const kIndex = text.indexOf('K = string');
    const resultIndex = text.indexOf('Result = 1 | 2');

    // Parameters should appear in order
    expect(tIndex).toBeGreaterThan(-1);
    expect(kIndex).toBeGreaterThan(tIndex);
    expect(resultIndex).toBeGreaterThan(kIndex);
  });

  it('collapses and expands section when header clicked', async () => {
    const user = userEvent.setup();

    render(
      <ScopeSection
        parameters={{
          T: 'string',
        }}
      />
    );

    // Initially visible
    expect(screen.getByText(/T = string/)).toBeDefined();

    // Click header to collapse
    const header = screen.getByText('Scope');
    await user.click(header);

    // Content should be hidden
    expect(screen.queryByText(/T = string/)).toBeNull();
  });

  it('displays badge as zero when no parameters', () => {
    render(<ScopeSection parameters={{}} />);

    expect(screen.getByText('Scope')).toBeDefined();
    expect(screen.getByText('0')).toBeDefined();
  });

  it('handles single parameter correctly', () => {
    render(
      <ScopeSection
        parameters={{
          T: '"hello"',
        }}
      />
    );

    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText(/T = "hello"/)).toBeDefined();
  });

  it('handles complex union types', () => {
    render(
      <ScopeSection
        parameters={{
          T: '"a" | "b" | "c"',
          K: 'string | number',
          Result: '1 | 2 | never',
        }}
      />
    );

    expect(screen.getByText(/T = "a" \| "b" \| "c"/)).toBeDefined();
    expect(screen.getByText(/K = string \| number/)).toBeDefined();
    expect(screen.getByText(/Result = 1 \| 2 \| never/)).toBeDefined();
  });

  it('displays expanded by default', () => {
    render(
      <ScopeSection
        parameters={{
          T: 'string',
        }}
      />
    );

    // Content should be visible by default
    expect(screen.getByText(/T = string/)).toBeDefined();

    // Look for down arrow (expanded state)
    const header = screen.getByText('Scope').closest('button') || screen.getByText('Scope').closest('div');
    expect(header?.textContent).toContain('▼');
  });

  it('handles parameters with special characters', () => {
    render(
      <ScopeSection
        parameters={{
          T: '`Prop ${string}`',
          K: '{ [key: string]: any }',
        }}
      />
    );

    expect(screen.getByText(/T = `Prop \$\{string\}`/)).toBeDefined();
    expect(screen.getByText(/K = \{ \[key: string\]: any \}/)).toBeDefined();
  });

  it('renders multiple parameters with consistent spacing', () => {
    const { container } = render(
      <ScopeSection
        parameters={{
          T: 'string',
          K: 'number',
          V: 'boolean',
        }}
      />
    );

    // All parameters should be visible
    expect(screen.getByText(/T = string/)).toBeDefined();
    expect(screen.getByText(/K = number/)).toBeDefined();
    expect(screen.getByText(/V = boolean/)).toBeDefined();

    // Should have consistent layout (check for multiple parameter entries)
    const text = container.textContent || '';
    expect(text).toContain('T = string');
    expect(text).toContain('K = number');
    expect(text).toContain('V = boolean');
  });
});
