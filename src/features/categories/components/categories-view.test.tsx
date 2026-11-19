import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CategoriesView } from './categories-view';
import { ToastProvider } from '@/components/ui/toast';
import { resetMockCategories } from '@/mocks/categories-data';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/categories',
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

describe('CategoriesView component', () => {
  beforeEach(() => {
    resetMockCategories();
  });

  it('renders category taxonomy header, stats summary, and categories list', async () => {
    renderWithProviders(<CategoriesView />);

    expect(
      screen.getByRole('heading', { name: 'Category Taxonomy' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Configure incident classifications/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Accident')).toBeInTheDocument();
      expect(screen.getByText('Road Block')).toBeInTheDocument();
      expect(screen.getByText('Fire')).toBeInTheDocument();
      expect(screen.getByText('Flooding')).toBeInTheDocument();
    });

    // Check stats
    expect(screen.getByText('Total Defined')).toBeInTheDocument();
    expect(screen.getByText('Active Intake')).toBeInTheDocument();
    expect(screen.getByText('High Urgency')).toBeInTheDocument();
  });

  it('opens create category dialog when clicking Add Category', async () => {
    renderWithProviders(<CategoriesView />);

    await waitFor(() => {
      expect(screen.getByText('Accident')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /Add Category/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Create New Category')).toBeInTheDocument();
      expect(screen.getByLabelText(/Category Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Slug identifier/i)).toBeInTheDocument();
      expect(screen.getByText(/Live Marker & Chip Preview/i)).toBeInTheDocument();
    });
  });

  it('opens edit category dialog with immutable slug when clicking Edit', async () => {
    renderWithProviders(<CategoriesView />);

    await waitFor(() => {
      expect(screen.getByText('Fire')).toBeInTheDocument();
    });

    const editFireBtn = screen.getByRole('button', { name: 'Edit Fire' });
    fireEvent.click(editFireBtn);

    await waitFor(() => {
      expect(screen.getByText('Edit Category: Fire')).toBeInTheDocument();
      const slugInput = screen.getByLabelText(/Slug identifier/i);
      expect(slugInput).toBeDisabled();
      expect(screen.getByText('(Immutable)')).toBeInTheDocument();
    });
  });

  it('opens deactivate confirmation dialog when clicking Deactivate', async () => {
    renderWithProviders(<CategoriesView />);

    await waitFor(() => {
      expect(screen.getByText('Fire')).toBeInTheDocument();
    });

    const deactivateBtn = screen.getByRole('button', { name: 'Deactivate Fire' });
    fireEvent.click(deactivateBtn);

    await waitFor(() => {
      expect(screen.getByText(/Deactivate "Fire"\?/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Existing incidents classified under this category will retain their historical record/i)
      ).toBeInTheDocument();
    });
  });
});
