import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ModerationQueueView } from './moderation-queue-view';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('ModerationQueueView component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders moderation queue interface with pending items and stats', async () => {
    render(<ModerationQueueView />, { wrapper: createWrapper() });

    expect(screen.getByRole('heading', { name: /Moderation Queue/i })).toBeInTheDocument();

    // Wait for MSW to return items
    await waitFor(() => {
      expect(screen.getByTestId('queue-count-badge')).toBeInTheDocument();
      expect(screen.getByTestId('queue-active-card')).toBeInTheDocument();
    });

    // Check action buttons
    expect(screen.getByTestId('queue-approve-btn')).toBeInTheDocument();
    expect(screen.getByTestId('queue-reject-btn')).toBeInTheDocument();
    expect(screen.getByTestId('queue-mark-false-btn')).toBeInTheDocument();
    expect(screen.getByTestId('queue-shortcuts-trigger')).toBeInTheDocument();
  });

  it('opens keyboard shortcuts modal when clicking shortcut trigger or pressing ?', async () => {
    render(<ModerationQueueView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('queue-active-card')).toBeInTheDocument();
    });

    // Click shortcuts button
    fireEvent.click(screen.getByTestId('queue-shortcuts-trigger'));

    expect(
      screen.getByRole('heading', { name: /Moderation Keyboard Shortcuts/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Approve incident and broadcast/i)).toBeInTheDocument();

    // Close with Esc
    fireEvent.keyDown(window, { key: 'Escape' });
  });

  it('supports approve action with optimistic advance and undo window', async () => {
    render(<ModerationQueueView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('queue-active-card')).toBeInTheDocument();
    });

    // Press 'A' to approve current item
    fireEvent.keyDown(window, { key: 'a' });

    // Undo toast should appear
    await waitFor(() => {
      expect(screen.getByTestId('queue-undo-toast')).toBeInTheDocument();
      expect(screen.getByTestId('queue-undo-button')).toBeInTheDocument();
    });

    // Click Undo
    fireEvent.click(screen.getByTestId('queue-undo-button'));

    // Toast should disappear
    await waitFor(() => {
      expect(screen.queryByTestId('queue-undo-toast')).toBeNull();
    });
  });

  it('opens quick reason picker on reject (R key) and selects preset with number keys', async () => {
    render(<ModerationQueueView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('queue-active-card')).toBeInTheDocument();
    });

    // Press 'R' to open reject dialog
    fireEvent.keyDown(window, { key: 'r' });

    await waitFor(() => {
      expect(screen.getByTestId('quick-reason-picker-dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Reject Incident Report/i })).toBeInTheDocument();
    });

    // Press '2' key to select second preset
    fireEvent.keyDown(window, { key: '2' });
    const preset2 = screen.getByTestId('quick-reason-preset-2');
    expect(preset2).toHaveAttribute('aria-checked', 'true');

    // Press Enter to confirm decision
    fireEvent.keyDown(window, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.queryByTestId('quick-reason-picker-dialog')).toBeNull();
    });
  });

  it('opens quick reason picker on mark false (F key)', async () => {
    render(<ModerationQueueView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('queue-active-card')).toBeInTheDocument();
    });

    // Press 'F' to open mark false dialog
    fireEvent.keyDown(window, { key: 'f' });

    await waitFor(() => {
      expect(screen.getByTestId('quick-reason-picker-dialog')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Mark as False Report/i })).toBeInTheDocument();
    });

    // Cancel with Esc
    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByTestId('quick-reason-picker-dialog')).toBeNull();
    });
  });

  it('disables shortcut handling when focused in text inputs', async () => {
    render(<ModerationQueueView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('queue-active-card')).toBeInTheDocument();
    });

    // Open reject dialog
    fireEvent.keyDown(window, { key: 'r' });

    await waitFor(() => {
      expect(screen.getByTestId('quick-reason-notes-input')).toBeInTheDocument();
    });

    const notesInput = screen.getByTestId('quick-reason-notes-input');
    notesInput.focus();

    // Type 'a' into the notes textarea - must not trigger approve
    fireEvent.keyDown(notesInput, { key: 'a' });

    // Toast should not appear
    expect(screen.queryByTestId('queue-undo-toast')).toBeNull();
  });

  it('supports category filtering', async () => {
    render(<ModerationQueueView />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId('queue-active-card')).toBeInTheDocument();
    });

    const fireTab = screen.getByTestId('queue-category-tab-fire');
    fireEvent.click(fireTab);
    expect(fireTab).toHaveAttribute('aria-selected', 'true');
  });
});
