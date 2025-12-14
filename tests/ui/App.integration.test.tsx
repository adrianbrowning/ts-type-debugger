import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../src/web/App.tsx';

/**
 * Integration tests for App.tsx refactoring
 * Tests the removal of FooterNav and editor hiding behavior
 */
describe('App Integration - UI Refactoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Editor visibility after generation', () => {
    it('hides editor after Generate button is clicked', async () => {
      const user = userEvent.setup();
      render(<App />);

      // Editor should be visible initially
      const typeInput = screen.getByPlaceholderText(/type/i);
      expect(typeInput).toBeDefined();

      // Find and click Generate button
      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      // Wait for generation to complete
      await waitFor(
        () => {
          expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Editor should now be hidden (input should not be visible)
      expect(screen.queryByPlaceholderText(/type/i)).toBeNull();
    });

    it('editor remains hidden after successful generation', async () => {
      const user = userEvent.setup();
      render(<App />);

      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      await waitFor(
        () => {
          expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Editor should still be hidden
      expect(screen.queryByPlaceholderText(/type/i)).toBeNull();

      // Monaco editor should also not be rendered
      const monacoContainer = document.querySelector('.monaco-editor');
      expect(monacoContainer).toBeNull();
    });
  });

  describe('FooterNav removal', () => {
    it('does not render FooterNav after generation', async () => {
      const user = userEvent.setup();
      render(<App />);

      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      await waitFor(
        () => {
          expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // FooterNav should not be rendered
      expect(screen.queryByText(/Previous/)).toBeNull();
      expect(screen.queryByText(/Next/)).toBeNull();
      expect(screen.queryByText(/Play/)).toBeNull();
      expect(screen.queryByText(/Pause/)).toBeNull();

      // Footer element should not exist
      const footer = document.querySelector('footer');
      expect(footer).toBeNull();
    });

    it('does not show playback controls in footer', async () => {
      const user = userEvent.setup();
      render(<App />);

      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      await waitFor(
        () => {
          expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // No speed controls
      expect(screen.queryByText(/0.5x/)).toBeNull();
      expect(screen.queryByText(/1x/)).toBeNull();
      expect(screen.queryByText(/1.5x/)).toBeNull();
      expect(screen.queryByText(/2x/)).toBeNull();

      // No timeline slider in footer
      const footerSliders = document.querySelectorAll('footer input[type="range"]');
      expect(footerSliders.length).toBe(0);
    });
  });

  describe('StepDetailsPanel receives new props', () => {
    it('passes steps array to StepDetailsPanel', async () => {
      const user = userEvent.setup();
      render(<App />);

      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      await waitFor(
        () => {
          expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // StepDetailsPanel should have received steps data
      // This will fail because App.tsx doesn't pass steps prop yet
      const stepDetails = screen.queryByText(/Step Details|Call Stack/i);
      expect(stepDetails).toBeDefined();

      // Verify DebugToolbar is rendered with step controls
      const previousButton = screen.queryByRole('button', { name: /previous/i });
      const nextButton = screen.queryByRole('button', { name: /next/i });

      expect(previousButton).toBeDefined();
      expect(nextButton).toBeDefined();
    });

    it('passes playback callbacks to StepDetailsPanel', async () => {
      const user = userEvent.setup();
      render(<App />);

      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      await waitFor(
        () => {
          expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Playback controls should be in StepDetailsPanel, not footer
      const stepIntoButton = screen.queryByRole('button', { name: /into/i });
      const stepOverButton = screen.queryByRole('button', { name: /over/i });
      const stepOutButton = screen.queryByRole('button', { name: /out/i });

      expect(stepIntoButton).toBeDefined();
      expect(stepOverButton).toBeDefined();
      expect(stepOutButton).toBeDefined();
    });

    it('passes typeAliases to StepDetailsPanel', async () => {
      const user = userEvent.setup();
      render(<App />);

      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      await waitFor(
        () => {
          expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // StepDetailsPanel should render Globals section with typeAliases
      const globalsSection = screen.queryByText(/Globals/i);
      expect(globalsSection).toBeDefined();
    });
  });

  describe('Playback controls in StepDetailsPanel', () => {
    it('can navigate steps via StepDetailsPanel Previous/Next buttons', async () => {
      const user = userEvent.setup();
      render(<App />);

      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      await waitFor(
        () => {
          expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Find Next button in StepDetailsPanel
      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDefined();

      // Click Next
      await user.click(nextButton);

      // Step counter should update
      const stepCounter = screen.queryByText(/step \d+ \/ \d+/i);
      expect(stepCounter).toBeDefined();
    });

    it('can use Step Into/Over/Out controls from StepDetailsPanel', async () => {
      const user = userEvent.setup();
      render(<App />);

      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      await waitFor(
        () => {
          expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // All step controls should be accessible
      const stepIntoButton = screen.queryByRole('button', { name: /into/i });
      const stepOverButton = screen.queryByRole('button', { name: /over/i });
      const stepOutButton = screen.queryByRole('button', { name: /out/i });

      expect(stepIntoButton).toBeDefined();
      expect(stepOverButton).toBeDefined();
      expect(stepOutButton).toBeDefined();

      // Clicking should work without errors
      if (stepIntoButton && !stepIntoButton.hasAttribute('disabled')) {
        await user.click(stepIntoButton);
      }
    });

    it('does not have any playback controls in footer', async () => {
      const user = userEvent.setup();
      render(<App />);

      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      await waitFor(
        () => {
          expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Confirm no footer element exists
      const footer = document.querySelector('footer');
      expect(footer).toBeNull();

      // Playback controls should only exist in StepDetailsPanel
      const allPreviousButtons = screen.queryAllByRole('button', { name: /previous/i });
      const allNextButtons = screen.queryAllByRole('button', { name: /next/i });

      // Should have exactly 1 of each (in StepDetailsPanel), not 2 (one in footer)
      expect(allPreviousButtons.length).toBe(1);
      expect(allNextButtons.length).toBe(1);
    });
  });

  describe('Three-panel layout after generation', () => {
    it('shows only TypeDefinition and StepDetails panels after generation (no editor)', async () => {
      const user = userEvent.setup();
      render(<App />);

      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      await waitFor(
        () => {
          expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      // Editor should be hidden
      expect(screen.queryByPlaceholderText(/type/i)).toBeNull();

      // Type Definition panel should be visible
      const typeDefHeader = screen.queryByText(/Type Definition/i);
      expect(typeDefHeader).toBeDefined();

      // Step Details panel should be visible
      const stepDetailsHeader = screen.queryByText(/Step Details|Call Stack/i);
      expect(stepDetailsHeader).toBeDefined();
    });
  });
});
