import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MonacoCodeEditor } from '../../../src/web/components/MonacoCodeEditor.tsx';

// Mock the Monaco editor
vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange, options }: any) => (
    <div data-testid="monaco-mock">
      <textarea
        data-testid="editor-textarea"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={options?.readOnly}
      />
      {options?.readOnly && <span data-testid="readonly-indicator">readonly</span>}
    </div>
  ),
}));

describe('MonacoCodeEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders editor with provided code', () => {
    // Arrange
    const code = 'type Test = string;';

    // Act
    render(<MonacoCodeEditor code={code} onChange={vi.fn()} />);

    // Assert
    const textarea = screen.getByTestId('editor-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe(code);
  });

  it('displays header with title "TypeScript Code"', () => {
    // Act
    render(<MonacoCodeEditor code="" onChange={vi.fn()} />);

    // Assert
    expect(screen.getByText('TypeScript Code')).toBeDefined();
  });

  it('calls onChange when code is modified', () => {
    // Arrange
    const onChange = vi.fn();
    const initialCode = 'type A = string;';
    const newCode = 'type B = number;';

    // Act
    render(<MonacoCodeEditor code={initialCode} onChange={onChange} />);
    const textarea = screen.getByTestId('editor-textarea');
    fireEvent.change(textarea, { target: { value: newCode } });

    // Assert
    expect(onChange).toHaveBeenCalledWith(newCode);
  });

  it('sets editor to readonly when isLoading is true', () => {
    // Act
    render(<MonacoCodeEditor code="" onChange={vi.fn()} isLoading={true} />);

    // Assert
    expect(screen.getByTestId('readonly-indicator')).toBeDefined();
  });

  it('allows editing when isLoading is false', () => {
    // Act
    render(<MonacoCodeEditor code="" onChange={vi.fn()} isLoading={false} />);

    // Assert
    expect(screen.queryByTestId('readonly-indicator')).toBeNull();
  });

  it('handles empty string onChange', () => {
    // Arrange
    const onChange = vi.fn();

    // Act
    render(<MonacoCodeEditor code="test" onChange={onChange} />);
    const textarea = screen.getByTestId('editor-textarea');
    fireEvent.change(textarea, { target: { value: '' } });

    // Assert - onChange should be called with empty string
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('renders with default isLoading value of false', () => {
    // Act
    render(<MonacoCodeEditor code="" onChange={vi.fn()} />);

    // Assert - should not be readonly
    expect(screen.queryByTestId('readonly-indicator')).toBeNull();
  });
});
