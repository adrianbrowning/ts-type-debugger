import type React from "react";
import { GLOBAL_THEME } from "../theme.ts";

type InputSectionProps = {
  typeName: string;
  onTypeNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  typeNameError: string | null;
  isLoading: boolean;
  onGenerate: () => void;
  error: string | null;
  onButtonMouseOver: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onButtonMouseOut: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

/**
 * Input section for type expression and debug button
 * Extracted from App.tsx to reduce cognitive complexity
 */
export const InputSection: React.FC<InputSectionProps> = ({
  typeName,
  onTypeNameChange,
  typeNameError,
  isLoading,
  onGenerate,
  error,
  onButtonMouseOver,
  onButtonMouseOut,
}) => {
  const theme = GLOBAL_THEME;

  // Precompute button state
  const isButtonDisabled = isLoading || !typeName.trim() || !!typeNameError;
  const buttonBgColor = isButtonDisabled ? theme.text.disabled : theme.accent.primary;
  const buttonTextColor = isButtonDisabled ? theme.text.primary : theme.accent.btnText;
  const buttonCursor = isButtonDisabled ? "not-allowed" : "pointer";
  const buttonOpacity = isButtonDisabled ? 0.6 : 1;

  return (
    <div
      style={{
        padding: theme.spacing.lg,
        backgroundColor: theme.bg.primary,
        borderBottom: `1px solid ${theme.border.subtle}`,
        display: "flex",
        flexDirection: "column",
        gap: theme.spacing.md,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: theme.spacing.md,
          alignItems: "flex-start",
        }}
      >
        <input
          type="text"
          value={typeName}
          onChange={onTypeNameChange}
          disabled={isLoading}
          placeholder='Enter type expression (e.g., _result or "a" extends string ? true : false)'
          style={{
            flex: 1,
            padding: theme.spacing.md,
            backgroundColor: theme.bg.editor,
            color: theme.text.primary,
            border: `1px solid ${typeNameError ? theme.accent.error : theme.border.subtle}`,
            borderRadius: theme.radius.md,
            fontFamily: "\"Fira Code\", monospace",
            fontSize: theme.fontSize.md,
            boxSizing: "border-box",
            opacity: isLoading ? 0.6 : 1,
            cursor: isLoading ? "not-allowed" : "text",
          }}
        />
        <button
          type="button"
          onClick={onGenerate}
          disabled={isButtonDisabled}
          style={{
            padding: `${theme.spacing.md} ${theme.spacing.lg}`,
            backgroundColor: buttonBgColor,
            color: buttonTextColor,
            border: "none",
            borderRadius: theme.radius.md,
            fontSize: theme.fontSize.md,
            fontWeight: theme.fontWeight.semibold,
            cursor: buttonCursor,
            opacity: buttonOpacity,
            transition: "background-color 0.2s ease",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
          onMouseOver={onButtonMouseOver}
          onMouseOut={onButtonMouseOut}
        >
          {isLoading ? "Debugging..." : "Debug"}
        </button>
      </div>

      {typeNameError && (
        <div
          style={{
            padding: theme.spacing.md,
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${theme.accent.error}`,
            borderRadius: theme.radius.md,
            color: theme.accent.error,
            fontSize: theme.fontSize.sm,
          }}
        >
          {typeNameError}
        </div>
      )}

      {error && (
        <div
          style={{
            padding: theme.spacing.md,
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${theme.accent.error}`,
            borderRadius: theme.radius.md,
            color: theme.accent.error,
            fontSize: theme.fontSize.sm,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};
