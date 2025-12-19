import type { VideoData } from "../../core/types.ts";

/**
 * Trigger browser download of a file
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([ content ], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Export video data as JSON
 * Includes all trace steps with union stepping data
 */
export const exportJSON = (videoData: VideoData): void => {
  // Convert Map to object for JSON serialization
  const exportData = {
    ...videoData,
    activeTypeMap: videoData.activeTypeMap instanceof Map
      ? Object.fromEntries(videoData.activeTypeMap)
      : videoData.activeTypeMap,
  };

  const json = JSON.stringify(exportData, null, 2);
  const timestamp = new Date().toISOString()
    .slice(0, 19)
    .replace(/[:-]/g, "");
  downloadFile(json, `trace-data-${timestamp}.json`, "application/json");
};
