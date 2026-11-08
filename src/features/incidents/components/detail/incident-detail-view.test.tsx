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
});
