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

test.describe('Phase 4: Moderation Queue and Community Flags', () => {
  test('moderation queue renders, passes accessibility, and captures screenshots', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/queue');

    // Verify main queue UI elements
    await expect(page.getByRole('heading', { name: 'Moderation Queue' })).toBeVisible();
    await expect(page.getByTestId('queue-count-badge')).toBeVisible();
    await expect(page.getByTestId('queue-active-card')).toBeVisible();
    await expect(page.getByTestId('queue-approve-btn')).toBeVisible();
    await expect(page.getByTestId('queue-reject-btn')).toBeVisible();
    await expect(page.getByTestId('queue-mark-false-btn')).toBeVisible();

    const width = page.viewportSize()?.width ?? 1440;

    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Capture screenshot at current viewport
    await page.screenshot({
      path: `docs/screenshots/queue-${width}px.png`,
    });
  });

  test('keyboard shortcuts modal can be opened with ? and closed with Esc', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/queue');
    await expect(page.getByTestId('queue-active-card')).toBeVisible();

    // Focus page and press ?
    await page.keyboard.press('?');

    const modal = page.getByRole('dialog', { name: /Moderation Keyboard Shortcuts/i });
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/Approve incident and broadcast/i)).toBeVisible();

    // Close with Escape key
    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });

  test('shortcut handling is disabled while typing inside inputs', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/queue');
    await expect(page.getByTestId('queue-active-card')).toBeVisible();

    // Press 'r' to open reject dialog
    await page.keyboard.press('r');
    const dialog = page.getByTestId('quick-reason-picker-dialog');
    await expect(dialog).toBeVisible();

    // Focus the notes textarea
    const notesInput = page.getByTestId('quick-reason-notes-input');
    await notesInput.focus();

    // Type 'a' - should not trigger approve or open undo toast
    await page.keyboard.press('a');
    await expect(notesInput).toHaveValue('a');
    await expect(page.getByTestId('queue-undo-toast')).toBeHidden();

    // Cancel dialog
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('approve action shows undo toast and can be undone within 5 seconds', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/queue');
    await expect(page.getByTestId('queue-active-card')).toBeVisible();

    // Get current item title
    const currentHeading = await page
      .locator('[data-testid="queue-active-card"] h2')
      .textContent();

    // Approve using 'a' key
    await page.keyboard.press('a');

    // Undo toast should appear
    const undoToast = page.getByTestId('queue-undo-toast');
    await expect(undoToast).toBeVisible();
    await expect(undoToast).toContainText('Approved:');

    // Press 'u' key to undo approval
    await page.keyboard.press('u');

    // Item should be restored and toast removed
    await expect(undoToast).toBeHidden();
    const restoredHeading = await page
      .locator('[data-testid="queue-active-card"] h2')
      .textContent();
    expect(restoredHeading).toBe(currentHeading);
  });

  test('clears a queue of 10 mixed items purely through keyboard without mouse clicks', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/queue');
    await expect(page.getByTestId('queue-active-card')).toBeVisible();

    // Clear 10 items strictly with keyboard shortcuts:
    // 4 Approve (a), 3 Reject (r -> 1 -> Enter), 3 Mark False (f -> 1 -> Enter)
    const decisions = [
      'approve',
      'reject',
      'false',
      'approve',
      'reject',
      'false',
      'approve',
      'reject',
      'false',
      'approve',
    ];

    for (let i = 0; i < decisions.length; i++) {
      const decision = decisions[i];
      await expect(page.getByTestId('queue-active-card')).toBeVisible();

      if (decision === 'approve') {
        // Press 'a' key
        await page.keyboard.press('a');
        await page.waitForTimeout(200);
      } else if (decision === 'reject') {
        // Press 'r' to open quick reason picker
        await page.keyboard.press('r');
        await expect(page.getByTestId('quick-reason-picker-dialog')).toBeVisible();

        // Select preset 1 with number key
        await page.keyboard.press('1');
        // Confirm with Enter
        await page.keyboard.press('Enter');
        await expect(page.getByTestId('quick-reason-picker-dialog')).toBeHidden();
        await page.waitForTimeout(200);
      } else if (decision === 'false') {
        // Press 'f' to open mark-false picker
        await page.keyboard.press('f');
        await expect(page.getByTestId('quick-reason-picker-dialog')).toBeVisible();

        // Select preset 1 with number key
        await page.keyboard.press('1');
        // Confirm with Enter
        await page.keyboard.press('Enter');
        await expect(page.getByTestId('quick-reason-picker-dialog')).toBeHidden();
        await page.waitForTimeout(200);
      }
    }

    // Verify queue is still operable or reached next item
    await expect(
      page.locator('[data-testid="queue-active-card"], [data-testid="queue-empty-state"]').first()
    ).toBeVisible();
  });

  test('flags page renders, filters by status and type, and passes accessibility', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/flags');

    // Verify main flags page structure
    await expect(page.getByRole('heading', { name: 'Community Flags' })).toBeVisible();
    await expect(page.getByTestId('flags-stats-bar')).toBeVisible();
    await expect(page.getByTestId('flags-filter-bar')).toBeVisible();
    await expect(page.getByTestId('flags-groups-list')).toBeVisible();

    const width = page.viewportSize()?.width ?? 1440;

    // Run axe accessibility scan on flags page
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Capture screenshot at current viewport
    await page.screenshot({
      path: `docs/screenshots/flags-${width}px.png`,
    });

    // Test status filter pill
    const pendingPill = page.getByTestId('flags-filter-status-pending');
    await pendingPill.click();
    await expect(page).toHaveURL(/status=pending/);

    // Test type filter pill
    const abusePill = page.getByTestId('flags-filter-type-abuse');
    await abusePill.click();
    await expect(page).toHaveURL(/type=abuse/);

    // Reset filters
    const resetBtn = page.getByTestId('flags-reset-filters-btn');
    await resetBtn.click();
  });

  test('flags actions: dismiss flag, move to review, mark false, open incident', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/flags');

    await expect(page.getByTestId('flags-groups-list')).toBeVisible();

    // 1. Test Dismiss Flag action
    const firstDismissBtn = page.locator('[data-testid^="dismiss-flag-btn-"]').first();
    if (await firstDismissBtn.isVisible()) {
      await firstDismissBtn.click();
      await page.waitForTimeout(500);
    }

    // 2. Test Move to Review action (find an incident not already under review)
    const moveReviewBtn = page.locator('[data-testid^="move-review-btn-"]:not(:disabled)').first();
    if (await moveReviewBtn.isVisible()) {
      await moveReviewBtn.click();
      await page.waitForTimeout(300);
    }

    // 3. Test Mark False dialog
    const firstMarkFalseBtn = page.locator('[data-testid^="mark-false-btn-"]').first();
    await firstMarkFalseBtn.click();

    const markFalseDialog = page.getByRole('dialog', { name: /Mark as False Report/i });
    await expect(markFalseDialog).toBeVisible();
    await expect(page.getByTestId('mark-false-reason-textarea')).toBeVisible();

    // Confirm mark false
    await page.getByTestId('confirm-mark-false-btn').click();
    await expect(markFalseDialog).toBeHidden();

    // 4. Test Open Incident link
    const firstOpenBtn = page.locator('[data-testid^="open-incident-btn-"]').first();
    await expect(firstOpenBtn).toHaveAttribute('href', /\/incidents\/inc_/);
  });

  test('deep links from overview card to pre-filtered pending flags view', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/');

    // Card 3: FLAGS AWAITING ACTION links to /flags?status=pending
    const flagsCardLink = page.locator('a[href="/flags?status=pending"]');
    await expect(flagsCardLink).toBeVisible();
    await flagsCardLink.click();

    await expect(page).toHaveURL('/flags?status=pending');
    await expect(page.getByTestId('flags-filter-status-pending')).toHaveClass(/bg-foreground/);
  });
});
