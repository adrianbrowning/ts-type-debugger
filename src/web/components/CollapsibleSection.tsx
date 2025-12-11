import React, { useState } from 'react';
import { THEME } from '../theme.ts';

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
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const contentId = `collapsible-${title.replace(/\s+/g, '-').toLowerCase()}`;

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `${THEME.spacing.sm} ${THEME.spacing.md}`,
          backgroundColor: THEME.bg.secondary,
          borderBottom: `1px solid ${THEME.border.subtle}`,
        }}
      >
        <button
          onClick={toggleExpanded}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: THEME.spacing.sm,
            cursor: 'pointer',
            flex: 1,
            background: 'none',
            border: 'none',
            padding: 0,
            textAlign: 'left',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              color: THEME.text.secondary,
              fontSize: THEME.fontSize.sm,
            }}
          >
            {isExpanded ? '▼' : '▶'}
          </span>
          <span
            style={{
              color: THEME.text.primary,
              fontSize: THEME.fontSize.md,
              fontWeight: THEME.fontWeight.semibold,
            }}
          >
            {title}
          </span>
          {badge !== undefined && (
            <span
              style={{
                padding: `${THEME.spacing.xs} ${THEME.spacing.sm}`,
                backgroundColor: THEME.bg.hover,
                color: THEME.text.secondary,
                fontSize: THEME.fontSize.xs,
                borderRadius: THEME.radius.sm,
              }}
            >
              {badge}
            </span>
          )}
        </button>
        {headerRight && (
          <div style={{ marginLeft: THEME.spacing.md }}>
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
            padding: THEME.spacing.md,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};
