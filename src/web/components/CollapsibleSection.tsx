import React, { useCallback, useState } from "react";
import { GLOBAL_THEME } from "../theme.ts";

export type CollapsibleSectionProps = {
  title: string;
  badge?: string | number;
  defaultExpanded?: boolean;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
};

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  badge,
  defaultExpanded = true,
  headerRight,
  children,
}) => {
  const theme = GLOBAL_THEME;
  const [ isExpanded, setIsExpanded ] = useState(defaultExpanded);
  const contentId = `collapsible-${title.replace(/\s+/g, "-").toLowerCase()}`;

  const toggleExpanded = useCallback(() => setIsExpanded(prev => !prev), []);

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
          backgroundColor: theme.bg.secondary,
          borderBottom: `1px solid ${theme.border.subtle}`,
        }}
      >
        <button
          type="button"
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
            cursor: "pointer",
            flex: 1,
            background: "none",
            border: "none",
            padding: 0,
            textAlign: "left",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              color: theme.text.secondary,
              fontSize: theme.fontSize.sm,
            }}
          >
            {isExpanded ? "▼" : "▶"}
          </span>
          <span
            style={{
              color: theme.text.primary,
              fontSize: theme.fontSize.md,
              fontWeight: theme.fontWeight.semibold,
            }}
          >
            {title}
          </span>
          {badge !== undefined && (
            <span
              style={{
                padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                backgroundColor: theme.bg.hover,
                color: theme.text.secondary,
                fontSize: theme.fontSize.xs,
                borderRadius: theme.radius.sm,
              }}
            >
              {badge}
            </span>
          )}
        </button>
        {headerRight && (
          <div style={{ marginLeft: theme.spacing.md }}>
            {headerRight}
          </div>
        )}
      </div>
      {isExpanded && (
        <div
          id={contentId}
          role="region"
          aria-labelledby={contentId}
          style={{
            padding: theme.spacing.md,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
