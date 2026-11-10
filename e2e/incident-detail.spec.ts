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

test.describe('Phase 3: Incident Detail and Moderation Actions', () => {
  test('renders incident detail in side drawer and passes accessibility scan', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/incidents');

    // Click on the first incident row or card to open drawer
    const width = page.viewportSize()?.width ?? 1440;
    if (width >= 1024) {
      const firstRow = page.locator('tbody tr').first();
      await firstRow.click();
    } else {
      const firstCard = page.locator('[data-testid="incident-card"]').first();
      await firstCard.click();
    }

    // Drawer should open and display incident details
    const drawer = page.getByRole('dialog', { name: /Incident Details/i });
    await expect(drawer).toBeVisible();

    // Verify key sections inside drawer
    await expect(drawer.getByRole('button', { name: /Approve Incident/i })).toBeVisible();
    await expect(drawer.getByRole('button', { name: /Reject Incident/i })).toBeVisible();
    await expect(drawer.getByText(/Location Intelligence/i)).toBeVisible();
    await expect(drawer.getByText(/Reporter Profile/i)).toBeVisible();
    await expect(drawer.getByText(/PRIVACY PROTECTED/i)).toBeVisible();

    // Verify accessibility inside drawer
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Capture screenshot of side drawer
    await page.screenshot({
      path: `docs/screenshots/incident-drawer-${width}px.png`,
    });
  });

  test('full page incident detail view with photo zoom lightbox and back navigation', async ({
    page,
  }) => {
    await loginAsAdmin(page);

    // Direct navigation to incident detail page
    await page.goto('/incidents/inc_001');

    // Back link to incidents ledger
    const backBtn = page.getByRole('button', { name: /Back to Incidents Ledger/i });
    await expect(backBtn).toBeVisible();

    // Verify incident metadata and indicators
    await expect(page.getByText('Brush fire near Trail 4')).toBeVisible();
    await expect(page.getByText(/Reported:/i)).toBeVisible();
    await expect(page.getByText(/Age:/i)).toBeVisible();
    await expect(page.getByText('Incident Narrative')).toBeVisible();

    // Action bar buttons
    await expect(page.getByRole('button', { name: /Approve Incident/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Reject Incident/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Mark Incident as False Report/i })).toBeVisible();

    // Click on photo to open lightbox zoom modal
    const photoContainer = page.locator('section[aria-label="Incident Media Evidence"]').locator('.cursor-zoom-in');
    if (await photoContainer.isVisible()) {
      await photoContainer.click();
      const zoomDialog = page.getByRole('dialog');
      await expect(zoomDialog).toBeVisible();
      // Close zoom dialog by pressing Escape
      await page.keyboard.press('Escape');
      await expect(zoomDialog).toBeHidden();
    }

    // Verify accessibility on full page
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Capture screenshot at current viewport
    const width = page.viewportSize()?.width ?? 1440;
    await page.screenshot({
      path: `docs/screenshots/incident-detail-${width}px.png`,
    });

    // Test back button returns to ledger
    await backBtn.click();
    await expect(page).toHaveURL('/incidents');
    await expect(page.getByRole('heading', { name: 'Incidents' })).toBeVisible();
  });

  test('audited reveal flows for reporter and exact GPS coordinates with zero client persistence', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/incidents/inc_001');

    // 1. Verify reporter identity is masked initially
    await expect(page.getByText('PRIVACY PROTECTED')).toBeVisible();
    const revealReporterBtn = page.getByRole('button', { name: /Reveal Identity/i });
    await expect(revealReporterBtn).toBeVisible();

    // 2. Open audited reveal dialog
    await revealReporterBtn.click();
    const revealDialog = page.getByRole('dialog');
    await expect(revealDialog.getByRole('heading', { name: /Reveal Reporter Identity/i })).toBeVisible();
    await expect(revealDialog.getByText(/Audited Action:/i)).toBeVisible();

    // Submit reveal
    const confirmRevealBtn = revealDialog.getByRole('button', { name: /Reveal Reporter & Audit/i });
    await confirmRevealBtn.click();

    // Verify reporter details are revealed
    await expect(page.getByText('IDENTITY REVEALED')).toBeVisible();
    await expect(page.getByText(/usr_/i)).toBeVisible();

    // Verify Privacy Rule: NO revealed data in localStorage or sessionStorage
    const localReporter = await page.evaluate(() => localStorage.getItem('reporter'));
    const sessionReporter = await page.evaluate(() => sessionStorage.getItem('reporter'));
    expect(localReporter).toBeNull();
    expect(sessionReporter).toBeNull();

    // 3. Reveal exact location
    await expect(page.getByText('FUZZED ~500M')).toBeVisible();
    const revealLocationBtn = page.getByRole('button', { name: /Reveal Exact/i });
    await revealLocationBtn.click();

    const locationDialog = page.getByRole('dialog');
    await expect(locationDialog.getByRole('heading', { name: /Reveal Exact GPS Coordinates/i })).toBeVisible();

    const confirmLocationBtn = locationDialog.getByRole('button', { name: /Reveal Location & Audit/i });
    await confirmLocationBtn.click();

    // Verify exact GPS is revealed
    await expect(page.getByText('EXACT GPS REVEALED')).toBeVisible();
  });

  test('moderation journey: mark false with reason, filter false report, restore removed incident', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/incidents');

    // 1. Open an incident from the ledger (inc_002)
    const targetTitle = 'Vehicle rollover on Expressway';
    const incidentRow = page.getByText(targetTitle).filter({ visible: true }).first();
    await incidentRow.click();

    // Drawer opens
    const drawer = page.getByRole('dialog', { name: /Incident Details/i });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(targetTitle)).toBeVisible();

    // 2. Click "Mark False" action button
    const markFalseBtn = drawer.getByRole('button', { name: /Mark Incident as False Report/i });
    await expect(markFalseBtn).toBeVisible();
    await expect(markFalseBtn).not.toBeDisabled();
    await markFalseBtn.click();

    // 3. Confirmation dialog opens with required reason
    const actionDialog = page.getByRole('dialog').filter({ hasText: /Mark as False Report/i });
    await expect(actionDialog).toBeVisible();

    // Submit action with preset reason
    const confirmActionBtn = actionDialog.getByRole('button', { name: /Mark False/i });
    await confirmActionBtn.click();

    // Toast notification
    await expect(page.getByText(/Incident Marked as False Report/i)).toBeVisible();

    // Close the drawer
    await page.keyboard.press('Escape');

    // 4. Verify incident disappears from default under_review / active list or filter by false_report
    await page.goto('/incidents?review=false_report');
    await expect(page.getByText(targetTitle).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('False report').filter({ visible: true }).first()).toBeVisible();

    // 5. Restore a removed incident flow:
    // First remove an incident, then restore it
    await page.goto('/incidents/inc_003');
    await expect(page.getByRole('button', { name: /Remove Incident/i })).toBeVisible();

    // Remove inc_003
    await page.getByRole('button', { name: /Remove Incident/i }).click();
    const removeDialog = page.getByRole('dialog').filter({ hasText: /Remove Incident/i });
    await removeDialog.getByRole('button', { name: /Remove Incident/i }).click();

    await expect(page.getByText(/Incident Removed from Public Ledger/i)).toBeVisible();

    // Now Restore button should be enabled, and other action buttons disabled!
    const restoreBtn = page.getByRole('button', { name: /Restore Incident/i });
    await expect(restoreBtn).toBeVisible();
    await expect(restoreBtn).not.toBeDisabled();

    // Other actions must be disabled for removed item
    await expect(page.getByRole('button', { name: /Approve Incident/i })).toBeDisabled();

    // Click Restore
    await restoreBtn.click();
    const restoreDialog = page.getByRole('dialog').filter({ hasText: /Restore Incident/i });
    await restoreDialog.getByRole('button', { name: /Restore to Review/i }).click();

    // Toast and status update
    await expect(page.getByText(/Incident Restored to Review Queue/i)).toBeVisible();
    await expect(page.getByText('Under review').filter({ visible: true }).first()).toBeVisible();
  });

  test('bulk actions bar, confirmation dialog, and screenshot', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/incidents');

    const width = page.viewportSize()?.width ?? 1440;

    if (width >= 1024) {
      // Select first two table rows via checkbox
      const checkboxes = page.locator('tbody tr input[type="checkbox"], tbody tr button[role="checkbox"]');
      const count = await checkboxes.count();
      if (count >= 2) {
        await checkboxes.nth(0).click();
        await checkboxes.nth(1).click();

        // Floating bulk actions toolbar appears
        const bulkBar = page.getByText(/2 SELECTED/i);
        await expect(bulkBar).toBeVisible();

        // Capture screenshot of bulk actions bar
        await page.screenshot({
          path: `docs/screenshots/bulk-actions-${width}px.png`,
        });

        // Click Approve on bulk bar
        await page.getByRole('button', { name: 'Approve', exact: true }).click();

        // Bulk action dialog opens
        const bulkDialog = page.getByRole('dialog').filter({ hasText: /Bulk Approve Incidents/i });
        await expect(bulkDialog).toBeVisible();

        // Confirm bulk approve
        await bulkDialog.getByRole('button', { name: /Approve Selected/i }).click();

        // Success notification
        await expect(page.getByText(/Bulk Action Completed/i)).toBeVisible();
      }
    }
  });
});
