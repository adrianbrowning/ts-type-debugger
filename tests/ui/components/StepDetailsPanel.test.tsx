import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepDetailsPanel } from '../../../src/web/components/StepDetailsPanel.tsx';
import { createMockStep } from '../../fixtures/mockVideoData.ts';

describe('StepDetailsPanel', () => {
  it('shows "No step selected" when currentStep is null', () => {
    // Act
    render(<StepDetailsPanel currentStep={null} />);

    // Assert
    expect(screen.getByText('No step selected')).toBeDefined();
  });

  it('displays step number and type', () => {
    // Arrange
    const mockStep = createMockStep({
      original: {
        step: 3,
        type: 'generic_call',
        expression: 'Identity<string>',
        level: 1,
      },
    });

    // Act
    render(<StepDetailsPanel currentStep={mockStep} />);

    // Assert
    expect(screen.getByText('Step 3')).toBeDefined();
    expect(screen.getByText('generic_call')).toBeDefined();
  });

  it('displays expression text', () => {
    // Arrange
    const mockStep = createMockStep({
      original: {
        step: 1,
        type: 'type_alias_start',
        expression: 'MyComplexType<string, number>',
        level: 0,
      },
    });

    // Act
    render(<StepDetailsPanel currentStep={mockStep} />);

    // Assert
    expect(screen.getByText('MyComplexType<string, number>')).toBeDefined();
  });

  it('shows "Running Results" section when currentUnionMember present', () => {
    // Arrange
    const mockStep = createMockStep({
      original: {
        step: 2,
        type: 'conditional_union_member',
        expression: 'Loop2<"a" | "b">',
        level: 1,
        currentUnionMember: '"a"',
        currentUnionResults: '1',
      },
    });

    // Act
    render(<StepDetailsPanel currentStep={mockStep} />);

    // Assert
    expect(screen.getByText('Running Results')).toBeDefined();
    expect(screen.getByText('Current Member:')).toBeDefined();
    expect(screen.getByText('"a"')).toBeDefined();
    expect(screen.getByText('Accumulated:')).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
  });

  it('does not show "Running Results" when currentUnionMember absent', () => {
    // Arrange
    const mockStep = createMockStep({
      original: {
        step: 1,
        type: 'type_alias_start',
        expression: 'Test',
        level: 0,
      },
    });

    // Act
    render(<StepDetailsPanel currentStep={mockStep} />);

    // Assert
    expect(screen.queryByText('Running Results')).toBeNull();
  });

  it('shows result when available', () => {
    // Arrange
    const mockStep = createMockStep({
      original: {
        step: 4,
        type: 'generic_result',
        expression: 'Identity<string>',
        level: 1,
        result: 'string',
      },
    });

    // Act
    render(<StepDetailsPanel currentStep={mockStep} />);

    // Assert
    expect(screen.getByText('Result')).toBeDefined();
    expect(screen.getByText('string')).toBeDefined();
  });

  it('shows arguments when present', () => {
    // Arrange
    const mockStep = createMockStep({
      original: {
        step: 2,
        type: 'generic_call',
        expression: 'MyType<string, number>',
        level: 1,
        args: { T: 'string', U: 'number' },
      },
    });

    // Act
    render(<StepDetailsPanel currentStep={mockStep} />);

    // Assert
    expect(screen.getByText('Arguments')).toBeDefined();
    expect(screen.getByText('T:')).toBeDefined();
    expect(screen.getByText('string')).toBeDefined();
    expect(screen.getByText('U:')).toBeDefined();
    expect(screen.getByText('number')).toBeDefined();
  });

  it('shows parameters when present', () => {
    // Arrange
    const mockStep = createMockStep({
      original: {
        step: 3,
        type: 'generic_def',
        expression: 'Identity<T>',
        level: 1,
        parameters: { T: 'string' },
      },
    });

    // Act
    render(<StepDetailsPanel currentStep={mockStep} />);

    // Assert
    expect(screen.getByText('Parameters in Scope')).toBeDefined();
    expect(screen.getByText('T:')).toBeDefined();
  });

  it('displays header title "Step Details"', () => {
    // Arrange
    const mockStep = createMockStep();

    // Act
    render(<StepDetailsPanel currentStep={mockStep} />);

    // Assert
    expect(screen.getByText('Step Details')).toBeDefined();
  });
});
