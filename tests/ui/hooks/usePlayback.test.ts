import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayback } from '../../../src/web/hooks/usePlayback.ts';
import { createMockVideoData, createMockStep } from '../../fixtures/mockVideoData.ts';

describe('usePlayback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with step 0, not playing, speed 1', () => {
    // Arrange
    const videoData = createMockVideoData();

    // Act
    const { result } = renderHook(() => usePlayback(videoData));

    // Assert
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.speed).toBe(1);
  });

  it('returns null currentStep when no videoData provided', () => {
    // Act
    const { result } = renderHook(() => usePlayback(null));

    // Assert
    expect(result.current.currentStep).toBeNull();
    expect(result.current.currentStepIndex).toBe(0);
  });

  it('advances to next step when nextStep called', () => {
    // Arrange
    const videoData = createMockVideoData({
      steps: [
        createMockStep({ stepIndex: 0 }),
        createMockStep({ stepIndex: 1 }),
        createMockStep({ stepIndex: 2 }),
      ],
    });

    // Act
    const { result } = renderHook(() => usePlayback(videoData));
    act(() => result.current.nextStep());

    // Assert
    expect(result.current.currentStepIndex).toBe(1);
  });

  it('does not advance past last step', () => {
    // Arrange
    const videoData = createMockVideoData({
      steps: [
        createMockStep({ stepIndex: 0 }),
        createMockStep({ stepIndex: 1 }),
      ],
    });

    // Act
    const { result } = renderHook(() => usePlayback(videoData));
    act(() => result.current.nextStep());
    act(() => result.current.nextStep());
    act(() => result.current.nextStep()); // Extra call should be ignored

    // Assert
    expect(result.current.currentStepIndex).toBe(1);
  });

  it('goes back to previous step when previousStep called', () => {
    // Arrange
    const videoData = createMockVideoData({
      steps: [
        createMockStep({ stepIndex: 0 }),
        createMockStep({ stepIndex: 1 }),
      ],
    });

    // Act
    const { result } = renderHook(() => usePlayback(videoData));
    act(() => result.current.nextStep());
    act(() => result.current.previousStep());

    // Assert
    expect(result.current.currentStepIndex).toBe(0);
  });

  it('does not go below step 0', () => {
    // Arrange
    const videoData = createMockVideoData();

    // Act
    const { result } = renderHook(() => usePlayback(videoData));
    act(() => result.current.previousStep());
    act(() => result.current.previousStep()); // Extra call should be ignored

    // Assert
    expect(result.current.currentStepIndex).toBe(0);
  });

  it('toggles play state when togglePlayPause called', () => {
    // Arrange
    const videoData = createMockVideoData();

    // Act
    const { result } = renderHook(() => usePlayback(videoData));
    act(() => result.current.togglePlayPause());

    // Assert
    expect(result.current.isPlaying).toBe(true);

    // Act - toggle again
    act(() => result.current.togglePlayPause());

    // Assert
    expect(result.current.isPlaying).toBe(false);
  });

  it('changes speed when setSpeed called', () => {
    // Arrange
    const videoData = createMockVideoData();

    // Act
    const { result } = renderHook(() => usePlayback(videoData));
    act(() => result.current.setSpeed(2));

    // Assert
    expect(result.current.speed).toBe(2);
  });

  it('seeks to specific step when seekToStep called', () => {
    // Arrange
    const videoData = createMockVideoData({
      steps: [
        createMockStep({ stepIndex: 0 }),
        createMockStep({ stepIndex: 1 }),
        createMockStep({ stepIndex: 2 }),
        createMockStep({ stepIndex: 3 }),
      ],
    });

    // Act
    const { result } = renderHook(() => usePlayback(videoData));
    act(() => result.current.seekToStep(2));

    // Assert
    expect(result.current.currentStepIndex).toBe(2);
  });

  it('resets state when videoData changes', () => {
    // Arrange
    const videoData1 = createMockVideoData({
      steps: [
        createMockStep({ stepIndex: 0 }),
        createMockStep({ stepIndex: 1 }),
      ],
    });
    const videoData2 = createMockVideoData({
      steps: [
        createMockStep({ stepIndex: 0 }),
      ],
    });

    // Act
    const { result, rerender } = renderHook(
      ({ data }) => usePlayback(data),
      { initialProps: { data: videoData1 } }
    );
    act(() => result.current.nextStep());
    expect(result.current.currentStepIndex).toBe(1);

    rerender({ data: videoData2 });

    // Assert
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.speed).toBe(1);
  });

  it('returns correct currentStep based on index', () => {
    // Arrange
    const step0 = createMockStep({
      stepIndex: 0,
      original: { step: 1, type: 'type_alias_start', expression: 'Test', level: 0 },
    });
    const step1 = createMockStep({
      stepIndex: 1,
      original: { step: 2, type: 'generic_call', expression: 'Identity<string>', level: 1 },
    });
    const videoData = createMockVideoData({ steps: [step0, step1] });

    // Act
    const { result } = renderHook(() => usePlayback(videoData));

    // Assert
    expect(result.current.currentStep?.original.expression).toBe('Test');

    // Act - advance
    act(() => result.current.nextStep());

    // Assert
    expect(result.current.currentStep?.original.expression).toBe('Identity<string>');
  });

  it('stops playing when nextStep or previousStep called', () => {
    // Arrange
    const videoData = createMockVideoData({
      steps: [
        createMockStep({ stepIndex: 0 }),
        createMockStep({ stepIndex: 1 }),
      ],
    });

    // Act
    const { result } = renderHook(() => usePlayback(videoData));
    act(() => result.current.togglePlayPause());
    expect(result.current.isPlaying).toBe(true);

    act(() => result.current.nextStep());

    // Assert - should pause when manually stepping
    expect(result.current.isPlaying).toBe(false);
  });
});
