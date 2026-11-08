import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it('renders "Under review" status with correct text and icon', () => {
    render(<StatusBadge status="under_review" />);
    const badge = screen.getByText('Under review');
    expect(badge).toBeInTheDocument();
  });

  it('renders "Published" status correctly', () => {
    render(<StatusBadge status="published" />);
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('renders "Not approved" status correctly', () => {
    render(<StatusBadge status="not_approved" />);
    expect(screen.getByText('Not approved')).toBeInTheDocument();
  });

  it('renders "AI reviewed" status correctly', () => {
    render(<StatusBadge status="ai_reviewed" />);
    expect(screen.getByText('AI reviewed')).toBeInTheDocument();
  });

  it('renders "False report" status correctly', () => {
    render(<StatusBadge status="false_report" />);
    expect(screen.getByText('False report')).toBeInTheDocument();
  });

  it('renders "Removed" status correctly', () => {
    render(<StatusBadge status="removed" />);
    expect(screen.getByText('Removed')).toBeInTheDocument();
  });
});
