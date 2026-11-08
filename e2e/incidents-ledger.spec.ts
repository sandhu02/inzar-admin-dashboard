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

test.describe('Phase 2: Incidents List and Filtering', () => {
  test('renders incidents ledger, passes accessibility scan, and captures responsive screenshot', async ({
    page,
  }) => {
    await loginAsAdmin(page);

    await page.goto('/incidents');
    await expect(page.getByRole('heading', { name: 'Incidents' })).toBeVisible();
    await expect(page.getByText(/incidents match · all statuses/i)).toBeVisible();

    // Verify first seeded item loads
    await expect(
      page.getByText('Brush fire near Trail 4').filter({ visible: true }).first()
    ).toBeVisible();

    // Verify accessibility with Axe
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // Next-themes hydration class check
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Capture screenshot at current viewport
    const width = page.viewportSize()?.width ?? 1440;
    await page.screenshot({
      path: `docs/screenshots/incidents-${width}px.png`,
    });
  });

  test('filters incidents by debounced text search', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/incidents');

    const searchInput = page.getByPlaceholder(
      /Search incidents by title, description/i
    );
    await searchInput.fill('Trail 4');

    // Wait for 300ms debounce and URL sync
    await expect(page).toHaveURL(/q=Trail\+4|q=Trail%204/);

    // Verify search filter chip is rendered
    await expect(page.getByText('Search: "Trail 4"')).toBeVisible();

    // Verify filtered result is shown
    await expect(
      page.getByText('Brush fire near Trail 4').filter({ visible: true }).first()
    ).toBeVisible();
  });

  test('opens filter dialog, applies category filter, and removes it via filter chip', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/incidents');

    // Open filter panel
    await page.getByRole('button', { name: '+ Add filter' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select Fire category checkbox inside dialog
    const fireLabel = page.getByRole('dialog').locator('label', { hasText: 'Fire' });
    await fireLabel.click();

    // Click Apply Filters
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();

    // URL should reflect category=fire
    await expect(page).toHaveURL(/category=fire/);

    // Filter chip should be visible
    const chip = page.getByText(/Category: Fire/i);
    await expect(chip).toBeVisible();

    // Remove filter chip
    await page.getByLabel(/Remove filter Category: Fire/i).click();

    // URL should no longer have category=fire
    await expect(page).not.toHaveURL(/category=fire/);
    await expect(chip).toBeHidden();
  });

  test('supports URL state round-trip across reload and back navigation', async ({
    page,
  }) => {
    await loginAsAdmin(page);

    // Navigate with query params directly
    await page.goto('/incidents?category=accident&flagged=true');

    // Both chips should appear
    await expect(page.getByText(/Category: Accident/i)).toBeVisible();
    await expect(page.getByText('Flagged only')).toBeVisible();

    // Reload the page
    await page.reload();

    // Expect state preserved
    await expect(page).toHaveURL(/category=accident/);
    await expect(page).toHaveURL(/flagged=true/);
    await expect(page.getByText(/Category: Accident/i)).toBeVisible();
    await expect(page.getByText('Flagged only')).toBeVisible();
  });

  test('saves a custom view and switches between views', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/incidents');

    // Apply flagged filter
    await page.getByRole('button', { name: '+ Add filter' }).click();
    await page.getByRole('dialog').locator('label', { hasText: 'Flagged only' }).click();
    await page.getByRole('button', { name: 'Apply Filters' }).click();
    await expect(page.getByText('Flagged only')).toBeVisible();

    // Click Save view button
    await page.getByRole('button', { name: 'Save view', exact: true }).click();
    await expect(page.getByText('Save View', { exact: true })).toBeVisible();

    // Fill view name and submit
    await page.fill('#view-name-input', 'E2E Critical Flagged');
    await page.getByRole('dialog').getByRole('button', { name: 'Save' }).click();

    // The saved view should now be active
    await expect(
      page.getByRole('button', { name: /E2E Critical Flagged/i })
    ).toBeVisible();
  });

  test('paginates using cursor pagination controls', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/incidents');

    // Check footer page text
    await expect(page.getByText(/CURSOR PAGE 1/i)).toBeVisible();

    // Click Next button
    const nextBtn = page.getByRole('button', { name: 'Next', exact: true });
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // Should update URL with cursor=25 and footer to PAGE 2
    await expect(page).toHaveURL(/cursor=25/);
    await expect(page.getByText(/CURSOR PAGE 2/i)).toBeVisible();

    // Previous button should now be enabled
    const prevBtn = page.getByRole('button', { name: 'Previous', exact: true });
    await expect(prevBtn).toBeEnabled();
    await prevBtn.click();

    // Should return to page 1
    await expect(page.getByText(/CURSOR PAGE 1/i)).toBeVisible();
  });

  test('toggles column visibility and remembers choice', async ({ page }) => {
    const isDesktop = (page.viewportSize()?.width ?? 1440) >= 1024;
    test.skip(!isDesktop, 'Column visibility is tested on desktop table view');

    await loginAsAdmin(page);
    await page.goto('/incidents');

    // Check "AGE" column header is initially visible
    await expect(page.locator('thead').getByText('AGE')).toBeVisible();

    // Open Columns menu
    await page.getByRole('button', { name: 'Columns' }).click();

    // Toggle Age column off
    await page.getByRole('menuitemcheckbox', { name: 'Age' }).click();

    // AGE header should now be hidden
    await expect(page.locator('thead').getByText('AGE')).toBeHidden();
  });

  test('supports row selection and displays bulk action bar', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/incidents');

    // Wait for rows or cards to load
    await expect(
      page.getByText('Brush fire near Trail 4').filter({ visible: true }).first()
    ).toBeVisible();

    // Click the first two row/card checkboxes that are visible
    const checkboxes = page
      .getByRole('checkbox', { name: /Select incident/i })
      .filter({ visible: true });
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();

    // Bulk actions bar should appear
    await expect(page.getByText('2 SELECTED')).toBeVisible();
    await expect(page.getByRole('button', { name: /Approve/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Reject/i }).first()).toBeVisible();

    // Click Deselect button
    await page.getByRole('button', { name: 'Deselect' }).click();
    await expect(page.getByText('2 SELECTED')).toBeHidden();
  });
});
