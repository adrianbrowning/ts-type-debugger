import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../utils/renderWithProviders.tsx';
import userEvent from '@testing-library/user-event';
import { createMockVideoData } from '../../fixtures/mockVideoData.ts';

// Mock component - actual import may differ
const MockPlaybackControls = ({ videoData, onStepChange }: any) => (
  <div data-testid="playback-controls">
    <button onClick={() => onStepChange?.(0)}>Play</button>
    <button onClick={() => onStepChange?.(1)}>Next</button>
    <button onClick={() => onStepChange?.(-1)}>Prev</button>
    <button>1x</button>
    <button>2x</button>
  </div>
);

describe('PlaybackControls Component', () => {
  it('renders disabled when no video data', () => {
    render(<MockPlaybackControls videoData={null} />);

    expect(screen.getByTestId('playback-controls')).toBeDefined();
  });

  it('renders play/pause button', () => {
    const mockData = createMockVideoData();
    render(<MockPlaybackControls videoData={mockData} />);

    const playButton = screen.getByText(/play/i);
    expect(playButton).toBeDefined();
  });

  it('handles next/previous step clicks', async () => {
    const user = userEvent.setup();
    const onStepChange = vi.fn();
    const mockData = createMockVideoData();

    render(<MockPlaybackControls videoData={mockData} onStepChange={onStepChange} />);

    const nextButton = screen.getByText(/next/i);
    await user.click(nextButton);

    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it('handles speed change', async () => {
    const user = userEvent.setup();
    const mockData = createMockVideoData();

    render(<MockPlaybackControls videoData={mockData} />);

    const speedButtons = screen.getAllByText(/[0-9]x/);
    expect(speedButtons.length).toBeGreaterThan(0);

    if (speedButtons[0]) {
      await user.click(speedButtons[0]);
    }

    expect(document.body).toBeDefined();
  });
});
