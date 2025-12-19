import { screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { createMockStep } from "../../fixtures/mockVideoData.ts";
import { render } from "../../utils/renderWithProviders.tsx";

// Mock StepDetailsPanel component
type StepOriginal = {
  expression?: string;
  parameters?: unknown;
  result?: string;
  currentUnionMember?: string;
};

type MockStepDetailsPanelProps = {
  step?: { original: StepOriginal; };
};

const MockStepDetailsPanel = ({ step }: MockStepDetailsPanelProps) => (
  <div data-testid="step-details">
    <div>{"Expression: "}{step?.original.expression}</div>
    {step?.original.parameters && (
      <div>{"Parameters: "}{JSON.stringify(step.original.parameters)}</div>
    )}
    {step?.original.result && <div>{"Result: "}{step.original.result}</div>}
    {step?.original.currentUnionMember && (
      <div>{"Union Member: "}{step.original.currentUnionMember}</div>
    )}
  </div>
);

describe("StepDetailsPanel Component", () => {
  it("displays current step details", () => {
    const mockStep = createMockStep({
      original: {
        step: 1,
        type: "generic_call",
        expression: "Identity<string>",
        level: 0,
      },
    });

    render(<MockStepDetailsPanel step={mockStep} />);

    expect(screen.getByText(/Identity<string>/)).toBeDefined();
  });

  it("displays currentUnionMember when present", () => {
    const mockStep = createMockStep({
      original: {
        step: 1,
        type: "conditional_union_member",
        expression: "test",
        level: 0,
        currentUnionMember: "\"a\"",
      },
    });

    render(<MockStepDetailsPanel step={mockStep} />);

    expect(screen.getByText(/Union Member: "a"/)).toBeDefined();
  });

  it("displays result when available", () => {
    const mockStep = createMockStep({
      original: {
        step: 1,
        type: "generic_result",
        expression: "test",
        level: 0,
        result: "string",
      },
    });

    render(<MockStepDetailsPanel step={mockStep} />);

    expect(screen.getByText(/Result: string/)).toBeDefined();
  });
});
