import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaybackControls } from '../../../src/web/components/PlaybackControls.tsx';
import { createMockVideoData, createMockStep } from '../../fixtures/mockVideoData.ts';

describe('PlaybackControls', () => {
  const defaultProps = {
    videoData: null,
    currentStepIndex: 0,
    isPlaying: false,
    speed: 1,
    onTogglePlayPause: vi.fn(),
    onNextStep: vi.fn(),
    onPreviousStep: vi.fn(),
    onSetSpeed: vi.fn(),
    onSeekToStep: vi.fn(),
  };

  it('shows empty state message when videoData is null', () => {
    // Act
    render(<PlaybackControls {...defaultProps} videoData={null} />);

    // Assert
    expect(screen.getByText(/generate video data/i)).toBeDefined();
  });

  it('shows play button when not playing', () => {
    // Arrange
    const videoData = createMockVideoData();

    // Act
    render(<PlaybackControls {...defaultProps} videoData={videoData} isPlaying={false} />);

    // Assert
    expect(screen.getByText(/play/i)).toBeDefined();
  });

  it('shows pause button when playing', () => {
    // Arrange
    const videoData = createMockVideoData();

    // Act
    render(<PlaybackControls {...defaultProps} videoData={videoData} isPlaying={true} />);

    // Assert
    expect(screen.getByText(/pause/i)).toBeDefined();
  });

  it('calls onTogglePlayPause when play button clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const onTogglePlayPause = vi.fn();
    const videoData = createMockVideoData();

    // Act
    render(
      <PlaybackControls
        {...defaultProps}
        videoData={videoData}
        onTogglePlayPause={onTogglePlayPause}
      />
    );
    await user.click(screen.getByText(/play/i));

    // Assert
    expect(onTogglePlayPause).toHaveBeenCalledTimes(1);
  });

  it('calls onNextStep when Next button clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const onNextStep = vi.fn();
    const videoData = createMockVideoData({
      steps: [createMockStep({ stepIndex: 0 }), createMockStep({ stepIndex: 1 })],
    });

    // Act
    render(
      <PlaybackControls
        {...defaultProps}
        videoData={videoData}
        currentStepIndex={0}
        onNextStep={onNextStep}
      />
    );
    await user.click(screen.getByText(/next/i));

    // Assert
    expect(onNextStep).toHaveBeenCalledTimes(1);
  });

  it('calls onPreviousStep when Prev button clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const onPreviousStep = vi.fn();
    const videoData = createMockVideoData({
      steps: [createMockStep({ stepIndex: 0 }), createMockStep({ stepIndex: 1 })],
    });

    // Act
    render(
      <PlaybackControls
        {...defaultProps}
        videoData={videoData}
        currentStepIndex={1}
        onPreviousStep={onPreviousStep}
      />
    );
    await user.click(screen.getByText(/prev/i));

    // Assert
    expect(onPreviousStep).toHaveBeenCalledTimes(1);
  });

  it('disables Prev button when at step 0', () => {
    // Arrange
    const videoData = createMockVideoData();

    // Act
    render(
      <PlaybackControls {...defaultProps} videoData={videoData} currentStepIndex={0} />
    );

    // Assert
    const prevButton = screen.getByText(/prev/i);
    expect(prevButton).toHaveProperty('disabled', true);
  });

  it('disables Next button when at last step', () => {
    // Arrange
    const videoData = createMockVideoData({
      steps: [createMockStep({ stepIndex: 0 }), createMockStep({ stepIndex: 1 })],
    });

    // Act
    render(
      <PlaybackControls {...defaultProps} videoData={videoData} currentStepIndex={1} />
    );

    // Assert
    const nextButton = screen.getByText(/next/i);
    expect(nextButton).toHaveProperty('disabled', true);
  });

  it('displays correct step indicator', () => {
    // Arrange
    const videoData = createMockVideoData({
      steps: [
        createMockStep({ stepIndex: 0 }),
        createMockStep({ stepIndex: 1 }),
        createMockStep({ stepIndex: 2 }),
      ],
    });

    // Act
    render(
      <PlaybackControls {...defaultProps} videoData={videoData} currentStepIndex={1} />
    );

    // Assert
    expect(screen.getByText('Step 2 / 3')).toBeDefined();
  });

  it('calls onSetSpeed when speed button clicked', async () => {
    // Arrange
    const user = userEvent.setup();
    const onSetSpeed = vi.fn();
    const videoData = createMockVideoData();

    // Act
    render(
      <PlaybackControls
        {...defaultProps}
        videoData={videoData}
        speed={1}
        onSetSpeed={onSetSpeed}
      />
    );
    await user.click(screen.getByText('2x'));

    // Assert
    expect(onSetSpeed).toHaveBeenCalledWith(2);
  });

  it('calls onSeekToStep when timeline slider changed', () => {
    // Arrange
    const onSeekToStep = vi.fn();
    const videoData = createMockVideoData({
      steps: [
        createMockStep({ stepIndex: 0 }),
        createMockStep({ stepIndex: 1 }),
        createMockStep({ stepIndex: 2 }),
      ],
    });

    // Act
    render(
      <PlaybackControls
        {...defaultProps}
        videoData={videoData}
        currentStepIndex={0}
        onSeekToStep={onSeekToStep}
      />
    );
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '2' } });

    // Assert
    expect(onSeekToStep).toHaveBeenCalledWith(2);
  });

  it('highlights active speed button', () => {
    // Arrange
    const videoData = createMockVideoData();

    // Act
    render(<PlaybackControls {...defaultProps} videoData={videoData} speed={1.5} />);

    // Assert - the 1.5x button should have bold styling (fontWeight 600)
    const speedButton = screen.getByText('1.5x');
    expect(speedButton.style.fontWeight).toBe('600');
  });
});
