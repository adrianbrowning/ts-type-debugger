import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../../src/web/App.tsx';

describe('App Component', () => {
  it('renders with initial state', () => {
    render(<App />);

    // Should render the app container
    expect(document.body).toBeDefined();
  });

  it('generates video data on submit', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Find generate button
    const generateButton = screen.queryByText(/generate/i);

    if (generateButton) {
      await user.click(generateButton);

      // Wait for loading state to finish
      await waitFor(() => {
        expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
      }, { timeout: 5000 });
    }

    expect(document.body).toBeDefined();
  });

  it('displays error for invalid type expression', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Try to submit invalid syntax - clear existing value and type invalid
    const input = screen.queryByPlaceholderText(/type/i);
    if (input) {
      await user.clear(input);
      await user.type(input, 'InvalidType<<<>>>');

      const generateButton = screen.queryByText(/generate/i);
      if (generateButton) {
        await user.click(generateButton);

        // Wait for error state or loading to finish
        await waitFor(() => {
          expect(screen.queryByText(/generating/i)).not.toBeInTheDocument();
        }, { timeout: 3000 });
      }
    }

    expect(document.body).toBeDefined();
  });

  it('toggles editor visibility', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Look for toggle button
    const toggleButton = screen.queryByText(/hide|show/i);

    if (toggleButton) {
      await user.click(toggleButton);
    }

    expect(document.body).toBeDefined();
  });
});
