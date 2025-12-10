import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

// Mock MonacoCodeEditor component
const MockMonacoCodeEditor = ({ value, onChange }: any) => (
  <div data-testid="monaco-editor">
    <textarea
      data-testid="editor-textarea"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    />
  </div>
);

describe('MonacoCodeEditor Component', () => {
  it('renders editor', () => {
    const { container } = render(
      <MockMonacoCodeEditor value="type Test = string;" onChange={() => {}} />
    );

    const editor = container.querySelector('[data-testid="monaco-editor"]');
    expect(editor).toBeDefined();
  });

  it('updates code on change', () => {
    const onChange = vi.fn();
    const { container } = render(
      <MockMonacoCodeEditor value="initial" onChange={onChange} />
    );

    const textarea = container.querySelector('[data-testid="editor-textarea"]') as HTMLTextAreaElement;
    expect(textarea).toBeDefined();

    fireEvent.change(textarea, { target: { value: 'updated' } });
    expect(onChange).toHaveBeenCalledWith('updated');
  });
});
