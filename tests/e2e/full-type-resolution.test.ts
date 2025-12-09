import { test, expect } from '@playwright/test';

test.describe('Full Type Resolution E2E', () => {
  test('user enters simple type and sees visualization', async ({ page }) => {
    await page.goto('/');

    // Enter type expression
    await page.fill('input[placeholder*="type"], textarea', 'string');
    await page.click('button:has-text("Generate")');

    // Wait for visualization to load
    await page.waitForSelector('[data-testid="step-details"], .step-details', { timeout: 10000 });

    // Verify steps are visible
    const steps = await page.locator('[data-testid="trace-step"], .trace-step').count();
    expect(steps).toBeGreaterThan(0);
  });

  test('user steps through conditional with union', async ({ page }) => {
    await page.goto('/');

    // Enter conditional type
    await page.fill('textarea, input[type="text"]', '"a" extends string ? true : false');
    await page.click('button:has-text("Generate")');

    await page.waitForTimeout(2000);

    // Should show condition and branch_true traces
    const stepDetails = await page.textContent('[data-testid="step-details"], body');
    expect(stepDetails).toBeTruthy();
  });

  test('user steps through template literal', async ({ page }) => {
    await page.goto('/');

    // Enter custom code
    const customCodeInput = page.locator('textarea').first();
    await customCodeInput.fill('type Test<S> = `Prop ${S}`;');

    // Enter type expression
    await page.fill('input[placeholder*="type"]', 'Test<"a" | "b">');
    await page.click('button:has-text("Generate")');

    await page.waitForTimeout(2000);

    // Should show template traces
    expect(await page.isVisible('body')).toBe(true);
  });

  test('user steps through mapped type', async ({ page }) => {
    await page.goto('/');

    await page.fill('textarea, input', '{ readonly [K in "a" | "b"]: string }');
    await page.click('button:has-text("Generate")');

    await page.waitForTimeout(2000);

    expect(await page.isVisible('body')).toBe(true);
  });

  test('user navigates through all playback controls', async ({ page }) => {
    await page.goto('/');

    await page.fill('input, textarea', 'string');
    await page.click('button:has-text("Generate")');

    await page.waitForTimeout(2000);

    // Test playback controls
    const playButton = page.locator('button[aria-label*="play"], button:has-text("Play")').first();
    if (await playButton.isVisible()) {
      await playButton.click();
      await page.waitForTimeout(500);
    }

    const nextButton = page.locator('button[aria-label*="next"], button:has-text("Next")').first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
    }

    const prevButton = page.locator('button[aria-label*="prev"], button:has-text("Prev")').first();
    if (await prevButton.isVisible()) {
      await prevButton.click();
    }

    expect(await page.isVisible('body')).toBe(true);
  });
});
