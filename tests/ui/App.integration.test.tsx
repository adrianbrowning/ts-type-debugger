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

      // Wait for landing page content
      await waitFor(() => {
        // Check for landing page title (there may be multiple elements with "TypeScript Types")
        const elements = screen.getAllByText(/TypeScript Types/i);
        expect(elements.length).toBeGreaterThan(0);
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
    it("navigates to debugger when Evaluate clicked with modified input", async () => {
      const user = userEvent.setup();
      render(<App />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /evaluate/i })).toBeInTheDocument();
      });

      // Modify the type name to trigger onTryIt instead of link navigation
      const typeNameInput = screen.getByLabelText(/type to evaluate/i);
      await user.clear(typeNameInput);
      await user.type(typeNameInput, "Foo<'test'>");

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
