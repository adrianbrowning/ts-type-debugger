import React, { useState, useCallback, useRef, useEffect } from "react";
import type { ThemeMode } from "../hooks/ThemeContext.ts";
import { useTheme } from "../hooks/useThemeHook.ts";
import { GLOBAL_THEME } from "../theme.ts";

const THEME_OPTIONS: Array<{ mode: ThemeMode; label: string; icon: string }> = [
  { mode: "system", label: "Auto", icon: "💻" },
  { mode: "light", label: "Light", icon: "☀️" },
  { mode: "dark", label: "Dark", icon: "🌙" },
];

const getIconForMode = (mode: ThemeMode, isDark: boolean): string => {
  if (mode === "system") {
    return isDark ? "🌙" : "☀️";
  }
  return mode === "dark" ? "🌙" : "☀️";
};

export const ThemeDropdownInline: React.FC = () => {
  const theme = GLOBAL_THEME;
  const { mode, setMode, isDark } = useTheme();
  const [ isOpen, setIsOpen ] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ isOpen ]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [ isOpen ]);

  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleSelectMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    setIsOpen(false);
  }, [ setMode ]);

  const currentIcon = getIconForMode(mode, isDark);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: theme.radius.md,
          border: `1px solid ${theme.border.subtle}`,
          backgroundColor: theme.bg.secondary,
          cursor: "pointer",
          fontSize: "18px",
          transition: "background-color 0.15s ease",
        }}
        aria-label="Theme settings"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {currentIcon}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "100%",
            marginTop: "8px",
            width: "140px",
            borderRadius: theme.radius.md,
            border: `1px solid ${theme.border.subtle}`,
            backgroundColor: theme.bg.secondary,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
            overflow: "hidden",
            zIndex: 50,
          }}
        >
          {THEME_OPTIONS.map(option => (
            <ThemeOption
              key={option.mode}
              option={option}
              isSelected={mode === option.mode}
              onSelect={handleSelectMode}
            />
          ))}
        </div>
      )}
    </div>
  );
};

type ThemeOptionProps = {
  option: { mode: ThemeMode; label: string; icon: string };
  isSelected: boolean;
  onSelect: (mode: ThemeMode) => void;
};

const ThemeOption: React.FC<ThemeOptionProps> = ({ option, isSelected, onSelect }) => {
  const theme = GLOBAL_THEME;

  const handleClick = useCallback(() => {
    onSelect(option.mode);
  }, [ option.mode, onSelect ]);

  const handleMouseOver = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isSelected) {
      e.currentTarget.style.backgroundColor = theme.bg.hover;
    }
  }, [ isSelected, theme.bg.hover ]);

  const handleMouseOut = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isSelected) {
      e.currentTarget.style.backgroundColor = "transparent";
    }
  }, [ isSelected ]);

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 12px",
        border: "none",
        backgroundColor: isSelected ? theme.accent.primary + "33" : "transparent",
        color: isSelected ? theme.accent.highlight : theme.text.primary,
        fontSize: theme.fontSize.sm,
        textAlign: "left",
        cursor: "pointer",
        transition: "background-color 0.15s ease",
      }}
    >
      <span style={{ fontSize: "16px" }}>{option.icon}</span>
      <span>{option.label}</span>
      {isSelected && (
        <span style={{ marginLeft: "auto", color: theme.accent.primary }}>{"✓"}</span>
      )}
    </button>
  );
};
