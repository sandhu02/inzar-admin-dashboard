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

test.describe('Phase 6: Users Management and Governance', () => {
  test('users ledger renders, passes accessibility check, and captures desktop/tablet screenshots', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/users');

    // Verify main header and stats bar
    await expect(page.getByRole('heading', { name: 'User Management' })).toBeVisible();
    await expect(page.getByTestId('stat-total-users')).toBeVisible();
    await expect(page.getByTestId('stat-active-users')).toBeVisible();
    await expect(page.getByTestId('stat-suspended-users')).toBeVisible();

    // Verify seeded users load in ledger
    await expect(page.locator('tbody').getByText('Sana Rehman')).toBeVisible();
    await expect(page.locator('tbody').getByText('Ali Khan')).toBeVisible();

    const width = page.viewportSize()?.width ?? 1440;

    // Run axe accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    expect(accessibilityScanResults.violations).toEqual([]);

    // Capture screenshot at current viewport
    await page.screenshot({
      path: `docs/screenshots/users-${width}px.png`,
    });
  });

  test('filters users by search and status dropdowns', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/users');

    // Search for a specific user: Hamza
    const searchInput = page.getByTestId('users-search-input');
    await searchInput.fill('Hamza');
    await expect(page).toHaveURL(/q=Hamza/);

    // Hamza Malik should be visible in table
    await expect(page.locator('tbody').getByText('Hamza Malik')).toBeVisible();

    // Other users should be filtered out
    await expect(page.locator('tbody').getByText('Ali Khan')).not.toBeVisible();

    // Clear search
    await searchInput.fill('');
    await expect(page).not.toHaveURL(/q=Hamza/);
    await expect(page.locator('tbody').getByText('Ali Khan')).toBeVisible();

    // Filter by status: Suspended only
    const statusSelect = page.getByTestId('filter-status-select');
    await statusSelect.selectOption('suspended');
    await expect(page).toHaveURL(/status=suspended/);

    // Verify suspended user is shown
    await expect(page.locator('tbody').getByText('Bilal Ahmed')).toBeVisible();
    await expect(page.locator('tbody').getByText('Sana Rehman')).not.toBeVisible();
  });

  test('complete user journey: find user by email, review moderation history, suspend user with reason', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/users');

    // Find user by email: hamza.malik@example.com
    const searchInput = page.getByTestId('users-search-input');
    await searchInput.fill('hamza.malik@example.com');
    await expect(page).toHaveURL(/q=hamza\.malik/);
    await expect(page.locator('tbody').getByText('Hamza Malik')).toBeVisible();

    // Click on user to navigate to their detail view
    const userRow = page.locator('tbody tr').filter({ hasText: 'Hamza Malik' });
    if (await userRow.isVisible()) {
      await userRow.click();
    } else {
      await page.locator('[data-testid="users-card-list"]').getByText('Hamza Malik').click();
    }

    await expect(page).toHaveURL(/\/users\/usr_user_004/);
    await expect(page.getByTestId('user-summary-card')).toBeVisible();
    await expect(page.getByText('usr_user_004')).toBeVisible();

    // Capture user detail screenshot
    const width = page.viewportSize()?.width ?? 1440;
    if (width >= 1024) {
      await page.screenshot({
        path: `docs/screenshots/user-detail-${width}px.png`,
      });
    }

    // Review moderation history tab
    const modTab = page.getByTestId('tab-moderation');
    await modTab.click();
    await expect(page.getByTestId('user-moderation-history-list')).toBeVisible();
    await expect(page.getByText(/Submitted staged photo as emergency fire incident/i)).toBeVisible();

    // Review incident reports tab
    const incTab = page.getByTestId('tab-incidents');
    await incTab.click();
    await expect(page.getByTestId('user-incidents-list')).toBeVisible();

    // Suspend user with reason
    const suspendBtn = page.getByTestId('user-suspend-action-btn');
    const isAlreadySuspended = await page
      .getByText('Account Currently Suspended')
      .isVisible()
      .catch(() => false);

    if (isAlreadySuspended) {
      // Re-instate first to restore active state if modified by a previous run
      await suspendBtn.click();
      await expect(page.getByRole('heading', { name: 'Reinstate User Account' })).toBeVisible();
      await page.getByRole('button', { name: 'Reinstate Account' }).click();
      await expect(page.getByText('Account Currently Suspended')).not.toBeVisible();
    }

    // Now test suspension flow
    await suspendBtn.click();

    // Verify modal dialog appears
    await expect(page.getByRole('heading', { name: 'Suspend User Account' })).toBeVisible();

    // Confirm suspension
    const confirmBtn = page.getByRole('button', { name: 'Confirm Suspension' });
    await confirmBtn.click();

    // Verify suspended banner appears on user profile
    await expect(page.getByTestId('user-suspended-banner')).toBeVisible();
    await expect(page.getByText('Account Currently Suspended')).toBeVisible();

    // Restore clean state for subsequent tests/viewports
    await suspendBtn.click();
    await expect(page.getByRole('heading', { name: 'Reinstate User Account' })).toBeVisible();
    await page.getByRole('button', { name: 'Reinstate Account' }).click();
    await expect(page.getByText('Account Currently Suspended')).not.toBeVisible();
  });

  test('enforces self-protection and last-admin rules on user profile', async ({ page }) => {
    await loginAsAdmin(page);

    // Navigate to own profile
    await page.goto('/users/usr_admin_001');

    await expect(page.getByTestId('user-summary-card')).toBeVisible();
    await expect(page.getByText('YOUR ACCOUNT')).toBeVisible();

    // Verify Suspend button is disabled
    const suspendBtn = page.getByTestId('user-suspend-action-btn');
    await expect(suspendBtn).toBeDisabled();

    // Verify Change Role button is disabled
    const roleBtn = page.getByTestId('user-role-action-btn');
    await expect(roleBtn).toBeDisabled();

    // Verify Sole Administrator guard notice
    await expect(page.getByText('Sole Administrator:')).toBeVisible();
  });

  test('moderator attempting to access admin /users is blocked with 403', async ({ page }) => {
    await loginAsModerator(page);

    // Attempt direct navigation to /users
    await page.goto('/users');

    await expect(page.getByText('403 · Access Restricted')).toBeVisible();
    await expect(page.getByText('Insufficient Permissions')).toBeVisible();
  });
});
