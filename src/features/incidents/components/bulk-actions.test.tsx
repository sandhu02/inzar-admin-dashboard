import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IncidentBulkActions } from './incident-bulk-actions';
import { BulkActionDialog, BulkPartialFailureDialog } from './bulk-action-dialog';

describe('IncidentBulkActions toolbar', () => {
  it('renders nothing when selectedCount is 0', () => {
    const { container } = render(
      <IncidentBulkActions
        selectedCount={0}
        onClearSelection={vi.fn()}
        onBulkAction={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders action buttons and selection count when items are selected', () => {
    const onClear = vi.fn();
    const onAction = vi.fn();

    render(
      <IncidentBulkActions
        selectedCount={3}
        onClearSelection={onClear}
        onBulkAction={onAction}
      />
    );

    expect(screen.getByText('3 SELECTED')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Deselect/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Approve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reject/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mark false/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Remove/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Deselect/i }));
    expect(onClear).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: /Approve/i }));
    expect(onAction).toHaveBeenCalledWith('approve');
  });
});

describe('BulkActionDialog component', () => {
  it('renders dialog with action title, count, and presets', () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <BulkActionDialog
        action="approve"
        selectedCount={4}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByRole('heading', { name: /Bulk Approve Incidents \(4\)/i })).toBeInTheDocument();
    expect(screen.getByText(/Targeting/i)).toBeInTheDocument();
    expect(screen.getByText(/Primary Justification/i)).toBeInTheDocument();

    // Default preset reason is already selected
    const submitBtn = screen.getByRole('button', { name: /Approve Selected \(4\)/i });
    expect(submitBtn).not.toBeDisabled();
  });

  it('requires custom explanation when "Other" preset is selected', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <BulkActionDialog
        action="reject"
        selectedCount={2}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Other' } });

    // Submit button should be disabled until explanation is entered
    const submitBtn = screen.getByRole('button', { name: /Reject Selected \(2\)/i });
    expect(submitBtn).toBeDisabled();

    // Fill in custom reason
    const textarea = screen.getByPlaceholderText(/Specify the justification/i);
    fireEvent.change(textarea, { target: { value: 'Cross-agency deduplication' } });

    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('reject', 'Cross-agency deduplication');
    });
  });
});

describe('BulkPartialFailureDialog component', () => {
  it('renders partial success summary and lists failed incidents with conflict details', () => {
    const onClose = vi.fn();
    const failures = [
      {
        id: 'inc_007',
        error: {
          code: 'STATE_CONFLICT',
          message: 'Cannot approve a removed incident. Restore it first.',
        },
      },
      {
        id: 'inc_099',
        error: {
          code: 'NOT_FOUND',
          message: 'Incident record not found in database.',
        },
      },
    ];

    render(
      <BulkPartialFailureDialog
        open={true}
        onOpenChange={onClose}
        succeededCount={5}
        failures={failures}
        action="approve"
      />
    );

    expect(screen.getByText(/Bulk APPROVE Results/i)).toBeInTheDocument();
    expect(screen.getByText('5 items')).toBeInTheDocument();
    expect(screen.getByText('2 items')).toBeInTheDocument();

    // Failed items listed
    expect(screen.getByText('inc_007')).toBeInTheDocument();
    expect(screen.getByText('STATE_CONFLICT')).toBeInTheDocument();
    expect(screen.getByText('Cannot approve a removed incident. Restore it first.')).toBeInTheDocument();

    expect(screen.getByText('inc_099')).toBeInTheDocument();
    expect(screen.getByText('NOT_FOUND')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Acknowledge & Close/i }));
    expect(onClose).toHaveBeenCalledWith(false);
  });
});
