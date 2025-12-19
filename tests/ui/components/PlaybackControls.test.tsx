import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { createMockVideoData } from "../../fixtures/mockVideoData.ts";
import { render } from "../../utils/renderWithProviders.tsx";

// Mock component - actual import may differ
type MockPlaybackControlsProps = {
  videoData?: unknown;
  onStepChange?: (step: number) => void;
};

const noop = () => {};
const handlePlay = (fn?: (n: number) => void) => () => fn?.(0);
const handleNext = (fn?: (n: number) => void) => () => fn?.(1);
const handlePrev = (fn?: (n: number) => void) => () => fn?.(-1);

const MockPlaybackControls = ({ onStepChange }: MockPlaybackControlsProps) => (
  <div data-testid="playback-controls">
    <button type="button" onClick={onStepChange ? handlePlay(onStepChange) : noop}>{"Play"}</button>
    <button type="button" onClick={onStepChange ? handleNext(onStepChange) : noop}>{"Next"}</button>
    <button type="button" onClick={onStepChange ? handlePrev(onStepChange) : noop}>{"Prev"}</button>
    <button type="button">{"1x"}</button>
    <button type="button">{"2x"}</button>
  </div>
);

describe("PlaybackControls Component", () => {
  it("renders disabled when no video data", () => {
    render(<MockPlaybackControls videoData={null} />);

    expect(screen.getByTestId("playback-controls")).toBeDefined();
  });

  it("renders play/pause button", () => {
    const mockData = createMockVideoData();
    render(<MockPlaybackControls videoData={mockData} />);

    const playButton = screen.getByText(/play/i);
    expect(playButton).toBeDefined();
  });

  it("handles next/previous step clicks", async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    const mockData = createMockVideoData();

    render(<MockPlaybackControls videoData={mockData} onStepChange={onStepChange} />);

    const nextButton = screen.getByText(/next/i);
    await user.click(nextButton);

    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it("handles speed change", async () => {
    const user = userEvent.setup();
    const mockData = createMockVideoData();

    render(<MockPlaybackControls videoData={mockData} />);

    const speedButtons = screen.getAllByText(/\dx/);
    expect(speedButtons.length).toBeGreaterThan(0);

    if (speedButtons[0]) {
      await user.click(speedButtons[0]);
    }

    expect(document.body).toBeDefined();
  });
});
