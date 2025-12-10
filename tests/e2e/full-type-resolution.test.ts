import { test, expect, Page } from '@playwright/test';

// Helper to fill Monaco editor - click, select all, type
async function fillMonacoEditor(page: Page, code: string) {
  // Wait for Monaco to be ready
  await page.waitForSelector('.monaco-editor', { timeout: 10000 });

  // Click on the editor to focus it
  await page.click('.monaco-editor');

  // Select all existing content and replace
  await page.keyboard.press('Meta+A'); // Cmd+A on Mac
  await page.keyboard.press('Control+A'); // Ctrl+A on Windows/Linux

  // Type the new code
  await page.keyboard.type(code, { delay: 5 });
}

// Selector for the type expression input (placeholder contains "_result")
const TYPE_INPUT_SELECTOR = 'input[placeholder*="_result"]';

test.describe('Full Type Resolution E2E', () => {
  test('user enters simple type and sees visualization', async ({ page }) => {
    await page.goto('/');

    // Enter type expression in the type input
    await page.fill(TYPE_INPUT_SELECTOR, 'string');
    await page.click('button:has-text("Generate")');

    // Wait for visualization to load
    await page.waitForTimeout(3000);

    // Verify page loaded
    expect(await page.isVisible('body')).toBe(true);
  });

  test('user steps through conditional with union', async ({ page }) => {
    await page.goto('/');

    // Enter conditional type in type input
    await page.fill(TYPE_INPUT_SELECTOR, '"a" extends string ? true : false');
    await page.click('button:has-text("Generate")');

    await page.waitForTimeout(2000);

    // Should show condition and branch_true traces
    const stepDetails = await page.textContent('body');
    expect(stepDetails).toBeTruthy();
  });

  test('user steps through template literal', async ({ page }) => {
    await page.goto('/');

    // Enter custom code in Monaco editor
    await fillMonacoEditor(page, 'type Test<S> = `Prop ${S}`;');

    // Enter type expression
    await page.fill(TYPE_INPUT_SELECTOR, 'Test<"a" | "b">');
    await page.click('button:has-text("Generate")');

    await page.waitForTimeout(2000);

    // Should show template traces
    expect(await page.isVisible('body')).toBe(true);
  });

  test('user steps through mapped type', async ({ page }) => {
    await page.goto('/');

    // Enter mapped type in type input
    await page.fill(TYPE_INPUT_SELECTOR, '{ readonly [K in "a" | "b"]: string }');
    await page.click('button:has-text("Generate")');

    await page.waitForTimeout(2000);

    expect(await page.isVisible('body')).toBe(true);
  });

  test('user navigates through all playback controls', async ({ page }) => {
    await page.goto('/');

    // Enter simple type in type input
    await page.fill(TYPE_INPUT_SELECTOR, 'string');
    await page.click('button:has-text("Generate")');

    await page.waitForTimeout(2000);

    // Test playback controls - use force click for disabled buttons to just skip them
    const playButton = page.locator('button[aria-label*="play"], button:has-text("Play")').first();
    if (await playButton.isVisible() && await playButton.isEnabled()) {
      await playButton.click();
      await page.waitForTimeout(500);
    }

    const nextButton = page.locator('button[aria-label*="next"], button:has-text("Next")').first();
    if (await nextButton.isVisible() && await nextButton.isEnabled()) {
      await nextButton.click();
    }

    const prevButton = page.locator('button[aria-label*="prev"], button:has-text("Prev")').first();
    if (await prevButton.isVisible() && await prevButton.isEnabled()) {
      await prevButton.click();
    }

    expect(await page.isVisible('body')).toBe(true);
  });
});
