import React, { useState, useCallback } from "react";
import type { TypeInfo } from "../../core/types.ts";
import { GLOBAL_THEME } from "../theme.ts";
import { CollapsibleSection } from "./CollapsibleSection.tsx";

type GlobalsSectionProps = {
  typeAliases: Array<TypeInfo>;
  usedTypeNames: Set<string>;
  onTypeClick?: (typeName: string) => void;
};

type TypeItemProps = {
  type: TypeInfo;
  isUsed: boolean;
  showAll: boolean;
  onTypeClick?: (typeName: string) => void;
  theme: typeof GLOBAL_THEME;
};

const TypeItem: React.FC<TypeItemProps> = ({ type, isUsed, showAll, onTypeClick, theme }) => {
  const opacity = showAll && !isUsed ? 0.5 : 1;

  const parseTypeDecl = (text: string): { name: string; value: string; } => {
    const match = /^type\s+(\w+(?:<[^>]+>)?)\s*=\s*(.+)$/s.exec(text);
    if (match) {
      return { name: match[1] ?? "", value: match[2]?.trim() ?? "" };
    }
    return { name: text, value: text };
  };

  const parsed = parseTypeDecl(type.text);

  const handleClick = useCallback(() => {
    onTypeClick?.(type.name);
  }, [ onTypeClick, type.name ]);

  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        fontFamily: "monospace",
        fontSize: theme.fontSize.sm,
        cursor: onTypeClick ? "pointer" : "default",
        opacity,
        display: "flex",
        gap: theme.spacing.sm,
        background: "none",
        border: "none",
        padding: 0,
        textAlign: "left",
        width: "100%",
      }}
    >
      <span style={{ color: theme.accent.primary, flexShrink: 0 }}>{parsed.name}</span>
      <span style={{ color: theme.text.secondary }}>{"="}</span>
      <span style={{ color: theme.text.primary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {parsed.value}
      </span>
    </button>
  );
};

export const GlobalsSection: React.FC<GlobalsSectionProps> = ({
  typeAliases,
  usedTypeNames,
  onTypeClick,
}) => {
  const theme = GLOBAL_THEME;
  const [ showAll, setShowAll ] = useState(false);

  // Filter out internal types and separate used/unused
  const filteredAliases = typeAliases.filter(t => !t.name.startsWith("__"));
  const usedTypes = filteredAliases.filter(t => usedTypeNames.has(t.name));
  const unusedTypes = filteredAliases.filter(t => !usedTypeNames.has(t.name));

  const displayedTypes = showAll ? [ ...usedTypes, ...unusedTypes ] : usedTypes;
  const badgeCount = showAll ? filteredAliases.length : usedTypes.length;
  const unusedCount = unusedTypes.length;

  const handleToggle = useCallback(() => {
    setShowAll(!showAll);
  }, [ showAll ]);

  const toggleButton = (
    <button
      type="button"
      onClick={handleToggle}
      style={{
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        backgroundColor: theme.bg.hover,
        color: theme.text.secondary,
        border: `1px solid ${theme.border.subtle}`,
        borderRadius: theme.radius.sm,
        fontSize: theme.fontSize.xs,
        cursor: "pointer",
      }}
    >
      {showAll ? "Show Used" : "Show All"}
    </button>
  );

  return (
    <CollapsibleSection
      title="Globals"
      badge={badgeCount}
      headerRight={toggleButton}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.xs }}>
        {displayedTypes.map(type => {
          const isUsed = usedTypeNames.has(type.name);
          return (
            <TypeItem
              key={type.name}
              type={type}
              isUsed={isUsed}
              showAll={showAll}
              onTypeClick={onTypeClick}
              theme={theme}
            />
          );
        })}
        {!showAll && unusedCount > 0 && (
          <>
            <hr
              style={{
                border: "none",
                borderTop: `1px solid ${theme.border.subtle}`,
                margin: `${theme.spacing.sm} 0`,
              }}
            />
            <div
              style={{
                fontSize: theme.fontSize.xs,
                color: theme.text.secondary,
              }}
            >
              {unusedCount}{" unused "}{unusedCount === 1 ? "type" : "types"} {"hidden"}
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  );
};
