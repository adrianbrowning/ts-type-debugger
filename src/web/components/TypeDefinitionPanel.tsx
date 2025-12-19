import React from "react";
import type { TypeInfo } from "../../core/types.ts";
import { GLOBAL_THEME } from "../theme.ts";

type TypeDefinitionPanelProps = {
  activeType: TypeInfo | null;
};

/**
 * Displays the currently active type definition
 */
export const TypeDefinitionPanel: React.FC<TypeDefinitionPanelProps> = ({ activeType }) => {
  const theme = GLOBAL_THEME;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: theme.bg.secondary,
        borderRight: `1px solid ${theme.border.subtle}`,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
          borderBottom: `1px solid ${theme.border.subtle}`,
          backgroundColor: theme.bg.primary,
        }}
      >
        <h3
          style={{
            margin: 0,
            color: theme.text.primary,
            fontSize: theme.fontSize.xl,
            fontWeight: theme.fontWeight.semibold,
          }}
        >
          {"Type Definition"}
        </h3>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: theme.spacing.xl,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: activeType ? "flex-start" : "center",
        }}
      >
        {activeType ? (
          <>
            <div
              style={{
                alignSelf: "flex-start",
                width: "100%",
              }}
            >
              <h4
                style={{
                  margin: `0 0 ${theme.spacing.md} 0`,
                  color: theme.text.secondary,
                  fontSize: theme.fontSize.xs,
                  fontWeight: theme.fontWeight.semibold,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {activeType.name}
              </h4>
              <pre
                style={{
                  margin: 0,
                  padding: theme.spacing.md,
                  backgroundColor: theme.bg.editor,
                  borderRadius: theme.radius.md,
                  border: `1px solid ${theme.border.subtle}`,
                  color: theme.text.primary,
                  fontFamily: "\"Fira Code\", monospace",
                  fontSize: theme.fontSize.sm,
                  lineHeight: 1.6,
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {activeType.text}
              </pre>
            </div>
          </>
        ) : (
          <p
            style={{
              color: theme.text.secondary,
              fontSize: theme.fontSize.md,
              margin: 0,
              textAlign: "center",
            }}
          >
            {"No type selected"}
          </p>
        )}
      </div>
    </div>
  );
};
