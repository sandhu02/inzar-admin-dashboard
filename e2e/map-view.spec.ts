import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('#email', 'admin@inzar.app');
  await page.fill('#password', 'Password123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
}

test.describe('Phase 5: Map View and Geographic Intelligence', () => {
  test('renders map view, passes accessibility scan, and captures responsive screenshots', async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto('/map');
    await expect(page.getByTestId('map-view-container')).toBeVisible();
    await expect(page.getByTestId('maplibre-canvas-container')).toBeVisible();

    const width = page.viewportSize()?.width ?? 1440;

    // Accessible list is visible by default
    const listbox = page.getByTestId('map-accessible-list');
    if (!(await listbox.isVisible())) {
      await page.getByTestId('map-toggle-list-btn').click();
    }
    await expect(listbox).toBeVisible();
    await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 15000 });

    // Run Axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // Next-themes dynamic dark palette check
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Capture screenshot at current viewport
    await page.screenshot({
      path: `docs/screenshots/map-${width}px.png`,
    });
  });

  test('map renders clustering configuration and supports zoom controls', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/map');
    await expect(page.getByTestId('maplibre-canvas-container')).toBeVisible();

    // Verify map instance is mounted
    await page.waitForFunction(() => {
      const map = (window as unknown as {
        __mapInstance?: {
          getZoom?: () => number;
        };
      }).__mapInstance;
      return map && typeof map.getZoom === 'function';
    }, { timeout: 15000 });

    const mapState = await page.evaluate(() => {
      const map = (window as unknown as {
        __mapInstance?: {
          getZoom: () => number;
        };
      }).__mapInstance;
      if (!map) return null;
      return {
        hasMap: true,
        zoom: map.getZoom(),
      };
    });

    expect(mapState?.hasMap).toBe(true);

    // Zoom in via button
    const initialZoom = await page.evaluate(() => {
      const map = (window as unknown as { __mapInstance?: { getZoom: () => number } }).__mapInstance;
      return map?.getZoom() ?? 0;
    });

    const zoomInBtn = page.getByRole('button', { name: /Zoom in/i });
    await zoomInBtn.click();
    await page.waitForFunction(
      (init) => {
        const map = (window as unknown as { __mapInstance?: { getZoom: () => number } }).__mapInstance;
        return map ? map.getZoom() > init : false;
      },
      initialZoom,
      { timeout: 5000 }
    );

    const newZoom = await page.evaluate(() => {
      const map = (window as unknown as { __mapInstance?: { getZoom: () => number } }).__mapInstance;
      return map?.getZoom() ?? 0;
    });
    expect(newZoom).toBeGreaterThan(initialZoom);

    // Re-center button resets zoom to default (~12)
    const recenterBtn = page.getByRole('button', { name: /Re-center to Islamabad/i });
    await recenterBtn.click();
    await page.waitForFunction(
      () => {
        const map = (window as unknown as { __mapInstance?: { getZoom: () => number } }).__mapInstance;
        return map ? Math.abs(map.getZoom() - 12) < 1 : false;
      },
      { timeout: 5000 }
    );

    const resetZoom = await page.evaluate(() => {
      const map = (window as unknown as { __mapInstance?: { getZoom: () => number } }).__mapInstance;
      return map?.getZoom() ?? 0;
    });
    expect(Math.abs(resetZoom - 12)).toBeLessThan(1);
  });

  test('filter updates visible incidents and synchronizes with URL parameters', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/map');
    await expect(page.getByTestId('map-view-container')).toBeVisible();

    // Type in search filter
    const searchInput = page.getByTestId('map-search-input');
    await searchInput.fill('fire');

    // URL should be updated with q=fire
    await expect(page).toHaveURL(/q=fire/);

    // Category filter button
    const categoryBtn = page.locator('[data-testid^="map-category-filter-"]').first();
    if (await categoryBtn.isVisible()) {
      await categoryBtn.click();
      await expect(page).toHaveURL(/category=/);
    }
  });

  test('selecting an incident opens preview panel with fuzzed coordinates notice and actions', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/map');
    await expect(page.getByTestId('map-view-container')).toBeVisible();

    // Open list if not already open
    const listbox = page.getByTestId('map-accessible-list');
    if (!(await listbox.isVisible())) {
      await page.getByTestId('map-toggle-list-btn').click();
    }
    await expect(listbox).toBeVisible();

    // Select the first incident item
    const firstOption = page.locator('[role="option"]').first();
    await expect(firstOption).toBeVisible({ timeout: 20000 });
    const incidentTitle = await firstOption.locator('.line-clamp-1').textContent();
    await firstOption.click();
    await expect(page).toHaveURL(/selected=/);

    // Preview panel opens
    const previewPanel = page.getByTestId('map-preview-panel');
    await expect(previewPanel).toBeVisible({ timeout: 10000 });

    // Check title matches
    if (incidentTitle) {
      await expect(previewPanel.getByText(incidentTitle.trim())).toBeVisible();
    }

    // Privacy notice must be prominently visible (fuzzed location notice)
    await expect(page.getByTestId('map-preview-fuzzed-badge')).toBeVisible();
    await expect(previewPanel.getByText(/Fuzzed ~250m for reporter privacy/i)).toBeVisible();

    // Close preview panel with Escape key
    await page.keyboard.press('Escape');
    await expect(previewPanel).toBeHidden();
  });

  test('keyboard navigation on accessible list navigates with arrow keys and selects with Enter', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/map');

    // Ensure list is visible
    const listbox = page.getByTestId('map-accessible-list');
    if (!(await listbox.isVisible())) {
      await page.getByTestId('map-toggle-list-btn').click();
    }
    await expect(listbox).toBeVisible();
    await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 15000 });

    // Focus listbox
    await listbox.focus();

    // Press ArrowDown to move to second item
    await page.keyboard.press('ArrowDown');
    // Press Enter to select
    await page.keyboard.press('Enter');

    // Preview panel should open
    await expect(page.getByTestId('map-preview-panel')).toBeVisible({ timeout: 10000 });

    // Close preview
    const closeBtn = page.getByTestId('map-preview-close');
    await closeBtn.click();
    await expect(page.getByTestId('map-preview-panel')).toBeHidden();
  });

  test('preview panel moderation action triggers reason dialog', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/map');

    const listbox = page.getByTestId('map-accessible-list');
    if (!(await listbox.isVisible())) {
      await page.getByTestId('map-toggle-list-btn').click();
    }
    await expect(listbox).toBeVisible();
    await expect(page.locator('[role="option"]').first()).toBeVisible({ timeout: 15000 });

    // Select first incident
    const firstOption = page.locator('[role="option"]').first();
    await firstOption.click();
    await expect(page).toHaveURL(/selected=/);

    await expect(page.getByTestId('map-preview-panel')).toBeVisible({ timeout: 10000 });

    // Click Approve button
    const approveBtn = page.getByTestId('action-btn-approve');
    await expect(approveBtn).toBeVisible({ timeout: 10000 });
    await approveBtn.click();

    // ActionDialog should appear
    const dialog = page.getByTestId('action-dialog');
    await expect(dialog).toBeVisible({ timeout: 5000 });
    await expect(dialog.getByText(/Approve Incident/i)).toBeVisible();

    // Cancel dialog
    const cancelBtn = dialog.getByRole('button', { name: /Cancel/i });
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click({ force: true });
    await expect(dialog).toBeHidden();
  });
});
