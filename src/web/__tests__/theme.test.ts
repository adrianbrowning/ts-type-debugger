import { describe, it, expect } from 'vitest';
import { createTheme } from '../theme.ts';

/**
 * Theme Regression Tests
 *
 * Prevents three critical theme-switching bugs:
 * 1. CSS variable race condition - cssVar() returns references, not computed values
 * 2. parseInt on CSS vars - raw numeric values available for JS calculations
 * 3. Button contrast - accent.btnText available for dark text on bright backgrounds
 */

describe('Theme CSS Variable References', () => {
  it('returns CSS variable reference strings to prevent race conditions', () => {
    // Arrange & Act
    const theme = createTheme();

    // Assert - cssVar() should return 'var(--name)' format, not computed values
    // This prevents reading DOM values before theme class is applied
    expect(theme.bg.primary).toBe('var(--bg)');
    expect(theme.bg.secondary).toBe('var(--bg-secondary)');
    expect(theme.text.primary).toBe('var(--text-primary)');
    expect(theme.accent.primary).toBe('var(--accent-primary)');
    expect(theme.border.subtle).toBe('var(--border-subtle)');
  });

  it('returns CSS variable references for all color properties', () => {
    // Arrange & Act
    const theme = createTheme();

    // Assert - verify all color properties use CSS var references
    const allColorProps = [
      theme.bg.primary,
      theme.bg.secondary,
      theme.bg.editor,
      theme.bg.active,
      theme.bg.hover,
      theme.text.primary,
      theme.text.secondary,
      theme.text.tertiary,
      theme.text.disabled,
      theme.accent.primary,
      theme.accent.primaryAlt,
      theme.accent.highlight,
      theme.accent.warning,
      theme.accent.success,
      theme.accent.error,
      theme.accent.btnText,
    ];

    allColorProps.forEach((colorProp) => {
      expect(colorProp).toMatch(/^var\(--[\w-]+\)$/);
    });
  });
});

describe('Theme Raw Numeric Values', () => {
  it('provides numeric font size for JavaScript calculations', () => {
    // Arrange & Act
    const theme = createTheme();

    // Assert - should be number, not string or NaN
    // This allows parseInt(), math operations without parsing 'var(--font-size-md)'
    expect(theme.raw.fontSizeMd).toBe(14);
    expect(typeof theme.raw.fontSizeMd).toBe('number');
    expect(Number.isNaN(theme.raw.fontSizeMd)).toBe(false);
  });

  it('provides numeric line height for JavaScript calculations', () => {
    // Arrange & Act
    const theme = createTheme();

    // Assert - should be number, not string or NaN
    expect(theme.raw.lineHeight).toBe(1.6);
    expect(typeof theme.raw.lineHeight).toBe('number');
    expect(Number.isNaN(theme.raw.lineHeight)).toBe(false);
  });

  it('allows mathematical operations on raw values', () => {
    // Arrange
    const theme = createTheme();

    // Act - perform calculations that would fail with CSS var strings
    const calculatedFontSize = theme.raw.fontSizeMd * 1.5;
    const calculatedLineHeight = theme.raw.lineHeight * 2;

    // Assert - calculations should work
    expect(calculatedFontSize).toBe(21);
    expect(calculatedLineHeight).toBe(3.2);
  });
});

describe('Theme Button Contrast', () => {
  it('includes btnText color for proper button contrast', () => {
    // Arrange & Act
    const theme = createTheme();

    // Assert - btnText should exist for dark text on bright backgrounds
    expect(theme.accent.btnText).toBeDefined();
    expect(theme.accent.btnText).toBe('var(--btn-accent-text)');
    expect(typeof theme.accent.btnText).toBe('string');
  });

  it('provides all required accent colors for UI elements', () => {
    // Arrange & Act
    const theme = createTheme();

    // Assert - verify complete accent color palette
    const requiredAccentColors = [
      'primary',
      'primaryAlt',
      'highlight',
      'warning',
      'success',
      'error',
      'btnText',
    ];

    requiredAccentColors.forEach((colorKey) => {
      expect(theme.accent).toHaveProperty(colorKey);
      expect(typeof theme.accent[colorKey as keyof typeof theme.accent]).toBe('string');
    });
  });
});
