import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSavedViews, SYSTEM_VIEWS } from './use-saved-views';

describe('useSavedViews hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with system views', () => {
    const { result } = renderHook(() => useSavedViews());
    expect(result.current.views.length).toBeGreaterThanOrEqual(SYSTEM_VIEWS.length);
    expect(result.current.views[0]?.id).toBe('default');
  });

  it('saves a new custom view to localStorage', () => {
    const { result } = renderHook(() => useSavedViews());

    let createdId = '';
    act(() => {
      const created = result.current.saveCurrentView('High Priority Fire', {
        category_id: ['fire'],
        flagged: true,
      });
      createdId = created.id;
    });

    expect(result.current.customViews.length).toBe(1);
    expect(result.current.customViews[0]?.name).toBe('High Priority Fire');
    expect(result.current.views.some((v) => v.id === createdId)).toBe(true);
  });

  it('renames an existing custom view', () => {
    const { result } = renderHook(() => useSavedViews());

    let createdId = '';
    act(() => {
      const created = result.current.saveCurrentView('Old Name', { q: 'traffic' });
      createdId = created.id;
    });

    act(() => {
      result.current.renameView(createdId, 'New Renamed View');
    });

    const updated = result.current.views.find((v) => v.id === createdId);
    expect(updated?.name).toBe('New Renamed View');
  });

  it('deletes a custom view', () => {
    const { result } = renderHook(() => useSavedViews());

    let createdId = '';
    act(() => {
      const created = result.current.saveCurrentView('To Be Deleted', {});
      createdId = created.id;
    });

    expect(result.current.views.some((v) => v.id === createdId)).toBe(true);

    act(() => {
      result.current.deleteView(createdId);
    });

    expect(result.current.views.some((v) => v.id === createdId)).toBe(false);
  });

  it('sets and remembers default view', () => {
    const { result } = renderHook(() => useSavedViews());

    act(() => {
      result.current.setDefaultView('under_review');
    });

    expect(result.current.defaultViewId).toBe('under_review');
    const underReviewView = result.current.views.find((v) => v.id === 'under_review');
    expect(underReviewView?.isDefault).toBe(true);
  });
});
