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
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.bg.hover;
  }, [ theme.bg.hover ]);

  const handleToggleMouseOut = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    (e.currentTarget as HTMLButtonElement).style.backgroundColor = theme.bg.secondary;
  }, [ theme.bg.secondary ]);

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
        <span
          style={{
            width: "1px",
            height: "20px",
            backgroundColor: theme.border.medium,
            marginLeft: theme.spacing.sm,
          }}
        />
        <a
          href="https://github.com/AdrianMayron/ts-type-debugger"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.text.secondary,
            transition: "color 0.2s ease",
          }}
          onMouseOver={e => {
            e.currentTarget.style.color = theme.text.primary;
          }}
          onMouseOut={e => {
            e.currentTarget.style.color = theme.text.secondary;
          }}
          title="View on GitHub"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
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
                backgroundColor: theme.bg.secondary,
                color: theme.text.primary,
                border: `1px solid ${theme.border.subtle}`,
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
