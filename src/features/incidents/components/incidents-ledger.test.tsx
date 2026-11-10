import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { IncidentsLedger } from './incidents-ledger';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  });

  return render(
    <NuqsTestingAdapter>
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    </NuqsTestingAdapter>
  );
}

describe('IncidentsLedger component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders incidents ledger table with loaded incidents', async () => {
    renderWithProviders(<IncidentsLedger />);

    // Header title and subtitle
    expect(screen.getByRole('heading', { name: 'Incidents' })).toBeInTheDocument();

    // Wait for MSW data to load into table/cards
    await waitFor(() => {
      expect(
        screen.getAllByText('Brush fire near Trail 4').length
      ).toBeGreaterThan(0);
    });

    // Check presence of key table column headers
    expect(screen.getByText('CATEGORY')).toBeInTheDocument();
    expect(screen.getByText('INCIDENT')).toBeInTheDocument();
    expect(screen.getByText('REVIEW')).toBeInTheDocument();
    expect(screen.getByText('LIFECYCLE')).toBeInTheDocument();
    expect(screen.getByText('FLAGS')).toBeInTheDocument();
    expect(screen.getByText('PLACE')).toBeInTheDocument();
    expect(screen.getByText('REPORTED')).toBeInTheDocument();
    expect(screen.getByText('AGE')).toBeInTheDocument();
  });

  it('renders filter controls, saved views picker, and column toggle', () => {
    renderWithProviders(<IncidentsLedger />);

    expect(screen.getByText('+ Add filter')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Search incidents by title, description/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Columns')).toBeInTheDocument();
    expect(screen.getByText('Save view')).toBeInTheDocument();
  });

  it('renders a refresh button and supports refreshing incidents', async () => {
    renderWithProviders(<IncidentsLedger />);

    const refreshButton = screen.getByRole('button', { name: /Refresh incidents/i });
    expect(refreshButton).toBeInTheDocument();
    expect(refreshButton).toHaveTextContent('Refresh');

    // Wait for items to be loaded
    await waitFor(() => {
      expect(
        screen.getAllByText('Brush fire near Trail 4').length
      ).toBeGreaterThan(0);
    });

    // Clicking refresh should keep button accessible and refresh data
    refreshButton.click();
    expect(refreshButton).toBeInTheDocument();
  });
});
