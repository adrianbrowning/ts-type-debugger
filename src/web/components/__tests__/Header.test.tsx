/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ThemeProvider } from "../../hooks/useTheme.tsx";
import { Header } from "../Header.tsx";

/**
 * Header Component Tests
 *
 * Tests for Header navigation and actions
 */

const renderWithTheme = (component: React.ReactElement) => render(<ThemeProvider>{component}</ThemeProvider>);

// Mock matchMedia for jsdom
beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe("Header - Launch Debugger Button", () => {
  it("renders 'Launch Debugger' button when on landing page (no onBackToLanding)", async () => {
    // Arrange - Landing view (no back button callback)
    const onLaunchDebugger = vi.fn();
    const onToggleEditor = vi.fn();

    // Act
    renderWithTheme(
      <Header
        onToggleEditor={onToggleEditor}
        editorVisible={false}
        hasGenerated={false}
        videoData={null}
        onLaunchDebugger={onLaunchDebugger}
      />
    );

    // Assert - button should be visible
    const launchButton = screen.getByRole("button", { name: /launch debugger/i });
    expect(launchButton).toBeInTheDocument();
  });

  it("calls onLaunchDebugger when 'Launch Debugger' button is clicked", async () => {
    // Arrange
    const onLaunchDebugger = vi.fn();
    const onToggleEditor = vi.fn();
    const user = userEvent.setup();

    renderWithTheme(
      <Header
        onToggleEditor={onToggleEditor}
        editorVisible={false}
        hasGenerated={false}
        videoData={null}
        onLaunchDebugger={onLaunchDebugger}
      />
    );

    // Act - click the button
    const launchButton = screen.getByRole("button", { name: /launch debugger/i });
    await user.click(launchButton);

    // Assert - callback should be called
    expect(onLaunchDebugger).toHaveBeenCalledTimes(1);
  });

  it("does not render 'Launch Debugger' button when on debugger view (onBackToLanding provided)", () => {
    // Arrange - Debugger view (back button callback provided)
    const onBackToLanding = vi.fn();
    const onToggleEditor = vi.fn();

    // Act
    renderWithTheme(
      <Header
        onToggleEditor={onToggleEditor}
        editorVisible={false}
        hasGenerated={false}
        videoData={null}
        onBackToLanding={onBackToLanding}
      />
    );

    // Assert - Launch Debugger button should NOT exist
    const launchButton = screen.queryByRole("button", { name: /launch debugger/i });
    expect(launchButton).not.toBeInTheDocument();

    // Assert - Back button should exist instead
    const backButton = screen.getByRole("button", { name: /back/i });
    expect(backButton).toBeInTheDocument();
  });

  it("styles 'Launch Debugger' button with theme colors", () => {
    // Arrange
    const onLaunchDebugger = vi.fn();
    const onToggleEditor = vi.fn();

    // Act
    renderWithTheme(
      <Header
        onToggleEditor={onToggleEditor}
        editorVisible={false}
        hasGenerated={false}
        videoData={null}
        onLaunchDebugger={onLaunchDebugger}
      />
    );

    // Assert - button should use accent colors from theme
    const launchButton = screen.getByRole("button", { name: /launch debugger/i });
    const styles = window.getComputedStyle(launchButton);

    // Should use accent.primary background
    expect(styles.backgroundColor).toBeTruthy();
    // Should have proper padding
    expect(styles.padding).toBeTruthy();
    // Should have border radius
    expect(styles.borderRadius).toBeTruthy();
  });
});