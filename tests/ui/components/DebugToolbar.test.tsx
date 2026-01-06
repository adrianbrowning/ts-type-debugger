import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { DebugToolbar } from "../../../src/web/components/DebugToolbar";
import { render } from "../../utils/renderWithProviders.tsx";

describe("DebugToolbar Component", () => {
  const defaultProps = {
    currentStepIndex: 5,
    totalSteps: 23,
    onJumpToStart: vi.fn(),
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onStepInto: vi.fn(),
    onStepOut: vi.fn(),
    canStepOut: true,
  };

  it("renders all navigation buttons", () => {
    render(<DebugToolbar {...defaultProps} />);

    expect(screen.getByRole("button", { name: /jump to start/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /previous/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /next/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /into/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /out/i })).toBeDefined();
  });

  it("displays step counter correctly (1-indexed)", () => {
    render(<DebugToolbar {...defaultProps} />);

    // currentStepIndex=5 displays as Step 6 (1-indexed for humans)
    expect(screen.getByText(/step 6 \/ 23/i)).toBeDefined();
  });

  it("calls onJumpToStart when jump to start button clicked", async () => {
    const user = userEvent.setup();
    const onJumpToStart = vi.fn();

    render(<DebugToolbar {...defaultProps} onJumpToStart={onJumpToStart} />);

    const jumpButton = screen.getByRole("button", { name: /jump to start/i });
    await user.click(jumpButton);

    expect(onJumpToStart).toHaveBeenCalledOnce();
  });

  it("calls onPrevious when previous button clicked", async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();

    render(<DebugToolbar {...defaultProps} onPrevious={onPrevious} />);

    const prevButton = screen.getByRole("button", { name: /previous/i });
    await user.click(prevButton);

    expect(onPrevious).toHaveBeenCalledOnce();
  });

  it("calls onNext when next button clicked", async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();

    render(<DebugToolbar {...defaultProps} onNext={onNext} />);

    const nextButton = screen.getByRole("button", { name: /next/i });
    await user.click(nextButton);

    expect(onNext).toHaveBeenCalledOnce();
  });

  it("calls onStepInto when step into button clicked", async () => {
    const user = userEvent.setup();
    const onStepInto = vi.fn();

    render(<DebugToolbar {...defaultProps} onStepInto={onStepInto} />);

    const stepIntoButton = screen.getByRole("button", { name: /into/i });
    await user.click(stepIntoButton);

    expect(onStepInto).toHaveBeenCalledOnce();
  });

  it("calls onStepOut when step out button clicked", async () => {
    const user = userEvent.setup();
    const onStepOut = vi.fn();

    render(<DebugToolbar {...defaultProps} onStepOut={onStepOut} />);

    const stepOutButton = screen.getByRole("button", { name: /out/i });
    await user.click(stepOutButton);

    expect(onStepOut).toHaveBeenCalledOnce();
  });

  it("disables jump to start button when at first step", () => {
    render(<DebugToolbar {...defaultProps} currentStepIndex={0} />);

    const jumpButton = screen.getByRole("button", { name: /jump to start/i });
    expect(jumpButton.getAttribute("disabled")).toBe("");
  });

  it("disables previous button when at first step", () => {
    render(<DebugToolbar {...defaultProps} currentStepIndex={0} />);

    const prevButton = screen.getByRole("button", { name: /previous/i });
    expect(prevButton.getAttribute("disabled")).toBe("");
  });

  it("disables next button when at last step", () => {
    render(<DebugToolbar
      {...defaultProps}
      currentStepIndex={22}
      totalSteps={23}
    />);

    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton.getAttribute("disabled")).toBe("");
  });

  it("disables step out button when canStepOut is false", () => {
    render(<DebugToolbar {...defaultProps} canStepOut={false} />);

    const stepOutButton = screen.getByRole("button", { name: /out/i });
    expect(stepOutButton.getAttribute("disabled")).toBe("");
  });

  it("enables step out button when canStepOut is true", () => {
    render(<DebugToolbar {...defaultProps} canStepOut={true} />);

    const stepOutButton = screen.getByRole("button", { name: /out/i });
    expect(stepOutButton.getAttribute("disabled")).toBeNull();
  });

  it("enables jump to start button when not at first step", () => {
    render(<DebugToolbar {...defaultProps} currentStepIndex={5} />);

    const jumpButton = screen.getByRole("button", { name: /jump to start/i });
    expect(jumpButton.getAttribute("disabled")).toBeNull();
  });

  it("enables previous button when not at first step", () => {
    render(<DebugToolbar {...defaultProps} currentStepIndex={5} />);

    const prevButton = screen.getByRole("button", { name: /previous/i });
    expect(prevButton.getAttribute("disabled")).toBeNull();
  });

  it("enables next button when not at last step", () => {
    render(<DebugToolbar
      {...defaultProps}
      currentStepIndex={5}
      totalSteps={23}
    />);

    const nextButton = screen.getByRole("button", { name: /next/i });
    expect(nextButton.getAttribute("disabled")).toBeNull();
  });

  it("updates step counter when props change (1-indexed)", () => {
    const { rerender } = render(<DebugToolbar {...defaultProps} />);

    // currentStepIndex=5 → "Step 6 / 23"
    expect(screen.getByText(/step 6 \/ 23/i)).toBeDefined();

    rerender(<DebugToolbar
      {...defaultProps}
      currentStepIndex={10}
      totalSteps={30}
    />);

    // currentStepIndex=10 → "Step 11 / 30"
    expect(screen.getByText(/step 11 \/ 30/i)).toBeDefined();
  });
});
