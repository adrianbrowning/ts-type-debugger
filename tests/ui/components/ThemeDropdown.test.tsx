import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ThemeDropdown } from "../../../src/web/components/ThemeDropdown.tsx";
import { render } from "../../utils/renderWithProviders.tsx";

describe("ThemeDropdown Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe("Initial Render", () => {
    it("renders theme button with aria-label", async () => {
      render(<ThemeDropdown />);

      await waitFor(() => {
        const button = screen.getByRole("button", { name: /theme settings/i });
        expect(button).toBeInTheDocument();
      });
    });

    it("has correct aria attributes when closed", async () => {
      render(<ThemeDropdown />);

      await waitFor(() => {
        const button = screen.getByRole("button", { name: /theme settings/i });
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button).toHaveAttribute("aria-haspopup", "true");
      });
    });

    it("dropdown menu is not visible initially", async () => {
      render(<ThemeDropdown />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /theme settings/i })).toBeInTheDocument();
      });

      // Menu options should not be present
      expect(screen.queryByRole("button", { name: /auto/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /light/i })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /dark/i })).not.toBeInTheDocument();
    });
  });

  describe("Dropdown Toggle", () => {
    it("opens dropdown on button click", async () => {
      const user = userEvent.setup();
      render(<ThemeDropdown />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /theme settings/i })).toBeInTheDocument();
      });

      const button = screen.getByRole("button", { name: /theme settings/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Auto")).toBeInTheDocument();
        expect(screen.getByText("Light")).toBeInTheDocument();
        expect(screen.getByText("Dark")).toBeInTheDocument();
      });
    });

    it("sets aria-expanded to true when open", async () => {
      const user = userEvent.setup();
      render(<ThemeDropdown />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /theme settings/i })).toBeInTheDocument();
      });

      const button = screen.getByRole("button", { name: /theme settings/i });
      await user.click(button);

      await waitFor(() => {
        expect(button).toHaveAttribute("aria-expanded", "true");
      });
    });

    it("closes dropdown on second button click (toggle)", async () => {
      const user = userEvent.setup();
      render(<ThemeDropdown />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /theme settings/i })).toBeInTheDocument();
      });

      const button = screen.getByRole("button", { name: /theme settings/i });

      // Open
      await user.click(button);
      await waitFor(() => {
        expect(screen.getByText("Auto")).toBeInTheDocument();
      });

      // Close
      await user.click(button);
      await waitFor(() => {
        expect(screen.queryByText("Auto")).not.toBeInTheDocument();
      });
    });
  });

  describe("Close Behaviors", () => {
    it("closes dropdown on Escape key", async () => {
      const user = userEvent.setup();
      render(<ThemeDropdown />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /theme settings/i })).toBeInTheDocument();
      });

      const button = screen.getByRole("button", { name: /theme settings/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Auto")).toBeInTheDocument();
      });

      // Press Escape
      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByText("Auto")).not.toBeInTheDocument();
      });
    });

    it("closes dropdown on click outside", async () => {
      const user = userEvent.setup();
      render(
        <div>
          <div data-testid="outside-element">{"Outside"}</div>
          <ThemeDropdown />
        </div>
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /theme settings/i })).toBeInTheDocument();
      });

      const button = screen.getByRole("button", { name: /theme settings/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Auto")).toBeInTheDocument();
      });

      // Click outside
      const outsideElement = screen.getByTestId("outside-element");
      await user.click(outsideElement);

      await waitFor(() => {
        expect(screen.queryByText("Auto")).not.toBeInTheDocument();
      });
    });
  });

  describe("Mode Selection", () => {
    it("shows checkmark on currently selected mode", async () => {
      const user = userEvent.setup();
      render(<ThemeDropdown />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /theme settings/i })).toBeInTheDocument();
      });

      const button = screen.getByRole("button", { name: /theme settings/i });
      await user.click(button);

      await waitFor(() => {
        // Default is system/auto - should have checkmark
        const autoOption = screen.getByText("Auto").closest("button");
        expect(autoOption).toHaveClass("selected");
      });
    });

    it("selects Light mode when clicked", async () => {
      const user = userEvent.setup();
      render(<ThemeDropdown />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /theme settings/i })).toBeInTheDocument();
      });

      const button = screen.getByRole("button", { name: /theme settings/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Light")).toBeInTheDocument();
      });

      // Click Light option
      await user.click(screen.getByText("Light"));

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByText("Auto")).not.toBeInTheDocument();
      });

      // Re-open to verify selection
      await user.click(button);
      await waitFor(() => {
        const lightOption = screen.getByText("Light").closest("button");
        expect(lightOption).toHaveClass("selected");
      });
    });

    it("selects Dark mode when clicked", async () => {
      const user = userEvent.setup();
      render(<ThemeDropdown />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /theme settings/i })).toBeInTheDocument();
      });

      const button = screen.getByRole("button", { name: /theme settings/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Dark")).toBeInTheDocument();
      });

      // Click Dark option
      await user.click(screen.getByText("Dark"));

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByText("Auto")).not.toBeInTheDocument();
      });

      // Re-open to verify selection
      await user.click(button);
      await waitFor(() => {
        const darkOption = screen.getByText("Dark").closest("button");
        expect(darkOption).toHaveClass("selected");
      });
    });

    it("selects Auto/System mode when clicked", async () => {
      const user = userEvent.setup();
      render(<ThemeDropdown />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /theme settings/i })).toBeInTheDocument();
      });

      const button = screen.getByRole("button", { name: /theme settings/i });

      // First select Dark
      await user.click(button);
      await waitFor(() => {
        expect(screen.getByText("Dark")).toBeInTheDocument();
      });
      await user.click(screen.getByText("Dark"));

      // Then switch back to Auto
      await user.click(button);
      await waitFor(() => {
        expect(screen.getByText("Auto")).toBeInTheDocument();
      });
      await user.click(screen.getByText("Auto"));

      // Verify Auto is selected
      await user.click(button);
      await waitFor(() => {
        const autoOption = screen.getByText("Auto").closest("button");
        expect(autoOption).toHaveClass("selected");
      });
    });

    it("closes dropdown after selecting a mode", async () => {
      const user = userEvent.setup();
      render(<ThemeDropdown />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /theme settings/i })).toBeInTheDocument();
      });

      const button = screen.getByRole("button", { name: /theme settings/i });
      await user.click(button);

      await waitFor(() => {
        expect(screen.getByText("Light")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Light"));

      // Dropdown should close immediately after selection
      await waitFor(() => {
        expect(screen.queryByText("Light")).not.toBeInTheDocument();
        expect(button).toHaveAttribute("aria-expanded", "false");
      });
    });
  });

  describe("Icons Display", () => {
    it("displays correct icons for each mode option", async () => {
      const user = userEvent.setup();
      render(<ThemeDropdown />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /theme settings/i })).toBeInTheDocument();
      });

      const button = screen.getByRole("button", { name: /theme settings/i });
      await user.click(button);

      await waitFor(() => {
        // Check icons are present (using aria-hidden spans)
        expect(screen.getByText("💻")).toBeInTheDocument(); // Auto/System
        // Light icon (☀️) may appear multiple times - in trigger button and in option
        expect(screen.getAllByText("☀️").length).toBeGreaterThanOrEqual(1); // Light
        expect(screen.getByText("🌙")).toBeInTheDocument(); // Dark
      });
    });
  });

  describe("Accessibility", () => {
    it("all option buttons have type=button", async () => {
      const user = userEvent.setup();
      render(<ThemeDropdown />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /theme settings/i })).toBeInTheDocument();
      });

      const triggerButton = screen.getByRole("button", { name: /theme settings/i });
      expect(triggerButton).toHaveAttribute("type", "button");

      await user.click(triggerButton);

      // Check all option buttons
      const optionButtons = await screen.findAllByRole("button");
      const menuButtons = optionButtons.filter(btn => btn !== triggerButton);
      for (const btn of menuButtons) {
        expect(btn).toHaveAttribute("type", "button");
      }
    });

    it("icons are marked aria-hidden", async () => {
      const user = userEvent.setup();
      render(<ThemeDropdown />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /theme settings/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole("button", { name: /theme settings/i }));

      await waitFor(() => {
        const computerIcon = screen.getByText("💻");
        expect(computerIcon).toHaveAttribute("aria-hidden", "true");
      });
    });
  });

  describe("Custom className", () => {
    it("applies custom className to container", async () => {
      render(<ThemeDropdown className="custom-class" />);

      await waitFor(() => {
        const button = screen.getByRole("button", { name: /theme settings/i });
        // Button's parent div should have the custom class
        expect(button.parentElement).toHaveClass("custom-class");
      });
    });
  });
});
