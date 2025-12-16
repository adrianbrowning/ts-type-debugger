import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../utils/renderWithProviders.tsx';
import userEvent from '@testing-library/user-event';
import { DebugToolbar } from '../../../src/web/components/DebugToolbar';

describe('DebugToolbar Component', () => {
  const defaultProps = {
    currentStepIndex: 5,
    totalSteps: 23,
    onPrevious: vi.fn(),
    onNext: vi.fn(),
    onStepInto: vi.fn(),
    onStepOver: vi.fn(),
    onStepOut: vi.fn(),
    canStepOut: true,
  };

  it('renders all navigation buttons', () => {
    render(<DebugToolbar {...defaultProps} />);

    expect(screen.getByRole('button', { name: /previous/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /next/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /into/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /over/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /out/i })).toBeDefined();
  });

  it('displays step counter correctly', () => {
    render(<DebugToolbar {...defaultProps} />);

    expect(screen.getByText(/step 5 \/ 23/i)).toBeDefined();
  });

  it('calls onPrevious when previous button clicked', async () => {
    const user = userEvent.setup();
    const onPrevious = vi.fn();

    render(<DebugToolbar {...defaultProps} onPrevious={onPrevious} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    await user.click(prevButton);

    expect(onPrevious).toHaveBeenCalledOnce();
  });

  it('calls onNext when next button clicked', async () => {
    const user = userEvent.setup();
    const onNext = vi.fn();

    render(<DebugToolbar {...defaultProps} onNext={onNext} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(onNext).toHaveBeenCalledOnce();
  });

  it('calls onStepInto when step into button clicked', async () => {
    const user = userEvent.setup();
    const onStepInto = vi.fn();

    render(<DebugToolbar {...defaultProps} onStepInto={onStepInto} />);

    const stepIntoButton = screen.getByRole('button', { name: /into/i });
    await user.click(stepIntoButton);

    expect(onStepInto).toHaveBeenCalledOnce();
  });

  it('calls onStepOver when step over button clicked', async () => {
    const user = userEvent.setup();
    const onStepOver = vi.fn();

    render(<DebugToolbar {...defaultProps} onStepOver={onStepOver} />);

    const stepOverButton = screen.getByRole('button', { name: /over/i });
    await user.click(stepOverButton);

    expect(onStepOver).toHaveBeenCalledOnce();
  });

  it('calls onStepOut when step out button clicked', async () => {
    const user = userEvent.setup();
    const onStepOut = vi.fn();

    render(<DebugToolbar {...defaultProps} onStepOut={onStepOut} />);

    const stepOutButton = screen.getByRole('button', { name: /out/i });
    await user.click(stepOutButton);

    expect(onStepOut).toHaveBeenCalledOnce();
  });

  it('disables previous button when at first step', () => {
    render(<DebugToolbar {...defaultProps} currentStepIndex={0} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton.getAttribute('disabled')).toBe('');
  });

  it('disables next button when at last step', () => {
    render(<DebugToolbar {...defaultProps} currentStepIndex={22} totalSteps={23} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton.getAttribute('disabled')).toBe('');
  });

  it('disables step out button when canStepOut is false', () => {
    render(<DebugToolbar {...defaultProps} canStepOut={false} />);

    const stepOutButton = screen.getByRole('button', { name: /out/i });
    expect(stepOutButton.getAttribute('disabled')).toBe('');
  });

  it('enables step out button when canStepOut is true', () => {
    render(<DebugToolbar {...defaultProps} canStepOut={true} />);

    const stepOutButton = screen.getByRole('button', { name: /out/i });
    expect(stepOutButton.getAttribute('disabled')).toBeNull();
  });

  it('enables previous button when not at first step', () => {
    render(<DebugToolbar {...defaultProps} currentStepIndex={5} />);

    const prevButton = screen.getByRole('button', { name: /previous/i });
    expect(prevButton.getAttribute('disabled')).toBeNull();
  });

  it('enables next button when not at last step', () => {
    render(<DebugToolbar {...defaultProps} currentStepIndex={5} totalSteps={23} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    expect(nextButton.getAttribute('disabled')).toBeNull();
  });

  it('updates step counter when props change', () => {
    const { rerender } = render(<DebugToolbar {...defaultProps} />);

    expect(screen.getByText(/step 5 \/ 23/i)).toBeDefined();

    rerender(<DebugToolbar {...defaultProps} currentStepIndex={10} totalSteps={30} />);

    expect(screen.getByText(/step 10 \/ 30/i)).toBeDefined();
  });
});
