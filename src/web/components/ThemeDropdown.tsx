import React, { useState, useCallback, useRef, useEffect } from "react";
import type { ThemeMode } from "../hooks/ThemeContext.ts";
import { useTheme } from "../hooks/useThemeHook.ts";

type ThemeDropdownProps = {
  className?: string;
};

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

export const ThemeDropdown: React.FC<ThemeDropdownProps> = ({ className = "" }) => {
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

  const selectMode = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
    setIsOpen(false);
  }, [ setMode ]);

  const currentIcon = getIconForMode(mode, isDark);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        className="landing-theme-btn flex items-center justify-center w-9 h-9 rounded-lg transition-colors text-lg"
        aria-label="Theme settings"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {currentIcon}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="landing-theme-menu absolute right-0 top-full mt-2 w-36 rounded-lg shadow-lg overflow-hidden z-50">
          {THEME_OPTIONS.map(option => (
            <button
              key={option.mode}
              type="button"
              onClick={() => selectMode(option.mode)}
              className={`landing-theme-option w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors ${
                mode === option.mode ? "selected" : ""
              }`}
            >
              <span className="text-base">{option.icon}</span>
              <span>{option.label}</span>
              {mode === option.mode && (
                <span className="landing-theme-check ml-auto">{"✓"}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
