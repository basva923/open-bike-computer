import { expect, test } from '@playwright/test';

test.describe('home footer popup', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
  });

  test('uses a dark AMOLED-friendly home screen', async ({ page }, testInfo) => {
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(page.locator('.mat-mdc-tab-header')).toHaveCSS('background-color', 'rgb(0, 0, 0)');

    await page.screenshot({
      path: testInfo.outputPath('home-screen-dark.png'),
      fullPage: true,
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

  test('keeps popup controls interactive after opening', async ({ page }, testInfo) => {
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

    await page.screenshot({
      path: testInfo.outputPath('footer-popup-open.png'),
      fullPage: true,
    });

    await popup.getByRole('button', { name: 'Reset' }).click();
    await popup.getByRole('button', { name: 'Done' }).click();

    await expect(popup.getByRole('button', { name: 'Done' })).toHaveCount(0);
  });
});
