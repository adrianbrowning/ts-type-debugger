import React from "react";
import type { TraceEntry } from "../../astGenerator.ts";
import { GLOBAL_THEME } from "../theme.ts";
import { CollapsibleSection } from "./CollapsibleSection.tsx";
import { InfoRow } from "./InfoRow.tsx";

export type InferPatternSectionProps = {
  stepType: TraceEntry["type"];
  expression: string;
  result?: string;
};

const INFER_TYPES = new Set([
  "infer_pattern_start",
  "infer_pattern_match",
  "infer_binding",
  "infer_pattern_result",
]);

export const InferPatternSection: React.FC<InferPatternSectionProps> = ({
  stepType,
  expression,
  result,
}) => {
  const theme = GLOBAL_THEME;

  if (!INFER_TYPES.has(stepType)) {
    return null;
  }

  const getTitle = () => {
    switch (stepType) {
      case "infer_pattern_start":
        return "Pattern Matching";
      case "infer_pattern_match":
        return "Pattern Match";
      case "infer_binding":
        return "Infer Binding";
      case "infer_pattern_result":
        return "Pattern Result";
      default:
        return "Infer";
    }
  };

  const getBadge = () => {
    if (stepType === "infer_pattern_match") {
      return result === "true" ? "✓" : "✗";
    }
    return undefined;
  };

  const renderContent = () => {
    switch (stepType) {
      case "infer_pattern_start":
      // Expression is "Pattern: ${infer Head}.${infer Tail}"
      {

        const patternMatch = /^Pattern:\s*(.+)$/.exec(expression);
        const pattern = patternMatch ? patternMatch[1] ?? "" : expression;
        return <InfoRow
          label="Pattern"
          value={pattern}
          monospace
        />; }

      case "infer_pattern_match":
      // Expression is "value matches pattern" or "value does not match pattern"
      { const isMatch = result === "true";
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
            <InfoRow
              label="Check"
              value={expression}
              monospace
            />
            <div>
              <span style={{ color: theme.text.secondary }}>{"Status: "}</span>
              <span
                style={{
                  color: isMatch ? theme.accent.success : theme.accent.error,
                  fontWeight: theme.fontWeight.semibold,
                }}
              >
                {isMatch ? "Matched" : "No Match"}
              </span>
            </div>
          </div>
        ); }

      case "infer_binding":
      // Expression is "Head = \"foo\"" or similar
      { const bindingMatch = /^(\w+)\s*=\s*(.+)$/.exec(expression);
        if (bindingMatch) {
          return (
            <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
              <InfoRow
                label="Variable"
                value={bindingMatch[1] ?? ""}
                monospace
              />
              <InfoRow
                label="Value"
                value={result || (bindingMatch[2] ?? "")}
                monospace
              />
            </div>
          );
        }
        return <InfoRow
          label="Binding"
          value={expression}
          monospace
        />; }

      case "infer_pattern_result":
        return <InfoRow
          label="Result"
          value={result || expression}
          monospace
        />;

      default:
        return <InfoRow
          label="Expression"
          value={expression}
          monospace
        />;
    }
  };

  const badge = getBadge();

  return (
    <CollapsibleSection
      title={getTitle()}
      badge={badge}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
        {renderContent()}
      </div>
    </CollapsibleSection>
  );
};
