import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { App } from "../../src/web/App.tsx";
import { render } from "../utils/renderWithProviders.tsx";

/**
 * Integration tests for App.tsx with landing page routing
 * Tests the landing page view and navigation to debugger
 *
 * NOTE: These tests run in browser environment where window.location
 * cannot be easily mocked. Tests focus on default behavior (root path).
 */
describe("App Integration - Landing Page Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Initial View (Landing Page)", () => {
    it("shows landing page content on initial render", async () => {
      render(<App />);

      await waitFor(() => {
        // Landing page should show hero content
        const heading = screen.getByRole("heading", { level: 1 });
        expect(heading.textContent).toContain("TypeScript Types");
      });
    });

    it("shows theme dropdown on landing page", async () => {
      render(<App />);

      await waitFor(() => {
        const themeButton = screen.getByRole("button", { name: /theme settings/i });
        expect(themeButton).toBeInTheDocument();
      });
    });

    it("shows all example buttons", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /load conditional example/i })).toBeInTheDocument();
      });
      expect(screen.getByRole("button", { name: /load flatten example/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /load keyof example/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /load infer example/i })).toBeInTheDocument();
    });

    it("shows Evaluate button", async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /evaluate/i })).toBeInTheDocument();
      });
    });
  });

  describe("Navigation to Debugger", () => {
    it("navigates to debugger when Evaluate button is clicked", async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /evaluate/i })).toBeInTheDocument();
      });

      const evaluateBtn = screen.getByRole("button", { name: /evaluate/i });
      await user.click(evaluateBtn);

      // Should navigate to debugger view - header shows "TS Type Debugger"
      await waitFor(() => {
        expect(screen.getByText(/TS Type Debugger/i)).toBeInTheDocument();
      });

      // Should show editor with type input
      await waitFor(() => {
        const typeInput = screen.getByPlaceholderText(/type/i);
        expect(typeInput).toBeInTheDocument();
      });

      // Should show Debug button
      const debugButton = Array.from(document.querySelectorAll("button")).find(
        btn => btn.textContent && btn.textContent.toLowerCase().includes("debug")
      );
      expect(debugButton).toBeDefined();

    });
  });
});
