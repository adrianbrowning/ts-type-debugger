import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import type { VideoData } from "../../../src/core/types.ts";
import { usePlayback } from "../../../src/web/hooks/usePlayback.ts";
import { createMockVideoData, createMockStep } from "../../fixtures/mockVideoData.ts";

describe("usePlayback - previousStep level-aware navigation", () => {
  describe("previousStep (backward step over behavior)", () => {
    it("back from nested stays at same level", () => {
      // Setup: steps at levels [0, 1, 2, 2, 1]
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({
            stepIndex: 0,
            original: { step: 0, type: "type_alias_start", expression: "Result", level: 0 },
          }),
          createMockStep({
            stepIndex: 1,
            original: { step: 1, type: "generic_call", expression: "Foo<T>", level: 1 },
          }),
          createMockStep({
            stepIndex: 2,
            original: { step: 2, type: "generic_def", expression: "Foo", level: 2 },
          }),
          createMockStep({
            stepIndex: 3,
            original: { step: 3, type: "condition", expression: "T extends string", level: 2 },
          }),
          createMockStep({
            stepIndex: 4,
            original: { step: 4, type: "generic_result", expression: "string", level: 1 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      // Start at step 3 (level 2)
      act(() => {
        result.current.seekToStep(3);
      });

      expect(result.current.currentStepIndex).toBe(3);
      expect(result.current.currentStep?.original.level).toBe(2);

      // previousStep should go to step 2 (level 2 <= 2 ✓)
      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStepIndex).toBe(2);
      expect(result.current.currentStep?.original.level).toBe(2);
    });

    it("back from nested skips deeper levels", () => {
      // Setup: steps at levels [0, 1, 2, 3, 1]
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({
            stepIndex: 0,
            original: { step: 0, type: "type_alias_start", expression: "Result", level: 0 },
          }),
          createMockStep({
            stepIndex: 1,
            original: { step: 1, type: "generic_call", expression: "Foo<T>", level: 1 },
          }),
          createMockStep({
            stepIndex: 2,
            original: { step: 2, type: "generic_def", expression: "Foo", level: 2 },
          }),
          createMockStep({
            stepIndex: 3,
            original: { step: 3, type: "condition", expression: "T extends string", level: 3 },
          }),
          createMockStep({
            stepIndex: 4,
            original: { step: 4, type: "generic_result", expression: "string", level: 1 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      // Start at step 4 (level 1)
      act(() => {
        result.current.seekToStep(4);
      });

      expect(result.current.currentStepIndex).toBe(4);
      expect(result.current.currentStep?.original.level).toBe(1);

      // previousStep should skip indices 2,3 (deeper) and go to step 1 (level 1 <= 1 ✓)
      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStepIndex).toBe(1);
      expect(result.current.currentStep?.original.level).toBe(1);
    });

    it("back at first step stays at 0", () => {
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({
            stepIndex: 0,
            original: { step: 0, type: "type_alias_start", expression: "Result", level: 0 },
          }),
          createMockStep({
            stepIndex: 1,
            original: { step: 1, type: "generic_call", expression: "Foo<T>", level: 1 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      // Start at step 0
      expect(result.current.currentStepIndex).toBe(0);

      // previousStep at step 0 should stay at 0
      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStepIndex).toBe(0);
    });

    it("back finds shallower level when no same level exists", () => {
      // Setup: steps at levels [0, 2, 3, 3]
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({
            stepIndex: 0,
            original: { step: 0, type: "type_alias_start", expression: "Result", level: 0 },
          }),
          createMockStep({
            stepIndex: 1,
            original: { step: 1, type: "generic_def", expression: "Foo", level: 2 },
          }),
          createMockStep({
            stepIndex: 2,
            original: { step: 2, type: "condition", expression: "T extends string", level: 3 },
          }),
          createMockStep({
            stepIndex: 3,
            original: { step: 3, type: "branch_true", expression: "yes", level: 3 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      // Start at step 3 (level 3)
      act(() => {
        result.current.seekToStep(3);
      });

      expect(result.current.currentStepIndex).toBe(3);
      expect(result.current.currentStep?.original.level).toBe(3);

      // previousStep should go to step 2 (level 3 <= 3 ✓)
      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStepIndex).toBe(2);
      expect(result.current.currentStep?.original.level).toBe(3);
    });

    it("back from level 0 goes to previous level 0", () => {
      // Setup: steps at levels [0, 1, 1, 0]
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({
            stepIndex: 0,
            original: { step: 0, type: "type_alias_start", expression: "Result", level: 0 },
          }),
          createMockStep({
            stepIndex: 1,
            original: { step: 1, type: "generic_call", expression: "Foo<T>", level: 1 },
          }),
          createMockStep({
            stepIndex: 2,
            original: { step: 2, type: "generic_def", expression: "Foo", level: 1 },
          }),
          createMockStep({
            stepIndex: 3,
            original: { step: 3, type: "result_assignment", expression: "Result = string", level: 0 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      // Start at step 3 (level 0)
      act(() => {
        result.current.seekToStep(3);
      });

      expect(result.current.currentStepIndex).toBe(3);
      expect(result.current.currentStep?.original.level).toBe(0);

      // previousStep should skip steps 1,2 (deeper) and go to step 0 (level 0 <= 0 ✓)
      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.currentStep?.original.level).toBe(0);
    });

    it("pauses playback when stepping backward", () => {
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({ stepIndex: 0, original: { step: 0, type: "type_alias_start", expression: "A", level: 0 } }),
          createMockStep({ stepIndex: 1, original: { step: 1, type: "generic_call", expression: "B", level: 1 } }),
          createMockStep({ stepIndex: 2, original: { step: 2, type: "result_assignment", expression: "C", level: 0 } }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      act(() => {
        result.current.seekToStep(2);
        result.current.togglePlayPause(); // Start playing
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.previousStep();
      });

      expect(result.current.isPlaying).toBe(false);
    });

    it("back through complex nesting hierarchy", () => {
      // Setup: simulate real trace levels [0, 0, 1, 2, 1, 1, 0]
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({
            stepIndex: 0,
            original: { step: 0, type: "type_alias_start", expression: "__EvalTarget__", level: 0 },
          }),
          createMockStep({
            stepIndex: 1,
            original: { step: 1, type: "generic_call", expression: "Foo<'hello'>", level: 0 },
          }),
          createMockStep({
            stepIndex: 2,
            original: { step: 2, type: "generic_def", expression: "type Foo<T>...", level: 1 },
          }),
          createMockStep({
            stepIndex: 3,
            original: { step: 3, type: "condition", expression: "T extends string", level: 2 },
          }),
          createMockStep({
            stepIndex: 4,
            original: { step: 4, type: "branch_true", expression: "yes", level: 1 },
          }),
          createMockStep({
            stepIndex: 5,
            original: { step: 5, type: "template_result", expression: "'hello'", level: 1 },
          }),
          createMockStep({
            stepIndex: 6,
            original: { step: 6, type: "generic_result", expression: "Foo => HELLO", level: 0 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      // Start at step 6 (level 0)
      act(() => {
        result.current.seekToStep(6);
      });

      expect(result.current.currentStepIndex).toBe(6);
      expect(result.current.currentStep?.original.level).toBe(0);

      // previousStep should skip all deeper levels and go to step 1 (level 0)
      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStepIndex).toBe(1);
      expect(result.current.currentStep?.original.level).toBe(0);

      // Another previousStep should go to step 0 (level 0)
      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.currentStep?.original.level).toBe(0);
    });

    it("back from middle of nested block finds previous same-level step", () => {
      // Setup: [0, 1, 2, 2, 2, 1, 0]
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({
            stepIndex: 0,
            original: { step: 0, type: "type_alias_start", expression: "Start", level: 0 },
          }),
          createMockStep({
            stepIndex: 1,
            original: { step: 1, type: "generic_call", expression: "First", level: 1 },
          }),
          createMockStep({
            stepIndex: 2,
            original: { step: 2, type: "condition", expression: "A", level: 2 },
          }),
          createMockStep({
            stepIndex: 3,
            original: { step: 3, type: "branch_true", expression: "B", level: 2 },
          }),
          createMockStep({
            stepIndex: 4,
            original: { step: 4, type: "result_assignment", expression: "C", level: 2 },
          }),
          createMockStep({
            stepIndex: 5,
            original: { step: 5, type: "generic_result", expression: "Done", level: 1 },
          }),
          createMockStep({
            stepIndex: 6,
            original: { step: 6, type: "type_alias_result", expression: "Final", level: 0 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      // Start at step 4 (level 2)
      act(() => {
        result.current.seekToStep(4);
      });

      expect(result.current.currentStepIndex).toBe(4);

      // Back to step 3 (level 2)
      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStepIndex).toBe(3);
      expect(result.current.currentStep?.original.level).toBe(2);

      // Back to step 2 (level 2)
      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStepIndex).toBe(2);
      expect(result.current.currentStep?.original.level).toBe(2);

      // Back from level 2 to level 1 (step 1)
      act(() => {
        result.current.previousStep();
      });

      expect(result.current.currentStepIndex).toBe(1);
      expect(result.current.currentStep?.original.level).toBe(1);
    });
  });
});
