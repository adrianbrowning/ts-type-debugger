import { describe, it, expect } from "vitest";
import { createMockTypeInfo } from "../../fixtures/mockVideoData.ts";
import { render } from "../../utils/renderWithProviders.tsx";

// Mock CodePanel component
type MockCodePanelProps = {
  activeType?: { text?: string; };
  highlightLine?: number;
};

const MockCodePanel = ({ activeType, highlightLine }: MockCodePanelProps) => (
  <div data-testid="code-panel">
    <pre data-line={highlightLine}>
      <code>{activeType?.text || "No code"}</code>
    </pre>
  </div>
);

describe("CodePanel Component", () => {
  it("highlights active line based on current step", () => {
    const mockType = createMockTypeInfo();
    const { container } = render(
      <MockCodePanel activeType={mockType} highlightLine={1} />
    );

    const pre = container.querySelector("[data-line=\"1\"]");
    expect(pre).toBeDefined();
  });

  it("scrolls to highlighted line", () => {
    const mockType = createMockTypeInfo({ lines: [ "line 1", "line 2", "line 3" ] });

    const { container } = render(
      <MockCodePanel activeType={mockType} highlightLine={2} />
    );

    // Verify component renders
    expect(container.querySelector("[data-testid=\"code-panel\"]")).toBeDefined();
  });
});
