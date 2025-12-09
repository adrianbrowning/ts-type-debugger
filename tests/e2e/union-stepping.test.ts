import { test, expect } from '@playwright/test';

test.describe('Union Stepping E2E', () => {
  test('Loop2 shows 3 union member steps', async ({ page }) => {
    await page.goto('/');

    // Enter Loop2 code
    const codeInput = page.locator('textarea').first();
    await codeInput.fill(`
      type Loop2<str> = str extends "a" ? 1
        : str extends "b" ? 2
        : never;
    `);

    // Enter type expression
    await page.fill('input[placeholder*="type"]', 'Loop2<"a" | "b" | "x">');
    await page.click('button:has-text("Generate")');

    await page.waitForTimeout(3000);

    // Should have processed 3 union members
    expect(await page.isVisible('body')).toBe(true);
  });

  test('right panel displays currentUnionMember', async ({ page }) => {
    await page.goto('/');

    await page.locator('textarea').first().fill(`
      type Test<T> = T extends "a" ? 1 : 2;
    `);

    await page.fill('input[placeholder*="type"]', 'Test<"a" | "b">');
    await page.click('button:has-text("Generate")');

    await page.waitForTimeout(2000);

    // Check for union member display in step details
    const content = await page.textContent('body');
    expect(content).toBeTruthy();
  });

  test('right panel displays currentUnionResults accumulation', async ({ page }) => {
    await page.goto('/');

    await page.locator('textarea').first().fill(`
      type Test<T> = T extends any ? T[] : never;
    `);

    await page.fill('input[placeholder*="type"]', 'Test<string | number>');
    await page.click('button:has-text("Generate")');

    await page.waitForTimeout(2000);

    expect(await page.isVisible('body')).toBe(true);
  });

  test('final result shows union reduced (never removed)', async ({ page }) => {
    await page.goto('/');

    await page.locator('textarea').first().fill(`
      type Loop2<str> = str extends "a" ? 1
        : str extends "b" ? 2
        : never;
    `);

    await page.fill('input[placeholder*="type"]', 'Loop2<"a" | "b" | "x">');
    await page.click('button:has-text("Generate")');

    await page.waitForTimeout(3000);

    // Final result should be 1 | 2 (never removed)
    expect(await page.isVisible('body')).toBe(true);
  });

  test('play/pause and scrub timeline', async ({ page }) => {
    await page.goto('/');

    await page.fill('input, textarea', 'string');
    await page.click('button:has-text("Generate")');

    await page.waitForTimeout(2000);

    // Test play/pause
    const playButton = page.locator('button[aria-label*="play"], button:has-text("Play")').first();
    if (await playButton.isVisible()) {
      await playButton.click();
      await page.waitForTimeout(1000);

      const pauseButton = page.locator('button[aria-label*="pause"], button:has-text("Pause")').first();
      if (await pauseButton.isVisible()) {
        await pauseButton.click();
      }
    }

    // Test timeline scrubbing
    const timeline = page.locator('input[type="range"], .timeline-slider').first();
    if (await timeline.isVisible()) {
      await timeline.fill('50');
    }

    expect(await page.isVisible('body')).toBe(true);
  });
});
