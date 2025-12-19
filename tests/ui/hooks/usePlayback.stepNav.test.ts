import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import type { VideoData } from "../../../src/core/types.ts";
import { usePlayback } from "../../../src/web/hooks/usePlayback.ts";
import { createMockVideoData, createMockStep } from "../../fixtures/mockVideoData.ts";

describe("usePlayback - step navigation", () => {
  describe("stepOver", () => {
    it("moves to next step at same level", () => {
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
            original: { step: 3, type: "generic_result", expression: "string", level: 1 },
          }),
          createMockStep({
            stepIndex: 4,
            original: { step: 4, type: "result_assignment", expression: "Result = string", level: 0 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      // Start at step 0 (level 0)
      expect(result.current.currentStepIndex).toBe(0);

      // stepOver should skip to next step at level 0 (step 4)
      act(() => {
        result.current.stepOver();
      });

      expect(result.current.currentStepIndex).toBe(4);
      expect(result.current.currentStep?.original.level).toBe(0);
    });

    it("moves to next step when already at deepest level", () => {
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({
            stepIndex: 0,
            original: { step: 0, type: "generic_def", expression: "Foo", level: 2 },
          }),
          createMockStep({
            stepIndex: 1,
            original: { step: 1, type: "condition", expression: "T extends string", level: 2 },
          }),
          createMockStep({
            stepIndex: 2,
            original: { step: 2, type: "branch_true", expression: "true", level: 2 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        result.current.stepOver();
      });

      expect(result.current.currentStepIndex).toBe(1);
    });

    it("stops at end if no steps at same level", () => {
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

      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        result.current.stepOver();
      });

      // Should stay at last step
      expect(result.current.currentStepIndex).toBe(1);
    });

    it("pauses playback when stepping", () => {
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({ stepIndex: 0, original: { step: 0, type: "type_alias_start", expression: "A", level: 0 } }),
          createMockStep({ stepIndex: 1, original: { step: 1, type: "generic_call", expression: "B", level: 1 } }),
          createMockStep({ stepIndex: 2, original: { step: 2, type: "result_assignment", expression: "C", level: 0 } }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      act(() => {
        result.current.togglePlayPause(); // Start playing
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.stepOver();
      });

      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe("stepOut", () => {
    it("exits current frame to parent level", () => {
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
            original: { step: 4, type: "branch_true", expression: "true", level: 4 },
          }),
          createMockStep({
            stepIndex: 5,
            original: { step: 5, type: "generic_result", expression: "string", level: 1 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      // Seek to step 4 (level 4)
      act(() => {
        result.current.seekToStep(4);
      });

      expect(result.current.currentStepIndex).toBe(4);
      expect(result.current.currentStep?.original.level).toBe(4);

      // stepOut from level 4 should go to next step at level < 4 (level 1, step 5)
      act(() => {
        result.current.stepOut();
      });

      expect(result.current.currentStepIndex).toBe(5);
      expect(result.current.currentStep?.original.level).toBe(1);
    });

    it("exits nested conditional to parent", () => {
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({
            stepIndex: 0,
            original: { step: 0, type: "condition", expression: "A extends B", level: 1 },
          }),
          createMockStep({
            stepIndex: 1,
            original: { step: 1, type: "branch_true", expression: "nested check", level: 2 },
          }),
          createMockStep({
            stepIndex: 2,
            original: { step: 2, type: "condition", expression: "nested condition", level: 3 },
          }),
          createMockStep({
            stepIndex: 3,
            original: { step: 3, type: "result_assignment", expression: "done", level: 0 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      // Start at step 2 (level 3)
      act(() => {
        result.current.seekToStep(2);
      });

      expect(result.current.currentStep?.original.level).toBe(3);

      // stepOut should go to level < 3 (step 3, level 0)
      act(() => {
        result.current.stepOut();
      });

      expect(result.current.currentStepIndex).toBe(3);
      expect(result.current.currentStep?.original.level).toBe(0);
    });

    it("does nothing at root level", () => {
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({
            stepIndex: 0,
            original: { step: 0, type: "type_alias_start", expression: "Result", level: 0 },
          }),
          createMockStep({
            stepIndex: 1,
            original: { step: 1, type: "result_assignment", expression: "Result = string", level: 0 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      expect(result.current.currentStepIndex).toBe(0);
      expect(result.current.currentStep?.original.level).toBe(0);

      // stepOut at level 0 should stay at last step
      act(() => {
        result.current.stepOut();
      });

      expect(result.current.currentStepIndex).toBe(1);
    });

    it("pauses playback when stepping out", () => {
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({ stepIndex: 0, original: { step: 0, type: "type_alias_start", expression: "A", level: 0 } }),
          createMockStep({ stepIndex: 1, original: { step: 1, type: "generic_call", expression: "B", level: 1 } }),
          createMockStep({ stepIndex: 2, original: { step: 2, type: "result_assignment", expression: "C", level: 0 } }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      act(() => {
        result.current.seekToStep(1);
        result.current.togglePlayPause(); // Start playing
      });

      expect(result.current.isPlaying).toBe(true);

      act(() => {
        result.current.stepOut();
      });

      expect(result.current.isPlaying).toBe(false);
    });
  });

  describe("stepInto", () => {
    it("moves to next step regardless of level", () => {
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

      expect(result.current.currentStepIndex).toBe(0);

      // stepInto should just go to next step (same as nextStep)
      act(() => {
        result.current.stepInto();
      });

      expect(result.current.currentStepIndex).toBe(1);
    });

    it("enters nested call when available", () => {
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({
            stepIndex: 0,
            original: { step: 0, type: "generic_call", expression: "Outer<T>", level: 0 },
          }),
          createMockStep({
            stepIndex: 1,
            original: { step: 1, type: "generic_def", expression: "Outer", level: 1 },
          }),
          createMockStep({
            stepIndex: 2,
            original: { step: 2, type: "generic_call", expression: "Inner<T>", level: 2 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      act(() => {
        result.current.stepInto(); // 0 -> 1
        result.current.stepInto(); // 1 -> 2
      });

      expect(result.current.currentStepIndex).toBe(2);
      expect(result.current.currentStep?.original.level).toBe(2);
    });
  });

  describe("nested generics in conditionals", () => {
    it("can step into generic in extends clause", () => {
      // Simulates trace for: T extends Validate<T> ? ... : ...
      // where Validate<T> generates generic_call, generic_def, generic_result
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({
            stepIndex: 0,
            original: { step: 0, type: "condition", expression: "T extends Validate<T>", level: 0 },
          }),
          createMockStep({
            stepIndex: 1,
            original: { step: 1, type: "conditional_evaluate_left", expression: "T", level: 1 },
          }),
          createMockStep({
            stepIndex: 2,
            original: { step: 2, type: "conditional_evaluate_right", expression: "Validate<T>", level: 1 },
          }),
          createMockStep({
            stepIndex: 3,
            original: { step: 3, type: "generic_call", expression: "Validate<T>", level: 2 },
          }),
          createMockStep({
            stepIndex: 4,
            original: { step: 4, type: "generic_def", expression: "type Validate<T> = T extends string ? true : false", level: 3 },
          }),
          createMockStep({
            stepIndex: 5,
            original: { step: 5, type: "generic_result", expression: "Validate => true", level: 2 },
          }),
          createMockStep({
            stepIndex: 6,
            original: { step: 6, type: "conditional_comparison", expression: "string extends true", level: 1 },
          }),
          createMockStep({
            stepIndex: 7,
            original: { step: 7, type: "branch_false", expression: "no", level: 0 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      // Step through to reach the generic_call inside the extends clause
      act(() => {
        result.current.stepInto(); // 0 -> 1 (conditional_evaluate_left)
        result.current.stepInto(); // 1 -> 2 (conditional_evaluate_right)
        result.current.stepInto(); // 2 -> 3 (generic_call for Validate<T>)
      });

      expect(result.current.currentStepIndex).toBe(3);
      expect(result.current.currentStep?.original.type).toBe("generic_call");
      expect(result.current.currentStep?.original.expression).toContain("Validate");
    });

    it("stepOver skips nested generic in extends clause", () => {
      const videoData: VideoData = createMockVideoData({
        steps: [
          createMockStep({
            stepIndex: 0,
            original: { step: 0, type: "conditional_evaluate_right", expression: "Validate<T>", level: 1 },
          }),
          createMockStep({
            stepIndex: 1,
            original: { step: 1, type: "generic_call", expression: "Validate<T>", level: 2 },
          }),
          createMockStep({
            stepIndex: 2,
            original: { step: 2, type: "generic_def", expression: "Validate", level: 3 },
          }),
          createMockStep({
            stepIndex: 3,
            original: { step: 3, type: "generic_result", expression: "true", level: 2 },
          }),
          createMockStep({
            stepIndex: 4,
            original: { step: 4, type: "conditional_comparison", expression: "T extends true", level: 1 },
          }),
        ],
      });

      const { result } = renderHook(() => usePlayback(videoData));

      // At step 0 (level 1), stepOver should skip the nested generic and go to step 4 (level 1)
      act(() => {
        result.current.stepOver();
      });

      expect(result.current.currentStepIndex).toBe(4);
      expect(result.current.currentStep?.original.type).toBe("conditional_comparison");
    });
  });
});
