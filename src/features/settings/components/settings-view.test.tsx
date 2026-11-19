import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsView } from './settings-view';
import { ToastProvider } from '@/components/ui/toast';
import { resetMockSettings } from '@/mocks/settings-data';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/settings',
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{ui}</ToastProvider>
    </QueryClientProvider>
  );
}

describe('SettingsView component', () => {
  beforeEach(() => {
    resetMockSettings();
  });

  it('renders global settings header, governance card, and settings sections', async () => {
    renderWithProviders(<SettingsView />);

    expect(
      screen.getByRole('heading', { name: 'Global Settings' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Admin platform runtime controls/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Incident Intake Review Mode')).toBeInTheDocument();
      expect(
        screen.getByText('Public Coordinate Fuzzing Distance')
      ).toBeInTheDocument();
      expect(screen.getByText('Maximum Search Radius')).toBeInTheDocument();
      expect(
        screen.getByText('Hourly Submission Rate Limit')
      ).toBeInTheDocument();
    });

    expect(screen.getByText(/Last updated by:/i)).toBeInTheDocument();
  });

  it('opens confirmation modal when changing intake review mode', async () => {
    renderWithProviders(<SettingsView />);

    await waitFor(() => {
      expect(screen.getByText('Auto-Approve')).toBeInTheDocument();
    });

    const autoApproveBtn = screen.getByRole('button', { name: /Auto-Approve/i });
    fireEvent.click(autoApproveBtn);

    await waitFor(() => {
      expect(
        screen.getByText('Switch to Auto-Approve Review Mode?')
      ).toBeInTheDocument();
      expect(screen.getByText(/Operational Safety Impact:/i)).toBeInTheDocument();
    });
  });

  it('displays sticky dirty-state bar when modifications are made, and hides on discard', async () => {
    renderWithProviders(<SettingsView />);

    await waitFor(() => {
      expect(screen.getByText('Maximum Search Radius')).toBeInTheDocument();
    });

    // Dirty bar should not be initially visible
    expect(
      screen.queryByRole('region', { name: 'Unsaved settings changes toolbar' })
    ).not.toBeInTheDocument();

    // Modify a numeric field
    const maxRadiusInput = screen.getByDisplayValue('50');
    fireEvent.change(maxRadiusInput, { target: { value: '75' } });

    // Dirty bar should appear
    await waitFor(() => {
      expect(
        screen.getByRole('region', {
          name: 'Unsaved settings changes toolbar',
        })
      ).toBeInTheDocument();
      expect(screen.getByText(/Careful — you have unsaved configuration changes!/i)).toBeInTheDocument();
    });

    // Click Discard
    const discardBtn = screen.getByRole('button', { name: /Discard/i });
    fireEvent.click(discardBtn);

    // Dirty bar should disappear and input revert
    await waitFor(() => {
      expect(
        screen.queryByRole('region', {
          name: 'Unsaved settings changes toolbar',
        })
      ).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    });
  });
});
