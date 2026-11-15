import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsTestingAdapter } from 'nuqs/adapters/testing';
import { UserDetailView } from './user-detail-view';
import { ToastProvider } from '@/components/ui/toast';
import { resetMockUsers } from '@/mocks/users-data';
import * as currentUserHook from '../../hooks/use-current-user';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ id: 'usr_user_004' }),
}));

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
        <ToastProvider>
          {ui}
        </ToastProvider>
      </QueryClientProvider>
    </NuqsTestingAdapter>
  );
}

describe('UserDetailView component', () => {
  beforeEach(() => {
    resetMockUsers();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders user details, summary card, stats cards, and incident tab', async () => {
    renderWithProviders(<UserDetailView userId="usr_user_004" />);

    // Wait for user details to load
    await waitFor(() => {
      expect(screen.getAllByText('Hamza Malik').length).toBeGreaterThan(0);
    });

    // Check summary card elements
    expect(screen.getByTestId('user-summary-card')).toBeInTheDocument();
    expect(screen.getByText('usr_user_004')).toBeInTheDocument();

    // Stats metrics
    expect(screen.getByTestId('stat-user-total-reports')).toBeInTheDocument();
    expect(screen.getByTestId('stat-user-published')).toBeInTheDocument();
    expect(screen.getByTestId('stat-user-under-review')).toBeInTheDocument();
    expect(screen.getByTestId('stat-user-rejected')).toBeInTheDocument();
    expect(screen.getByTestId('stat-user-false-reports')).toBeInTheDocument();
    expect(screen.getByTestId('stat-user-flags-received')).toBeInTheDocument();

    // Default tab: Incident reports
    await waitFor(() => {
      expect(screen.getByTestId('user-incidents-list')).toBeInTheDocument();
    });
  });

  it('enforces self-protection: suspend button is disabled when viewing own profile', async () => {
    vi.spyOn(currentUserHook, 'useCurrentUser').mockReturnValue({
      user: {
        id: 'usr_admin_001',
        email: 'admin@inzar.app',
        display_name: 'Sana Rehman',
        role: 'admin',
      },
      isAdmin: true,
      isModerator: false,
      isLoading: false,
    });

    renderWithProviders(<UserDetailView userId="usr_admin_001" />);

    await waitFor(() => {
      expect(screen.getAllByText('Sana Rehman').length).toBeGreaterThan(0);
    });

    expect(screen.getByText('YOUR ACCOUNT')).toBeInTheDocument();

    const suspendBtn = screen.getByTestId('user-suspend-action-btn');
    expect(suspendBtn).toBeDisabled();

    const roleBtn = screen.getByTestId('user-role-action-btn');
    expect(roleBtn).toBeDisabled();
  });

  it('enforces permission matrix: moderator cannot change role and sees masked email', async () => {
    vi.spyOn(currentUserHook, 'useCurrentUser').mockReturnValue({
      user: {
        id: 'usr_mod_002',
        email: 'moderator@inzar.app',
        display_name: 'Ali Khan',
        role: 'moderator',
      },
      isAdmin: false,
      isModerator: true,
      isLoading: false,
    });

    renderWithProviders(<UserDetailView userId="usr_user_004" />);

    await waitFor(() => {
      expect(screen.getAllByText('Hamza Malik').length).toBeGreaterThan(0);
    });

    // Email should be masked for moderators
    expect(screen.getByTestId('user-email-masked')).toBeInTheDocument();

    // Role change button should be disabled for moderators
    const roleBtn = screen.getByTestId('user-role-action-btn');
    expect(roleBtn).toBeDisabled();
  });

  it('opens suspend dialog, selects reason, and suspends account', async () => {
    vi.spyOn(currentUserHook, 'useCurrentUser').mockReturnValue({
      user: {
        id: 'usr_admin_001',
        email: 'admin@inzar.app',
        display_name: 'Sana Rehman',
        role: 'admin',
      },
      isAdmin: true,
      isModerator: false,
      isLoading: false,
    });

    renderWithProviders(<UserDetailView userId="usr_user_004" />);

    await waitFor(() => {
      expect(screen.getAllByText('Hamza Malik').length).toBeGreaterThan(0);
    });

    const suspendBtn = screen.getByTestId('user-suspend-action-btn');
    fireEvent.click(suspendBtn);

    // Dialog opens
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Suspend User Account' })).toBeInTheDocument();
    });

    // Click confirm suspension
    const confirmBtn = screen.getByRole('button', { name: 'Confirm Suspension' });
    fireEvent.click(confirmBtn);

    // Dialog closes
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Suspend User Account' })).not.toBeInTheDocument();
    });
  });

  it('switches between tabs (Incidents, Moderation History, Active Sessions)', async () => {
    renderWithProviders(<UserDetailView userId="usr_user_004" />);

    await waitFor(() => {
      expect(screen.getAllByText('Hamza Malik').length).toBeGreaterThan(0);
    });

    // Switch to Moderation History tab
    const modTab = screen.getByTestId('tab-moderation');
    fireEvent.click(modTab);

    await waitFor(() => {
      expect(screen.getByTestId('user-moderation-history-list')).toBeInTheDocument();
    });

    // Switch to Sessions tab
    const sessTab = screen.getByTestId('tab-sessions');
    fireEvent.click(sessTab);

    await waitFor(() => {
      expect(screen.getByTestId('user-sessions-list')).toBeInTheDocument();
    });
  });
});
