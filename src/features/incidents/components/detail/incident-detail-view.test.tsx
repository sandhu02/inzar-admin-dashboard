import { describe, it, expect } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/ui/toast';
import { IncidentDetailView } from './incident-detail-view';

function renderIncidentDetailView(incidentId: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  return render(
    <ToastProvider>
      <QueryClientProvider client={queryClient}>
        <IncidentDetailView incidentId={incidentId} />
      </QueryClientProvider>
    </ToastProvider>
  );
}

describe('IncidentDetailView component', () => {
  it('renders skeleton loading state initially', () => {
    renderIncidentDetailView('inc_001');
    expect(screen.getByTestId('incident-detail-skeleton')).toBeInTheDocument();
  });

  it('renders incident details once loaded from MSW', async () => {
    renderIncidentDetailView('inc_001');

    await waitFor(() => {
      expect(screen.getByText('Brush fire near Trail 4')).toBeInTheDocument();
    });

    // Narrative and metadata
    expect(
      screen.getByText(/Brush fire on the slope above Trail 4/i)
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(/F-7 · Margalla Rd/i).length
    ).toBeGreaterThan(0);
    expect(screen.getByText('Incident Narrative')).toBeInTheDocument();
    expect(screen.getByText('Incident Reported')).toBeInTheDocument();
    expect(screen.getByText('AI Multi-modal Verification')).toBeInTheDocument();
    expect(screen.getByText('Reporter Profile')).toBeInTheDocument();
  });

  it('enforces Privacy Rule 4: reporter identity masked by default', async () => {
    renderIncidentDetailView('inc_001');

    await waitFor(() => {
      expect(screen.getByText('PRIVACY PROTECTED')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Reporter identity is masked in accordance with Privacy Rule 4/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Reveal Identity/i })
    ).toBeInTheDocument();
  });

  it('opens audited reveal dialog when clicking Reveal Identity', async () => {
    renderIncidentDetailView('inc_001');

    await waitFor(() => {
      expect(screen.getByText('PRIVACY PROTECTED')).toBeInTheDocument();
    });

    const revealBtn = screen.getByRole('button', { name: /Reveal Identity/i });
    fireEvent.click(revealBtn);

    expect(
      screen.getByRole('heading', { name: /Reveal Reporter Identity/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Reporter identities are masked to protect community privacy/i)
    ).toBeInTheDocument();
  });

  it('opens moderation action dialog when clicking action button', async () => {
    renderIncidentDetailView('inc_001');

    await waitFor(() => {
      expect(screen.getByText('Brush fire near Trail 4')).toBeInTheDocument();
    });

    // Action bar buttons
    const rejectBtn = screen.getByRole('button', { name: /Reject/i });
    expect(rejectBtn).toBeInTheDocument();

    fireEvent.click(rejectBtn);

    // Dialog appears requiring reason
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Reject Incident/i })
      ).toBeInTheDocument();
    });
    expect(screen.getByText(/Primary Justification/i)).toBeInTheDocument();
  });

  it('enforces state-aware enabling of actions for under_review incident', async () => {
    renderIncidentDetailView('inc_001');

    await waitFor(() => {
      expect(screen.getByText('Brush fire near Trail 4')).toBeInTheDocument();
    });

    // Valid actions for under_review should be enabled
    expect(screen.getByRole('button', { name: /Approve Incident/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Reject Incident/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Mark Incident as False Report/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Remove Incident/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Mark Incident as Resolved/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /Re-run AI Review/i })).not.toBeDisabled();

    // Invalid action for under_review: Restore must be disabled
    expect(screen.getByRole('button', { name: /Restore Incident/i })).toBeDisabled();
  });

  it('reveals reporter identity with audit reason and does not persist to localStorage', async () => {
    renderIncidentDetailView('inc_001');

    await waitFor(() => {
      expect(screen.getByText('PRIVACY PROTECTED')).toBeInTheDocument();
    });

    // Open reveal dialog
    fireEvent.click(screen.getByRole('button', { name: /Reveal Identity/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Reveal Reporter Identity/i })).toBeInTheDocument();
    });

    // Enter audit notes
    const reasonInput = screen.getByPlaceholderText(/Add emergency dispatch ticket/i);
    fireEvent.change(reasonInput, { target: { value: 'Investigating coordinated false alarms' } });

    // Submit reveal
    const confirmBtn = screen.getByRole('button', { name: /Reveal Reporter & Audit/i });
    expect(confirmBtn).not.toBeDisabled();
    fireEvent.click(confirmBtn);

    // Verify reporter details are revealed
    await waitFor(() => {
      expect(screen.getByText('IDENTITY REVEALED')).toBeInTheDocument();
      expect(screen.getByText(/Reason: /i)).toBeInTheDocument();
    });

    // Verify Privacy Rule 4: nothing persisted in localStorage or sessionStorage
    expect(localStorage.getItem('reporter')).toBeNull();
    expect(localStorage.getItem('revealed_reporter')).toBeNull();
    expect(sessionStorage.getItem('reporter')).toBeNull();
  });

  it('resets reveal state when incident ID changes (auto-hide on navigation)', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });

    const { rerender } = render(
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <IncidentDetailView incidentId="inc_001" />
        </QueryClientProvider>
      </ToastProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Brush fire near Trail 4')).toBeInTheDocument();
    });

    // Reveal reporter on inc_001
    fireEvent.click(screen.getByRole('button', { name: /Reveal Identity/i }));
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Reveal Reporter Identity/i })).toBeInTheDocument();
    });
    fireEvent.change(screen.getByPlaceholderText(/Add emergency dispatch ticket/i), {
      target: { value: 'Audit investigation' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Reveal Reporter & Audit/i }));

    await waitFor(() => {
      expect(screen.getByText('IDENTITY REVEALED')).toBeInTheDocument();
    });

    // Navigate to inc_002
    rerender(
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <IncidentDetailView incidentId="inc_002" />
        </QueryClientProvider>
      </ToastProvider>
    );

    // Verify inc_002 starts with PRIVACY PROTECTED, reveal state was not carried over!
    await waitFor(() => {
      expect(screen.getByText('PRIVACY PROTECTED')).toBeInTheDocument();
    });
    expect(screen.queryByText('IDENTITY REVEALED')).not.toBeInTheDocument();
  });
});
