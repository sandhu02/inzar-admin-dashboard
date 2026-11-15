import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { UsersLedger } from './users-ledger';
import { ToastProvider } from '@/components/ui/toast';
import { resetMockUsers } from '@/mocks/users-data';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ id: 'usr_admin_001' }),
}));

function renderWithProviders(ui: React.ReactElement, searchParams: string = '') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
    },
  });

  return render(
    <NuqsTestingAdapter searchParams={searchParams}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          {ui}
        </ToastProvider>
      </QueryClientProvider>
    </NuqsTestingAdapter>
  );
}

describe('UsersLedger component', () => {
  beforeEach(() => {
    resetMockUsers();
    localStorage.clear();
  });

  it('renders user management header and statistics bar', async () => {
    renderWithProviders(<UsersLedger />);

    expect(screen.getByRole('heading', { name: 'User Management' })).toBeInTheDocument();
    expect(screen.getByText(/Manage citizen reporters, moderator staff/i)).toBeInTheDocument();

    // Stats bar cards
    await waitFor(() => {
      expect(screen.getByTestId('stat-total-users')).toBeInTheDocument();
      expect(screen.getByTestId('stat-active-users')).toBeInTheDocument();
      expect(screen.getByTestId('stat-suspended-users')).toBeInTheDocument();
      expect(screen.getByTestId('stat-verified-users')).toBeInTheDocument();
      expect(screen.getByTestId('stat-staff-users')).toBeInTheDocument();
    });
  });

  it('renders table columns and seeded users', async () => {
    renderWithProviders(<UsersLedger />);

    await waitFor(() => {
      expect(screen.getAllByText('Sana Rehman').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Ali Khan').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Zahid Mahmood').length).toBeGreaterThan(0);
    });

    // Column headers
    expect(screen.getByText('Citizen / Staff')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Role')).toBeInTheDocument();
    expect(screen.getAllByText('Verified').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Status').length).toBeGreaterThan(0);
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Joined')).toBeInTheDocument();
  });

  it('renders search input and filter dropdowns', () => {
    renderWithProviders(<UsersLedger />);

    expect(screen.getByTestId('users-search-input')).toBeInTheDocument();
    expect(screen.getByTestId('filter-role-select')).toBeInTheDocument();
    expect(screen.getByTestId('filter-status-select')).toBeInTheDocument();
    expect(screen.getByTestId('filter-verified-select')).toBeInTheDocument();
    expect(screen.getByTestId('filter-date-select')).toBeInTheDocument();
  });

  it('filters users by role selection via URL search params', async () => {
    renderWithProviders(<UsersLedger />, '?role=admin');

    await waitFor(() => {
      expect(screen.getAllByText('Sana Rehman').length).toBeGreaterThan(0);
    });

    // Zahid Mahmood (user role) should not be displayed
    expect(screen.queryByText('Zahid Mahmood')).not.toBeInTheDocument();
    expect(screen.queryByText('Ali Khan')).not.toBeInTheDocument();
  });

  it('filters users by status selection (suspended only)', async () => {
    renderWithProviders(<UsersLedger />, '?status=suspended');

    await waitFor(() => {
      // Bilal Ahmed is suspended in seeded fixtures
      expect(screen.getAllByText('Bilal Ahmed').length).toBeGreaterThan(0);
    });

    // Sana Rehman is active, so should not be in suspended list
    expect(screen.queryByText('Sana Rehman')).not.toBeInTheDocument();
    expect(screen.queryByText('Zahid Mahmood')).not.toBeInTheDocument();
  });
});
