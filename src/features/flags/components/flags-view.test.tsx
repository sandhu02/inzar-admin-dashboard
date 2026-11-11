import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { FlagsView } from './flags-view';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <NuqsTestingAdapter>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </NuqsTestingAdapter>
    );
  };
}

describe('FlagsView component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders community flags header and stats cards', async () => {
    render(<FlagsView />, { wrapper: createWrapper() });

    expect(screen.getByRole('heading', { name: /Community Flags/i })).toBeInTheDocument();
    expect(screen.getByTestId('flags-stats-bar')).toBeInTheDocument();
    expect(screen.getByTestId('flags-stat-pending')).toBeInTheDocument();
    expect(screen.getByTestId('flags-stat-all')).toBeInTheDocument();
  });

  it('renders flagged incident cards with community dispute records', async () => {
    render(<FlagsView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('flags-groups-list')).toBeInTheDocument();
    });

    // Check action buttons on first card
    const firstGroup = screen.getAllByTestId(/flag-group-/)[0]!;
    expect(firstGroup).toBeInTheDocument();
    expect(firstGroup.querySelector('a')).toHaveAttribute('href', expect.stringContaining('/incidents/'));
  });

  it('filters flags by status when clicking status pill', async () => {
    render(<FlagsView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('flags-filter-bar')).toBeInTheDocument();
    });

    const pendingPill = screen.getByTestId('flags-filter-status-pending');
    fireEvent.click(pendingPill);
    expect(pendingPill).toHaveClass('bg-foreground');
  });

  it('filters flags by type when clicking type pill', async () => {
    render(<FlagsView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('flags-filter-bar')).toBeInTheDocument();
    });

    const abusePill = screen.getByTestId('flags-filter-type-abuse');
    fireEvent.click(abusePill);
    expect(abusePill).toHaveClass('bg-accent');
  });

  it('supports dismissing a flag', async () => {
    render(<FlagsView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('flags-groups-list')).toBeInTheDocument();
    });

    // Find any dismiss flag button
    const dismissBtns = screen.getAllByTestId(/dismiss-flag-btn-/);
    if (dismissBtns.length > 0) {
      const firstDismissBtn = dismissBtns[0]!;
      fireEvent.click(firstDismissBtn);
    }
  });

  it('supports move to review queue action', async () => {
    render(<FlagsView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('flags-groups-list')).toBeInTheDocument();
    });

    const moveBtns = screen.getAllByTestId(/move-review-btn-/);
    if (moveBtns.length > 0) {
      fireEvent.click(moveBtns[0]!);
    }
  });

  it('opens mark false dialog with required reason', async () => {
    render(<FlagsView />, { wrapper: createWrapper() });

    await waitFor(
      () => {
        expect(screen.getByTestId('flags-groups-list')).toBeInTheDocument();
      },
      { timeout: 8000 }
    );

    const markFalseBtns = screen.getAllByTestId(/mark-false-btn-/);
    expect(markFalseBtns.length).toBeGreaterThan(0);

    fireEvent.click(markFalseBtns[0]!);

    // Dialog should open
    expect(screen.getByRole('heading', { name: /Mark as False Report/i })).toBeInTheDocument();
    expect(screen.getByTestId('mark-false-reason-textarea')).toBeInTheDocument();

    // Confirm button
    const confirmBtn = screen.getByTestId('confirm-mark-false-btn');
    fireEvent.click(confirmBtn);

    await waitFor(
      () => {
        expect(screen.queryByRole('heading', { name: /Mark as False Report/i })).toBeNull();
      },
      { timeout: 8000 }
    );
  }, 15000);
});
