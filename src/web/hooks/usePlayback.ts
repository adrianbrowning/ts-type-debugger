/**
 * Hook for managing playback state and animation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { VideoData, VideoTraceStep } from '../../core/types.ts';

interface PlaybackState {
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
}

export function usePlayback(videoData: VideoData | null) {
  const [state, setState] = useState<PlaybackState>({
    currentStepIndex: 0,
    isPlaying: false,
    speed: 1,
  });

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  // Reset playback state when videoData changes
  useEffect(() => {
    setState({
      currentStepIndex: 0,
      isPlaying: false,
      speed: 1,
    });
  }, [videoData]);

  // Calculate frame progress (0-1) within current step
  const getCurrentStepFrameProgress = useCallback((): number => {
    if (!videoData || videoData.steps.length === 0) return 0;

    const currentStep = videoData.steps[state.currentStepIndex];
    if (!currentStep) return 0;

    const stepDuration = currentStep.duration;
    if (stepDuration === 0) return 1;

    // Return a value between 0 and 1
    return 0.5; // simplified - will be animated by requestAnimationFrame
  }, [videoData, state.currentStepIndex]);

  // Handle play/pause
  const togglePlayPause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  // Handle next/previous
  const nextStep = useCallback(() => {
    setState((prev) => {
      if (!videoData) return prev;
      return {
        ...prev,
        currentStepIndex: Math.min(prev.currentStepIndex + 1, videoData.steps.length - 1),
        isPlaying: false,
      };
    });
  }, [videoData]);

  const previousStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStepIndex: Math.max(prev.currentStepIndex - 1, 0),
      isPlaying: false,
    }));
  }, []);

  // Handle speed change
  const setSpeed = useCallback((speed: number) => {
    setState((prev) => ({ ...prev, speed }));
  }, []);

  // Handle seek to step
  const seekToStep = useCallback((stepIndex: number) => {
    setState((prev) => ({
      ...prev,
      currentStepIndex: Math.max(0, Math.min(stepIndex, videoData?.steps.length ?? 0)),
      isPlaying: false,
    }));
  }, [videoData]);

  // Store speed in ref to avoid stale closures
  const speedRef = useRef(state.speed);
  useEffect(() => {
    speedRef.current = state.speed;
  }, [state.speed]);

  // Animation loop
  useEffect(() => {
    if (!state.isPlaying || !videoData || videoData.steps.length === 0) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    let isCancelled = false;
    let localIndex = state.currentStepIndex;
    let accumulatedMs = 0;

    const animate = (timestamp: number) => {
      if (isCancelled) return;

      // Use performance.now() for better timing accuracy
      const deltaMs = (timestamp - lastTimeRef.current) * speedRef.current;
      accumulatedMs += deltaMs;

      // Advance through steps based on accumulated time
      while (accumulatedMs > 0 && localIndex < videoData.steps.length - 1) {
        const nextStepDuration = (videoData.steps[localIndex].duration / videoData.fps) * 1000;
        if (accumulatedMs < nextStepDuration) break;
        accumulatedMs -= nextStepDuration;
        localIndex++;
      }

      // Stop if at end
      const isAtEnd = localIndex === videoData.steps.length - 1;

      setState((prev) => ({
        ...prev,
        currentStepIndex: localIndex,
        isPlaying: isAtEnd ? false : prev.isPlaying,
      }));

      if (!isAtEnd) {
        lastTimeRef.current = timestamp;
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      isCancelled = true;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [state.isPlaying, videoData]);

  const currentStep = videoData?.steps[state.currentStepIndex] || null;

  // Helper: find next step matching level condition
  const findNextStepByLevel = useCallback(
    (levelCheck: (stepLevel: number, currentLevel: number) => boolean) => {
      if (!videoData || !currentStep) return;

      const currentLevel = currentStep.original.level;

      // Find next step matching level condition
      for (let i = state.currentStepIndex + 1; i < videoData.steps.length; i++) {
        if (levelCheck(videoData.steps[i].original.level, currentLevel)) {
          setState((prev) => ({
            ...prev,
            currentStepIndex: i,
            isPlaying: false,
          }));
          return;
        }
      }

      // No matching step found, go to last step
      setState((prev) => ({
        ...prev,
        currentStepIndex: videoData.steps.length - 1,
        isPlaying: false,
      }));
    },
    [videoData, currentStep, state.currentStepIndex]
  );

  // Step over: move to next step at same or lower level (parent or sibling)
  const stepOver = useCallback(() => {
    findNextStepByLevel((stepLevel, currentLevel) => stepLevel <= currentLevel);
  }, [findNextStepByLevel]);

  // Step out: move to next step at strictly lower level (parent)
  const stepOut = useCallback(() => {
    findNextStepByLevel((stepLevel, currentLevel) => stepLevel < currentLevel);
  }, [findNextStepByLevel]);

  // Step into: just go to next step (alias for nextStep)
  const stepInto = useCallback(() => {
    nextStep();
  }, [nextStep]);

  return {
    currentStep,
    currentStepIndex: state.currentStepIndex,
    isPlaying: state.isPlaying,
    speed: state.speed,
    frameProgress: getCurrentStepFrameProgress(),
    // Controls
    togglePlayPause,
    nextStep,
    previousStep,
    setSpeed,
    seekToStep,
    stepOver,
    stepOut,
    stepInto,
  };
}
