import React from "react";
import { GLOBAL_THEME } from "../theme.ts";
import { CollapsibleSection } from "./CollapsibleSection.tsx";

type ScopeSectionProps = {
  parameters: Record<string, string>;
};

export const ScopeSection: React.FC<ScopeSectionProps> = ({ parameters }) => {
  const theme = GLOBAL_THEME;
  const entries = Object.entries(parameters);
  const count = entries.length;

  return (
    <CollapsibleSection title="Scope" badge={count}>
      {count === 0 ? (
        <div style={{ color: theme.text.secondary }}>{"No parameters in scope"}</div>
      ) : (
        <div
          role="list"
          aria-label="Scope parameters"
          style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}
        >
          {entries.map(([ name, value ]) => (
            <div
              key={name}
              role="listitem"
              style={{ color: theme.text.primary, fontFamily: "monospace" }}
            >
              {`${name} = ${value}`}
            </div>
          ))}
        </div>
      )}
    </CollapsibleSection>
  );
};
