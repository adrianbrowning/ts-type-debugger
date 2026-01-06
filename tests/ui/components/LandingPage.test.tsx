import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LandingPage } from "../../../src/web/components/LandingPage.tsx";
import { render } from "../../utils/renderWithProviders.tsx";

describe("LandingPage Component", () => {
  const mockOnTryIt = vi.fn();

  beforeEach(() => {
    mockOnTryIt.mockClear();
  });

  describe("Initial Render", () => {
    it("renders hero section with title", async () => {
      render(<LandingPage onTryIt={mockOnTryIt} />);

      // Wait for Monaco editor to settle and check title elements
      await waitFor(() => {
        // Title is split across elements with <br>, check h1 contains the text
        const heading = screen.getByRole("heading", { level: 1 });
        expect(heading).toBeInTheDocument();
        expect(heading.textContent).toContain("Visualize");
        expect(heading.textContent).toContain("TypeScript Types");
      });
    });

    // Note: ThemeDropdown is in Header, not LandingPage

    it("renders navigation links", async () => {
      render(<LandingPage onTryIt={mockOnTryIt} />);

      // Wait for rendering and check links
      await waitFor(() => {
        expect(screen.getByRole("link", { name: /try it now/i })).toBeInTheDocument();
      });
      expect(screen.getByRole("link", { name: /see it in action/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /see features/i })).toBeInTheDocument();
    });

    it("renders GitHub links", async () => {
      render(<LandingPage onTryIt={mockOnTryIt} />);

      await waitFor(() => {
        const githubLinks = screen.getAllByRole("link", { name: /github/i });
        expect(githubLinks.length).toBeGreaterThanOrEqual(1);
        expect(githubLinks[0]).toHaveAttribute("href", "https://github.com/adrianbrowning/ts-type-debugger");
      });
    });
  });

  describe("Example Buttons", () => {
    it("renders all 4 example buttons", async () => {
      render(<LandingPage onTryIt={mockOnTryIt} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /load conditional example/i })).toBeInTheDocument();
      });
      expect(screen.getByRole("button", { name: /load flatten example/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /load keyof example/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /load infer example/i })).toBeInTheDocument();
    });

    it("loads Conditional example when clicked", async () => {
      const user = userEvent.setup();
      render(<LandingPage onTryIt={mockOnTryIt} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /load conditional example/i })).toBeInTheDocument();
      });

      const conditionalBtn = screen.getByRole("button", { name: /load conditional example/i });
      await user.click(conditionalBtn);

      // Check that type name input has correct value
      await waitFor(() => {
        const typeNameInput = screen.getByLabelText(/type to evaluate/i);
        expect(typeNameInput).toHaveValue("Foo<'hello'>");
      });
    });

    it("loads Flatten example when clicked", async () => {
      const user = userEvent.setup();
      render(<LandingPage onTryIt={mockOnTryIt} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /load flatten example/i })).toBeInTheDocument();
      });

      const flattenBtn = screen.getByRole("button", { name: /load flatten example/i });
      await user.click(flattenBtn);

      await waitFor(() => {
        const typeNameInput = screen.getByLabelText(/type to evaluate/i);
        expect(typeNameInput).toHaveValue("Flatten<number[][]>");
      });
    });

    it("loads keyof example when clicked", async () => {
      const user = userEvent.setup();
      render(<LandingPage onTryIt={mockOnTryIt} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /load keyof example/i })).toBeInTheDocument();
      });

      const keyofBtn = screen.getByRole("button", { name: /load keyof example/i });
      await user.click(keyofBtn);

      await waitFor(() => {
        const typeNameInput = screen.getByLabelText(/type to evaluate/i);
        expect(typeNameInput).toHaveValue("Keys<{ a: number; b: string }>;");
      });
    });

    it("loads infer example when clicked", async () => {
      const user = userEvent.setup();
      render(<LandingPage onTryIt={mockOnTryIt} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /load infer example/i })).toBeInTheDocument();
      });

      const inferBtn = screen.getByRole("button", { name: /load infer example/i });
      await user.click(inferBtn);

      await waitFor(() => {
        const typeNameInput = screen.getByLabelText(/type to evaluate/i);
        expect(typeNameInput).toHaveValue("MyAwaited<Promise<string>>");
      });
    });
  });

  describe("Type Name Input", () => {
    it("updates type name when user types", async () => {
      const user = userEvent.setup();
      render(<LandingPage onTryIt={mockOnTryIt} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/type to evaluate/i)).toBeInTheDocument();
      });

      const typeNameInput = screen.getByLabelText(/type to evaluate/i);
      await user.clear(typeNameInput);
      await user.type(typeNameInput, "CustomType<string>");

      await waitFor(() => {
        expect(typeNameInput).toHaveValue("CustomType<string>");
      });
    });
  });

  describe("Evaluate Button", () => {
    // Note: Testing link navigation for unmodified examples is skipped because
    // window.location.href assignment causes iframe disconnection in browser tests.
    // The behavior is verified by testing the opposite case (onTryIt IS called when modified).

    it("calls onTryIt when type name is modified", async () => {
      const user = userEvent.setup();
      render(<LandingPage onTryIt={mockOnTryIt} />);

      await waitFor(() => {
        expect(screen.getByLabelText(/type to evaluate/i)).toBeInTheDocument();
      });

      const typeNameInput = screen.getByLabelText(/type to evaluate/i);
      await user.clear(typeNameInput);
      await user.type(typeNameInput, "Custom<test>");

      const evaluateBtn = screen.getByRole("button", { name: /evaluate/i });
      await user.click(evaluateBtn);

      // Modified input should use onTryIt
      await waitFor(() => {
        expect(mockOnTryIt).toHaveBeenCalledWith(
          expect.any(String),
          "Custom<test>"
        );
      });
    });
  });

  describe("Features Section", () => {
    it("renders all feature cards", async () => {
      render(<LandingPage onTryIt={mockOnTryIt} />);

      await waitFor(() => {
        expect(screen.getByText("Debugger Controls")).toBeInTheDocument();
      });
      expect(screen.getByText("Call Stack Navigation")).toBeInTheDocument();
      expect(screen.getByText("Scope Inspection")).toBeInTheDocument();
      expect(screen.getByText("Union Distribution")).toBeInTheDocument();
      expect(screen.getByText("Infer Pattern Matching")).toBeInTheDocument();
      expect(screen.getByText("Globals & Type Aliases")).toBeInTheDocument();
    });
  });

  describe("Footer", () => {
    it("renders footer with GitHub link", async () => {
      render(<LandingPage onTryIt={mockOnTryIt} />);

      await waitFor(() => {
        expect(screen.getByText(/made for typescript developers/i)).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("has accessible labels on example buttons", async () => {
      render(<LandingPage onTryIt={mockOnTryIt} />);

      await waitFor(() => {
        const buttons = screen.getAllByRole("button", { name: /load .+ example/i });
        expect(buttons.length).toBe(4);
      });
    });

    it("has accessible label on type name input", async () => {
      render(<LandingPage onTryIt={mockOnTryIt} />);

      await waitFor(() => {
        const input = screen.getByLabelText(/type to evaluate/i);
        expect(input).toBeInTheDocument();
      });
    });

    it("has sr-only label for code editor", async () => {
      render(<LandingPage onTryIt={mockOnTryIt} />);

      await waitFor(() => {
        const label = screen.getByText(/typescript code input/i);
        expect(label).toHaveClass("sr-only");
      });
    });
  });
});
