import React from "react";
import { GLOBAL_THEME } from "../theme.ts";

export type InfoRowProps = {
  label: string;
  value: string;
  monospace?: boolean;
  separator?: string;
};

export const InfoRow: React.FC<InfoRowProps> = ({
  label,
  value,
  monospace = false,
  separator = ": ",
}) => {
  const theme = GLOBAL_THEME;

  return (
    <div>
      <span style={{ color: theme.text.secondary }}>{label}{separator}</span>
      <span style={{
        fontFamily: monospace ? "monospace" : undefined,
        color: theme.text.primary,
      }}
      >
        {value}
      </span>
    </div>
  );
};
