import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CodePanel } from '../../../src/web/components/CodePanel.tsx';
import { createMockStep, createMockTypeInfo } from '../../fixtures/mockVideoData.ts';

describe('CodePanel', () => {
  it('shows "No active type definition" when activeType is null', () => {
    // Act
    render(<CodePanel currentStep={null} activeType={null} sourceCode="" />);

    // Assert
    expect(screen.getByText('No active type definition')).toBeDefined();
  });

  it('shows "Type Definition" header when activeType has no name', () => {
    // Arrange
    const typeInfo = createMockTypeInfo({ name: '' });

    // Act
    render(<CodePanel currentStep={null} activeType={typeInfo} sourceCode="" />);

    // Assert
    expect(screen.getByText('Type Definition')).toBeDefined();
  });

  it('displays type name in header when activeType has name', () => {
    // Arrange
    const typeInfo = createMockTypeInfo({ name: 'MyCustomType' });

    // Act
    render(<CodePanel currentStep={null} activeType={typeInfo} sourceCode="" />);

    // Assert
    expect(screen.getByText('MyCustomType')).toBeDefined();
  });

  it('displays line range in header', () => {
    // Arrange
    const typeInfo = createMockTypeInfo({
      name: 'Test',
      startLine: 4,
      endLine: 10,
    });

    // Act
    render(<CodePanel currentStep={null} activeType={typeInfo} sourceCode="" />);

    // Assert
    expect(screen.getByText('Lines 5-11')).toBeDefined();
  });

  it('renders code lines with line numbers', () => {
    // Arrange
    const typeInfo = createMockTypeInfo({
      name: 'Test',
      lines: ['type Test = string;', '// comment'],
      startLine: 0,
      endLine: 1,
    });

    // Act
    render(<CodePanel currentStep={null} activeType={typeInfo} sourceCode="" />);

    // Assert
    expect(screen.getByText('1')).toBeDefined(); // Line number
    expect(screen.getByText('2')).toBeDefined(); // Line number
    expect(screen.getByText('type Test = string;')).toBeDefined();
    expect(screen.getByText('// comment')).toBeDefined();
  });

  it('renders highlighted lines when available', () => {
    // Arrange
    const typeInfo = createMockTypeInfo({
      name: 'Test',
      lines: ['type Test = string;'],
      startLine: 0,
      endLine: 0,
      highlightedLines: ['<span class="keyword">type</span> Test = <span class="type">string</span>;'],
    });

    // Act
    const { container } = render(
      <CodePanel currentStep={null} activeType={typeInfo} sourceCode="" />
    );

    // Assert - should contain highlighted HTML
    const htmlContent = container.innerHTML;
    expect(htmlContent).toContain('class="keyword"');
    expect(htmlContent).toContain('class="type"');
  });

  it('renders highlight box when currentStep has highlightLines', () => {
    // Arrange
    const typeInfo = createMockTypeInfo({
      name: 'Test',
      lines: ['type Test = string;', 'type Other = number;'],
      startLine: 0,
      endLine: 1,
    });
    const currentStep = createMockStep({
      highlightLines: { start: 0, end: 0 },
    });

    // Act
    const { container } = render(
      <CodePanel currentStep={currentStep} activeType={typeInfo} sourceCode="" />
    );

    // Assert - should have highlight box with gold border
    const highlightBox = container.querySelector('[style*="border"]');
    expect(highlightBox).toBeDefined();
  });

  it('handles multiple code lines correctly', () => {
    // Arrange
    const typeInfo = createMockTypeInfo({
      name: 'Complex',
      lines: [
        'type Complex<T> = {',
        '  value: T;',
        '  nested: {',
        '    inner: string;',
        '  };',
        '};',
      ],
      startLine: 5,
      endLine: 10,
    });

    // Act
    render(<CodePanel currentStep={null} activeType={typeInfo} sourceCode="" />);

    // Assert - line numbers should be absolute (6-11 since startLine is 5)
    expect(screen.getByText('6')).toBeDefined();
    expect(screen.getByText('11')).toBeDefined();
    expect(screen.getByText('value: T;')).toBeDefined();
  });

  it('renders without crash when sourceCode is empty', () => {
    // Arrange
    const typeInfo = createMockTypeInfo();

    // Act
    render(<CodePanel currentStep={null} activeType={typeInfo} sourceCode="" />);

    // Assert
    expect(screen.getByText('Test')).toBeDefined();
  });
});
