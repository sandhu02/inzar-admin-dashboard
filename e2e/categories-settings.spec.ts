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

async function loginAsModerator(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('#email', 'moderator@inzar.app');
  await page.fill('#password', 'Password123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
}

test.describe('Phase 7: Categories and Global Settings', () => {
  test('categories taxonomy view renders, passes accessibility, and captures screenshots', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/categories');

    // Verify header and metric pills
    await expect(
      page.getByRole('heading', { name: 'Category Taxonomy' })
    ).toBeVisible();
    await expect(page.getByText('Total Defined')).toBeVisible();
    await expect(page.getByText('Active Intake')).toBeVisible();
    await expect(page.getByText('High Urgency')).toBeVisible();

    // Verify seeded categories in list with scoped locators
    await expect(
      page.locator('[data-category-id="cat_accident"]').getByText('Accident', { exact: true })
    ).toBeVisible();
    await expect(
      page.locator('[data-category-id="cat_road_block"]').getByText('Road Block', { exact: true })
    ).toBeVisible();
    await expect(
      page.locator('[data-category-id="cat_fire"]').getByText('Fire', { exact: true })
    ).toBeVisible();
    await expect(
      page.locator('[data-category-id="cat_flooding"]').getByText('Flooding', { exact: true })
    ).toBeVisible();

    const width = page.viewportSize()?.width ?? 1440;

    // Run axe accessibility audit
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Capture screenshot at current viewport
    await page.screenshot({
      path: `docs/screenshots/categories-${width}px.png`,
    });
  });

  test('user journey: add new category with custom TTL and verify in incident filter panel', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/categories');

    // Click Add Category
    await page.getByRole('button', { name: 'Add Category' }).click();

    // Dialog opens
    await expect(page.getByText('Create New Category')).toBeVisible();
    await expect(page.getByText('Live Marker & Chip Preview')).toBeVisible();

    // Fill Form fields
    await page.fill('#category-name', 'Landslide');
    await page.fill('#category-slug', 'landslide');
    await page.fill('#category-ttl', '300');
    await page.fill('#category-stale', '100');
    await page.selectOption('#category-urgency', 'high');

    // Submit Form
    await page.getByRole('button', { name: 'Create Category' }).click();

    // Verify Landslide is now in the list
    await expect(
      page.locator('[data-testid="categories-list"]').getByText('Landslide', { exact: true })
    ).toBeVisible();

    // Navigate to Incidents list and check filter panel
    await page.goto('/incidents');
    await expect(page.getByRole('heading', { name: 'Incidents' })).toBeVisible();

    const filterButton = page.getByRole('button', { name: /Add filter/i });
    await filterButton.click();

    // Filter dialog should display Landslide
    await expect(page.getByText('Filter Incidents')).toBeVisible();
    await expect(
      page.getByRole('dialog').getByText('Landslide', { exact: true })
    ).toBeVisible();
  });

  test('user journey: deactivate and reactivate category', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/categories');
    await expect(
      page.getByRole('heading', { name: 'Category Taxonomy' })
    ).toBeVisible();

    // Find Deactivate button for Accident
    const accidentRow = page.locator('[data-category-id="cat_accident"]');
    await expect(accidentRow).toBeVisible();

    const deactivateBtn = accidentRow.getByRole('button', { name: /Deactivate/i });
    await deactivateBtn.click();

    // Confirmation modal
    await expect(page.getByText('Deactivate "Accident"?')).toBeVisible();
    await expect(
      page.getByText(/Categories cannot be permanently deleted/i)
    ).toBeVisible();

    // Confirm deactivation
    await page.getByRole('button', { name: 'Deactivate Category' }).click();

    // Status should now be Deactivated
    await expect(accidentRow.getByText('Deactivated')).toBeVisible();

    // Now reactivate
    const reactivateBtn = accidentRow.getByRole('button', { name: /Reactivate/i });
    await reactivateBtn.click();

    await expect(page.getByText('Reactivate "Accident"?')).toBeVisible();
    await page.getByRole('button', { name: 'Reactivate Category' }).click();

    // Status should be Active
    await expect(accidentRow.getByText('Active')).toBeVisible();
  });

  test('global settings view renders, passes accessibility, and captures screenshots', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/settings');

    // Verify header and governance metadata
    await expect(
      page.getByRole('heading', { name: 'Global Settings' })
    ).toBeVisible();
    await expect(page.getByText(/Last updated by:/i)).toBeVisible();

    // Verify setting sections
    await expect(page.getByText('Intake & Moderation Pipeline')).toBeVisible();
    await expect(page.getByText('Geographic & Privacy Controls')).toBeVisible();
    await expect(page.getByText('Anti-Spam & Content Limits')).toBeVisible();
    await expect(page.getByText('Emergency Alerts & Notifications')).toBeVisible();

    const width = page.viewportSize()?.width ?? 1440;

    // Run axe accessibility audit
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Capture screenshot at current viewport
    await page.screenshot({
      path: `docs/screenshots/settings-${width}px.png`,
    });
  });

  test('user journey: change review_mode with confirmation modal and save settings', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/settings');

    // Click Auto-Approve mode button
    const autoApproveBtn = page.getByRole('button', { name: /Auto-Approve/i });
    await autoApproveBtn.click();

    // Modal opens with operational safety notice
    await expect(
      page.getByText('Switch to Auto-Approve Review Mode?')
    ).toBeVisible();
    await expect(page.getByText(/Operational Safety Impact:/i)).toBeVisible();

    // Confirm mode change
    await page.getByRole('button', { name: 'Confirm Mode Change' }).click();

    // Dirty bar appears
    await expect(
      page.getByText('Careful — you have unsaved configuration changes!')
    ).toBeVisible();

    // Click Save Settings
    await page.getByRole('button', { name: 'Save Settings' }).click();

    // Dirty bar should hide after save
    await expect(
      page.getByText('Careful — you have unsaved configuration changes!')
    ).not.toBeVisible();

    // Verify top status pill reflects Auto-Approve Mode
    await expect(page.getByText('Auto-Approve Mode')).toBeVisible();

    // Restore back to manual for clean test teardown
    const manualBtn = page.getByRole('button', { name: /Manual Review/i });
    await manualBtn.click();
    await page.getByRole('button', { name: 'Confirm Mode Change' }).click();
    await page.getByRole('button', { name: 'Save Settings' }).click();
    await expect(page.getByText('Manual Mode')).toBeVisible();
  });

  test('user journey: modify numeric setting, verify dirty bar, reset to default, and discard', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/settings');

    // Modify Maximum Search Radius
    const maxRadiusInput = page.locator('#max_search_radius_km');
    await maxRadiusInput.fill('75');

    // Dirty bar appears
    await expect(
      page.getByText('Careful — you have unsaved configuration changes!')
    ).toBeVisible();

    // Click Reset on max_search_radius_km card
    const resetRadiusBtn = page
      .locator('[data-setting-key="max_search_radius_km"]')
      .getByRole('button', { name: /Reset/i });
    await resetRadiusBtn.click();

    // Should reset to 50
    await expect(maxRadiusInput).toHaveValue('50');

    // If we change it again and click Discard
    await maxRadiusInput.fill('120');
    await expect(
      page.getByText('Careful — you have unsaved configuration changes!')
    ).toBeVisible();

    await page.getByRole('button', { name: 'Discard' }).click();

    // Dirty bar disappears
    await expect(
      page.getByText('Careful — you have unsaved configuration changes!')
    ).not.toBeVisible();
  });

  test('moderator access restriction: blocked from categories and settings pages', async ({
    page,
  }) => {
    await loginAsModerator(page);

    // Try navigating to /categories
    await page.goto('/categories');
    await expect(
      page.getByText(/403/i).or(page.getByText(/Access Restricted/i)).or(page.getByText(/Forbidden/i))
    ).toBeVisible();

    // Try navigating to /settings
    await page.goto('/settings');
    await expect(
      page.getByText(/403/i).or(page.getByText(/Access Restricted/i)).or(page.getByText(/Forbidden/i))
    ).toBeVisible();
  });
});
