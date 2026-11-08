import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IncidentFilterChips } from './incident-filter-chips';

describe('IncidentFilterChips component', () => {
  it('renders chips for active filters', () => {
    const filters = {
      review_status: ['under_review'],
      category_id: ['fire', 'gathering'],
      flagged: true,
      date_preset: '7d' as const,
    };

    render(
      <IncidentFilterChips
        filters={filters}
        onRemove={vi.fn()}
        onClearAll={vi.fn()}
      />
    );

    expect(screen.getByText(/Review: under review/i)).toBeInTheDocument();
    expect(screen.getByText(/Category: Fire, Gathering/i)).toBeInTheDocument();
    expect(screen.getByText(/Flagged only/i)).toBeInTheDocument();
    expect(screen.getByText(/Last 7 days/i)).toBeInTheDocument();
    expect(screen.getByText(/Clear all/i)).toBeInTheDocument();
  });

  it('triggers onRemove when chip close icon is clicked', () => {
    const onRemove = vi.fn();
    const filters = {
      flagged: true,
    };

    render(
      <IncidentFilterChips
        filters={filters}
        onRemove={onRemove}
        onClearAll={vi.fn()}
      />
    );

    const removeBtn = screen.getByLabelText(/Remove filter Flagged only/i);
    fireEvent.click(removeBtn);

    expect(onRemove).toHaveBeenCalledWith('flagged');
  });

  it('triggers onClearAll when Clear all button is clicked', () => {
    const onClearAll = vi.fn();
    const filters = {
      q: 'Margalla',
      flagged: true,
    };

    render(
      <IncidentFilterChips
        filters={filters}
        onRemove={vi.fn()}
        onClearAll={onClearAll}
      />
    );

    const clearBtn = screen.getByText(/Clear all/i);
    fireEvent.click(clearBtn);

    expect(onClearAll).toHaveBeenCalled();
  });

  it('returns null when no active filters', () => {
    const { container } = render(
      <IncidentFilterChips
        filters={{}}
        onRemove={vi.fn()}
        onClearAll={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
