import { test, expect } from '@playwright/test';

test.describe('Phase 1: Authentication and App Shell', () => {
  test('redirects unauthenticated user to login with returnUrl', async ({ page }) => {
    await page.goto('/queue');
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fqueue/);
    await expect(page.getByRole('heading', { name: 'Staff Login' })).toBeVisible();
  });

  test('displays error message on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@inzar.app');
    await page.fill('#password', 'WrongPassword123');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Authentication Error')).toBeVisible();
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('rejects non-staff user account with unauthorized message', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'user@inzar.app');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page.getByText('Authentication Error')).toBeVisible();
    await expect(
      page.getByText('Access restricted to staff accounts only')
    ).toBeVisible();
  });

  test('successful admin login renders complete dashboard with ADMIN section', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@inzar.app');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();

    const isMobile = (page.viewportSize()?.width ?? 1440) < 1024;
    if (isMobile) {
      // Open drawer on tablet / mobile
      const menuButton = page.locator('header').getByRole('button').first();
      await menuButton.click();
    }

    const nav = page.locator('aside nav');

    // Verify user card in sidebar
    await expect(page.locator('aside').getByText('Sana Rehman')).toBeVisible();
    await expect(page.locator('aside').getByRole('button', { name: 'User account menu' })).toContainText('admin');

    // Verify ADMIN section exists in sidebar nav
    await expect(page.locator('aside').getByText('ADMIN', { exact: true })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Users/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Categories/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Settings/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Audit log/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Jobs/i })).toBeVisible();

    // Screenshot at current viewport
    const width = page.viewportSize()?.width ?? 1440;
    await page.screenshot({ path: `docs/screenshots/admin-dashboard-${width}px.png` });
  });

  test('successful moderator login renders operational navigation and hides ADMIN section', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'moderator@inzar.app');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');

    const isMobile = (page.viewportSize()?.width ?? 1440) < 1024;
    if (isMobile) {
      const menuButton = page.locator('header').getByRole('button').first();
      await menuButton.click();
    }

    const nav = page.locator('aside nav');

    await expect(page.locator('aside').getByText('Ali Khan')).toBeVisible();
    await expect(page.locator('aside').getByText(/moderator/i)).toBeVisible();

    // Operational items visible
    await expect(nav.getByRole('link', { name: /Overview/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Moderation queue/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /Incidents/i })).toBeVisible();

    // Admin-only items must NOT be visible
    await expect(nav.getByRole('link', { name: /Users/i })).not.toBeVisible();
    await expect(nav.getByRole('link', { name: /Categories/i })).not.toBeVisible();
    await expect(nav.getByRole('link', { name: /Settings/i })).not.toBeVisible();
  });

  test('moderator attempting to access admin route is blocked with 403', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'moderator@inzar.app');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // Navigate to admin-only /users
    await page.goto('/users');
    await expect(page.getByText('403 · Access Restricted')).toBeVisible();
    await expect(page.getByText('Insufficient Permissions')).toBeVisible();
  });

  test('security verification: zero tokens exposed to client JavaScript', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@inzar.app');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    const localStorageData = await page.evaluate(() => JSON.stringify(window.localStorage));
    const sessionStorageData = await page.evaluate(() => JSON.stringify(window.sessionStorage));
    const documentCookies = await page.evaluate(() => document.cookie);

    expect(localStorageData).not.toContain('mock_jwt_access');
    expect(localStorageData).not.toContain('mock_jwt_refresh');
    expect(sessionStorageData).not.toContain('mock_jwt_access');
    expect(sessionStorageData).not.toContain('mock_jwt_refresh');
    expect(documentCookies).not.toContain('mock_jwt_access');
    expect(documentCookies).not.toContain('inzar_admin_session');
  });

  test('sign out clears session and redirects to login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#email', 'admin@inzar.app');
    await page.fill('#password', 'Password123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    const isMobile = (page.viewportSize()?.width ?? 1440) < 1024;
    if (isMobile) {
      const menuButton = page.locator('header').getByRole('button').first();
      await menuButton.click();
    }

    // Open user menu
    await page.locator('aside').getByRole('button', { name: 'User account menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();

    await expect(page).toHaveURL('/login');

    // Visiting protected route redirects back to login
    await page.goto('/');
    await expect(page).toHaveURL('/login');
  });
});
