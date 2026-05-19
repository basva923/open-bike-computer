import { expect, test } from '@playwright/test';

// 390x844 matches a common modern phone viewport (for example iPhone 12/13/14).
test.use({ viewport: { width: 390, height: 844 } });

test.describe('home footer popup', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('uses a dark AMOLED-friendly home screen', async ({ page }) => {
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(page.locator('.mat-mdc-tab-header')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await expect(page).toHaveScreenshot('home-screen-dark.png', {
      fullPage: true,
      animations: 'disabled',
    });
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
    await expect(popup).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await expect(popup.getByText('Power (W)').first()).toBeVisible();

    const popupBox = await popup.boundingBox();
    expect(popupBox?.height ?? 0).toBeGreaterThan(200);

    await popup.locator('.edit-button').click();

    await expect(popup.getByRole('button', { name: 'Done' })).toBeVisible();
    await expect(popup.getByRole('button', { name: 'Cancel' })).toBeVisible();
    await expect(popup.getByRole('button', { name: 'Reset' })).toBeVisible();
    await expect(page).toHaveScreenshot('footer-popup-open.png', {
      fullPage: true,
      animations: 'disabled',
    });

    await popup.getByRole('button', { name: 'Reset' }).click();
    await popup.getByRole('button', { name: 'Done' }).click();

    await expect(popup.getByRole('button', { name: 'Done' })).toHaveCount(0);
  });
});
