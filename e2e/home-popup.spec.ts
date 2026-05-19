import { expect, test } from '@playwright/test';

test.describe('home footer popup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens and closes from the floating button', async ({ page }) => {
    const openButton = page.getByRole('button', { name: 'Open footer popup' });
    await expect(page.locator('.footer-popup')).toHaveCount(0);

    await openButton.click();

    const popup = page.locator('.footer-popup');
    await expect(popup).toBeVisible();
    await expect(page.getByRole('button', { name: 'Close footer popup' })).toBeVisible();
    await expect(popup.getByText('Power (W)').first()).toBeVisible();

    await page.getByRole('button', { name: 'Close footer popup' }).click();

    await expect(page.locator('.footer-popup')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open footer popup' })).toBeVisible();
  });

  test('keeps popup controls interactive after opening', async ({ page }) => {
    await page.getByRole('button', { name: 'Open footer popup' }).click();

    const popup = page.locator('.footer-popup');
    await expect(popup).toBeVisible();

    await popup.locator('.edit-button').click();

    await expect(popup.getByRole('button', { name: 'Done' })).toBeVisible();
    await expect(popup.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(popup.getByRole('button', { name: 'Reset' })).toBeVisible();

    await popup.getByRole('button', { name: 'Cancel' }).click();

    await expect(popup.getByRole('button', { name: 'Done' })).toHaveCount(0);
  });
});
