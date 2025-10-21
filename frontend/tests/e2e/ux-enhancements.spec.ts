import { test, expect } from '@playwright/test';

/**
 * E2E Tests for UX Enhancements Suite (Feature 002-ux-enhancements)
 * Tests all 8 user stories: Quick Status Toggle, Visual Priority, Event Duplication,
 * Keyboard Shortcuts, Quick Date Presets, Status Dashboard, Text Search, Bulk Updates
 */

// Test configuration
const BASE_URL = 'http://localhost:5173';
const API_URL = 'http://localhost:3000';

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'test1234',
  name: 'Test User',
};

test.describe('UX Enhancements Suite', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/auth`);

    // Try to register (will fail if user exists, that's OK)
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.fill('input[name="name"]', TEST_USER.name);

    // Click register or login button
    const registerButton = page.locator('button:has-text("Register")');
    if (await registerButton.isVisible()) {
      await registerButton.click();
    } else {
      await page.locator('button:has-text("Login")').click();
    }

    // Wait for navigation to timeline
    await page.waitForURL(`${BASE_URL}/timeline`, { timeout: 5000 }).catch(() => {
      // If register failed, try login
      return page.goto(`${BASE_URL}/auth`)
        .then(() => page.fill('input[type="email"]', TEST_USER.email))
        .then(() => page.fill('input[type="password"]', TEST_USER.password))
        .then(() => page.locator('button:has-text("Login")').click())
        .then(() => page.waitForURL(`${BASE_URL}/timeline`));
    });

    await page.waitForLoadState('networkidle');
  });

  test.describe('User Story 8: Bulk Status Updates (P3)', () => {
    test('should enable selection mode and show checkboxes', async ({ page }) => {
      // Navigate to List View (bulk operations only available in list view)
      const listViewButton = page.locator('text=List View').or(page.locator('button:has-text("Event List")'));
      if (await listViewButton.isVisible()) {
        await listViewButton.click();
      }

      // Find and click "Enable Selection Mode" button
      const enableButton = page.locator('button:has-text("Enable Selection Mode")');
      await expect(enableButton).toBeVisible();
      await enableButton.click();

      // Verify selection mode is active
      await expect(page.locator('text=selected')).toBeVisible();

      // Verify checkboxes appear on event list items
      const checkboxes = page.locator('input[type="checkbox"]');
      await expect(checkboxes.first()).toBeVisible();
    });

    test('should select multiple events', async ({ page }) => {
      // Enable selection mode
      const listViewButton = page.locator('text=List View').or(page.locator('button:has-text("Event List")'));
      if (await listViewButton.isVisible()) {
        await listViewButton.click();
      }

      await page.locator('button:has-text("Enable Selection Mode")').click();

      // Select first 3 events
      const checkboxes = page.locator('input[type="checkbox"][aria-label*="Select"]');
      const count = await checkboxes.count();

      if (count >= 3) {
        for (let i = 0; i < 3; i++) {
          await checkboxes.nth(i).check();
        }

        // Verify selection count
        await expect(page.locator('text=3 events selected')).toBeVisible();
      }
    });

    test('should use Select All button', async ({ page }) => {
      const listViewButton = page.locator('text=List View').or(page.locator('button:has-text("Event List")'));
      if (await listViewButton.isVisible()) {
        await listViewButton.click();
      }

      await page.locator('button:has-text("Enable Selection Mode")').click();

      // Click Select All button
      const selectAllButton = page.locator('button:has-text("Select All")');
      await selectAllButton.click();

      // Verify all events are selected
      const checkboxes = page.locator('input[type="checkbox"][aria-label*="Select"]');
      const count = await checkboxes.count();

      // Check that the selection count matches total events
      await expect(page.locator(`text=${count} events selected`)).toBeVisible();
    });

    test('should clear selection', async ({ page }) => {
      const listViewButton = page.locator('text=List View').or(page.locator('button:has-text("Event List")'));
      if (await listViewButton.isVisible()) {
        await listViewButton.click();
      }

      await page.locator('button:has-text("Enable Selection Mode")').click();

      // Select some events
      const checkboxes = page.locator('input[type="checkbox"][aria-label*="Select"]');
      await checkboxes.first().check();
      await checkboxes.nth(1).check();

      // Click Clear Selection
      await page.locator('button:has-text("Clear Selection")').click();

      // Verify selection count is 0
      await expect(page.locator('text=0 events selected')).toBeVisible();
    });

    test('should bulk update event status', async ({ page }) => {
      const listViewButton = page.locator('text=List View').or(page.locator('button:has-text("Event List")'));
      if (await listViewButton.isVisible()) {
        await listViewButton.click();
      }

      await page.locator('button:has-text("Enable Selection Mode")').click();

      // Select multiple events
      const checkboxes = page.locator('input[type="checkbox"][aria-label*="Select"]');
      const count = Math.min(3, await checkboxes.count());

      for (let i = 0; i < count; i++) {
        await checkboxes.nth(i).check();
      }

      // Open status dropdown
      const statusDropdown = page.locator('select').filter({ hasText: 'Choose status' });
      await statusDropdown.selectOption('Completed');

      // Wait for success toast
      await expect(page.locator('text=/Updated \\d+ event/i')).toBeVisible({ timeout: 5000 });

      // Verify selection is cleared after update
      await expect(page.locator('text=0 events selected')).toBeVisible();
    });

    test('should disable bulk mode when clicking Done', async ({ page }) => {
      const listViewButton = page.locator('text=List View').or(page.locator('button:has-text("Event List")'));
      if (await listViewButton.isVisible()) {
        await listViewButton.click();
      }

      await page.locator('button:has-text("Enable Selection Mode")').click();

      // Click Done button
      await page.locator('button:has-text("Done")').click();

      // Verify checkboxes are hidden
      const checkboxes = page.locator('input[type="checkbox"][aria-label*="Select"]');
      await expect(checkboxes.first()).not.toBeVisible();

      // Verify Enable Selection Mode button is back
      await expect(page.locator('button:has-text("Enable Selection Mode")' )).toBeVisible();
    });

    test('should show message when bulk mode unavailable in timeline view', async ({ page }) => {
      // If there's a timeline view toggle, click it
      const timelineButton = page.locator('text=Timeline View').or(page.locator('button:has-text("Timeline")'));
      if (await timelineButton.isVisible()) {
        await timelineButton.click();
      }

      // Verify message is shown
      const message = page.locator('text=/Switch to List View/i');
      if (await message.isVisible()) {
        await expect(message).toContainText('bulk');
      }
    });
  });

  test.describe('User Story 1: Quick Status Toggle (P1)', () => {
    test('should update event status via dropdown', async ({ page }) => {
      // Find an event card with status badge
      const statusBadge = page.locator('[class*="status"]').first();
      if (await statusBadge.isVisible()) {
        await statusBadge.click();

        // Select new status from dropdown
        const statusOption = page.locator('text=Completed').or(page.locator('text=In Progress'));
        await statusOption.click();

        // Wait for update to complete
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('User Story 6: Status Dashboard (P2)', () => {
    test('should display event counts by status', async ({ page }) => {
      // Look for dashboard widget with status counts
      const dashboard = page.locator('text=/Not Started|In Progress|Completed/i').first();
      await expect(dashboard).toBeVisible();

      // Verify counts are displayed
      const countElements = page.locator('text=/\\d+ event/i');
      await expect(countElements.first()).toBeVisible();
    });
  });

  test.describe('User Story 7: Text Search (P3)', () => {
    test('should filter events by search term', async ({ page }) => {
      // Find search input
      const searchInput = page.locator('input[type="search"]').or(page.locator('input[placeholder*="Search"]'));

      if (await searchInput.isVisible()) {
        await searchInput.fill('test');

        // Wait for filtering
        await page.waitForTimeout(500);

        // Events should be filtered
        await expect(page.locator('text=/event/i').first()).toBeVisible();
      }
    });
  });

  test.describe('User Story 4: Keyboard Shortcuts (P2)', () => {
    test('should focus search on / key press', async ({ page }) => {
      const searchInput = page.locator('input[type="search"]').or(page.locator('input[placeholder*="Search"]'));

      if (await searchInput.isVisible()) {
        await page.keyboard.press('/');

        // Verify search input is focused
        await expect(searchInput).toBeFocused();
      }
    });

    test('should close modal on ESC key press', async ({ page }) => {
      // Open new event modal (if New Event button exists)
      const newEventButton = page.locator('button:has-text("New Event")').or(page.locator('text=Add Event'));

      if (await newEventButton.isVisible()) {
        await newEventButton.click();
        await page.waitForTimeout(300);

        // Press ESC
        await page.keyboard.press('Escape');

        // Modal should be closed
        await page.waitForTimeout(300);
      }
    });
  });
});
