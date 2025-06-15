 import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SeverityChips, { Severity } from '../SeverityChips';

describe('SeverityChips Component', () => {
  const mockOnChange = jest.fn();
  const severities: Severity[] = ['Critical', 'High', 'Medium', 'Low'];

  // Reset mock before each test
  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders all severity levels with default styles', () => {
    render(<SeverityChips value={null} onChange={mockOnChange} />);

    severities.forEach(severity => {
      const chip = screen.getByText(severity);
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveClass('bg-sand-2');
      expect(chip).toHaveClass('text-sand-11');
      expect(chip).toHaveClass('border-sand-7');
    });
  });

  it('applies active styles when a chip is selected', () => {
    render(<SeverityChips value="Critical" onChange={mockOnChange} />);

    const criticalChip = screen.getByText('Critical');
    expect(criticalChip).toHaveClass('bg-red-600');
    expect(criticalChip).toHaveClass('text-white');
    expect(criticalChip).toHaveClass('border-red-600');

    const highChip = screen.getByText('High');
    expect(highChip).toHaveClass('bg-sand-2');
    expect(highChip).toHaveClass('text-sand-11');
  });

  it('calls onChange with the severity when an inactive chip is clicked', () => {
    render(<SeverityChips value={null} onChange={mockOnChange} />);

    const mediumChip = screen.getByText('Medium');
    fireEvent.click(mediumChip);

    expect(mockOnChange).toHaveBeenCalledWith('Medium');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange with null when an active chip is clicked', () => {
    render(<SeverityChips value="High" onChange={mockOnChange} />);

    const highChip = screen.getByText('High');
    fireEvent.click(highChip);

    expect(mockOnChange).toHaveBeenCalledWith(null);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('renders clear button when a chip is active', () => {
    render(<SeverityChips value="Low" onChange={mockOnChange} />);

    const clearButton = screen.getByLabelText('Clear severity filter');
    expect(clearButton).toBeInTheDocument();
    expect(clearButton).toHaveClass('absolute');
    expect(clearButton).toHaveClass('h-4');
    expect(clearButton).toHaveClass('w-4');
  });

  it('does not render clear button when no chip is active', () => {
    render(<SeverityChips value={null} onChange={mockOnChange} />);

    const clearButton = screen.queryByLabelText('Clear severity filter');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('calls onChange with null when clear button is clicked', () => {
    render(<SeverityChips value="Critical" onChange={mockOnChange} />);

    const clearButton = screen.getByLabelText('Clear severity filter');
    fireEvent.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith(null);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('applies correct theme classes for each severity when active', () => {
    const { rerender } = render(<SeverityChips value={null} onChange={mockOnChange} />);

    // Test Critical
    rerender(<SeverityChips value="Critical" onChange={mockOnChange} />);
    expect(screen.getByText('Critical')).toHaveClass('bg-red-600', 'text-white', 'border-red-600');

    // Test High
    rerender(<SeverityChips value="High" onChange={mockOnChange} />);
    expect(screen.getByText('High')).toHaveClass('bg-red-200', 'text-red-800', 'border-red-300');

    // Test Medium
    rerender(<SeverityChips value="Medium" onChange={mockOnChange} />);
    expect(screen.getByText('Medium')).toHaveClass('bg-yellow-200', 'text-yellow-800', 'border-yellow-300');

    // Test Low
    rerender(<SeverityChips value="Low" onChange={mockOnChange} />);
    expect(screen.getByText('Low')).toHaveClass('bg-green-200', 'text-green-800', 'border-green-300');
  });

  it('adds extra padding when a chip is active to accommodate clear button', () => {
    render(<SeverityChips value="High" onChange={mockOnChange} />);

    const highChip = screen.getByText('High');
    expect(highChip).toHaveClass('pr-6');

    const mediumChip = screen.getByText('Medium');
    expect(mediumChip).not.toHaveClass('pr-6');
  });

  it('has hover styles for inactive chips', () => {
    render(<SeverityChips value={null} onChange={mockOnChange} />);

    const criticalChip = screen.getByText('Critical');
    expect(criticalChip).toHaveClass('hover:bg-sand-3');
  });
});
