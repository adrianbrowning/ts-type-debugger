import React, { useCallback } from "react";
import type { VideoData } from "../../core/types.ts";
import { GLOBAL_THEME } from "../theme.ts";
import { exportJSON } from "../utils/exportData.ts";
import { ThemeDropdownInline } from "./ThemeDropdownInline.tsx";

type HeaderProps = {
  onToggleEditor: () => void;
  editorVisible: boolean;
  hasGenerated: boolean;
  videoData: VideoData | null;
  onBackToLanding?: () => void;
};

/**
 * Header with title and Hide/Show Editor button
 */
export const Header: React.FC<HeaderProps> = ({ onToggleEditor, editorVisible, hasGenerated, videoData, onBackToLanding }) => {
  const theme = GLOBAL_THEME;

  const handleExport = useCallback(() => {
    if (videoData) {
      exportJSON(videoData);
    }
  }, [ videoData ]);

  const handleExportMouseOver = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.bg.hover;
  }, [ theme.bg.hover ]);

  const handleExportMouseOut = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.bg.secondary;
  }, [ theme.bg.secondary ]);

  const handleToggleMouseOver = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.accent.primaryAlt;
  }, [ theme.accent.primaryAlt ]);

  const handleToggleMouseOut = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.accent.primary;
  }, [ theme.accent.primary ]);

  const handleBackMouseOver = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = theme.bg.hover;
    e.currentTarget.style.color = theme.text.primary;
  }, [ theme.bg.hover, theme.text.primary ]);

  const handleBackMouseOut = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.backgroundColor = "transparent";
    e.currentTarget.style.color = theme.text.secondary;
  }, [ theme.text.secondary ]);

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${theme.spacing.lg} ${theme.spacing.xxl}`,
        backgroundColor: theme.bg.primary,
        borderBottom: `1px solid ${theme.border.subtle}`,
        height: "64px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.md }}>
        {onBackToLanding && (
          <button
            type="button"
            onClick={onBackToLanding}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: "transparent",
              color: theme.text.secondary,
              border: `1px solid ${theme.border.subtle}`,
              borderRadius: theme.radius.md,
              fontSize: theme.fontSize.sm,
              cursor: "pointer",
              transition: "background-color 0.2s ease, color 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: theme.spacing.xs,
            }}
            onMouseOver={handleBackMouseOver}
            onMouseOut={handleBackMouseOut}
          >
            {"← Back"}
          </button>
        )}
        <h1
          style={{
            margin: 0,
            color: theme.text.primary,
            fontSize: theme.fontSize["3xl"],
            fontWeight: theme.fontWeight.bold,
            letterSpacing: "-0.5px",
          }}
        >
          {"TS Type Debugger"}
        </h1>
      </div>

      <div style={{ display: "flex", gap: theme.spacing.md, alignItems: "center" }}>
        <ThemeDropdownInline />

        {hasGenerated && (
          <>
            <button
              type="button"
              onClick={handleExport}
              style={{
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                backgroundColor: theme.bg.secondary,
                color: theme.text.primary,
                border: `1px solid ${theme.border.subtle}`,
                borderRadius: theme.radius.md,
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.semibold,
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              onMouseOver={handleExportMouseOver}
              onMouseOut={handleExportMouseOut}
            >
              {"Export JSON"}
            </button>
            <button
              type="button"
              onClick={onToggleEditor}
              style={{
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                backgroundColor: theme.accent.primary,
                color: theme.accent.btnText,
                border: "none",
                borderRadius: theme.radius.md,
                fontSize: theme.fontSize.md,
                fontWeight: theme.fontWeight.semibold,
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              onMouseOver={handleToggleMouseOver}
              onMouseOut={handleToggleMouseOut}
            >
              {editorVisible ? "Hide Editor" : "Show Editor"}
            </button>
          </>
        )}
      </div>
    </header>
  );
};
