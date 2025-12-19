import type { VideoData, VideoTraceStep, TypeInfo } from "../../src/core/types.ts";

export function createMockVideoData(overrides?: Partial<VideoData>): VideoData {
  return {
    totalFrames: 90,
    fps: 30,
    steps: [ createMockStep({ stepIndex: 0 }) ],
    typeAliases: [ createMockTypeInfo() ],
    sourceCode: "type Test = string;",
    activeTypeMap: {},
    ...overrides,
  };
}

export function createMockStep(overrides?: Partial<VideoTraceStep>): VideoTraceStep {
  return {
    original: {
      step: 1,
      type: "type_alias_start",
      expression: "type Test = string",
      level: 0,
    },
    stepIndex: 0,
    startFrame: 0,
    duration: 30,
    endFrame: 30,
    color: "#94A3B8",
    isHighlight: true,
    ...overrides,
  };
}

export function createMockTypeInfo(overrides?: Partial<TypeInfo>): TypeInfo {
  return {
    name: "Test",
    text: "type Test = string;",
    lines: [ "type Test = string;" ],
    startLine: 0,
    endLine: 0,
    highlightedLines: [ "<span>type Test = string;</span>" ],
    ...overrides,
  };
}
