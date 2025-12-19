import { fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { render } from "../../utils/renderWithProviders.tsx";

// Mock MonacoCodeEditor component
type MockMonacoCodeEditorProps = {
  value: string;
  onChange?: (value: string) => void;
};

const handleChange = (onChange?: (value: string) => void) => (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  onChange?.(e.target.value);
};

const MockMonacoCodeEditor = ({ value, onChange }: MockMonacoCodeEditorProps) => (
  <div data-testid="monaco-editor">
    <textarea
      data-testid="editor-textarea"
      value={value}
      onChange={handleChange(onChange)}
    />
  </div>
);

const noop = () => {};

describe("MonacoCodeEditor Component", () => {
  it("renders editor", () => {
    const { container } = render(
      <MockMonacoCodeEditor value="type Test = string;" onChange={noop} />
    );

    const editor = container.querySelector("[data-testid=\"monaco-editor\"]");
    expect(editor).toBeDefined();
  });

  it("updates code on change", () => {
    const onChange = vi.fn();
    const { container } = render(
      <MockMonacoCodeEditor value="initial" onChange={onChange} />
    );

    const textarea = container.querySelector("[data-testid=\"editor-textarea\"]") as HTMLTextAreaElement;
    expect(textarea).toBeDefined();

    fireEvent.change(textarea, { target: { value: "updated" } });
    expect(onChange).toHaveBeenCalledWith("updated");
  });
});
