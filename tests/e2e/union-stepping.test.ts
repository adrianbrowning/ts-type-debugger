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

// Wait for video generation to complete
async function waitForGeneration(page: Page) {
  // Wait for Generate button to be re-enabled (not loading)
  await page.waitForFunction(
    () => {
      const btn = document.querySelector('button:has-text("Generate")');
      return btn && !btn.textContent?.includes('Generating');
    },
    { timeout: 10000 }
  ).catch(() => {
    // Fallback to timeout if function doesn't work
  });
  // Additional buffer for UI updates
  await page.waitForTimeout(500);
}

test.describe('Union Stepping E2E', () => {
  test('Loop2 shows step indicator with multiple steps', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await fillMonacoEditor(page, `type Loop2<str> = str extends "a" ? 1 : str extends "b" ? 2 : never;`);

    // Act
    await page.fill(TYPE_INPUT_SELECTOR, 'Loop2<"a" | "b" | "x">');
    await page.click('button:has-text("Generate")');
    await waitForGeneration(page);

    // Assert - should show step indicator with format "Step X / Y"
    await expect(page.locator('text=/Step \\d+ \\/ \\d+/')).toBeVisible();

    // Should have multiple steps (at least 3 for the union members)
    const stepText = await page.locator('text=/Step \\d+ \\/ \\d+/').textContent();
    const match = stepText?.match(/Step \d+ \/ (\d+)/);
    const totalSteps = match ? parseInt(match[1]) : 0;
    expect(totalSteps).toBeGreaterThanOrEqual(3);
  });

  test('displays "Step Details" panel with step information', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await fillMonacoEditor(page, `type Test<T> = T extends "a" ? 1 : 2;`);

    // Act
    await page.fill(TYPE_INPUT_SELECTOR, 'Test<"a" | "b">');
    await page.click('button:has-text("Generate")');
    await waitForGeneration(page);

    // Assert - Step Details panel should be visible
    await expect(page.locator('text=Step Details')).toBeVisible();

    // Should display step number
    await expect(page.locator('text=/Step \\d+/')).toBeVisible();

    // Should display expression
    await expect(page.locator('text=Expression')).toBeVisible();
  });

  test('shows Running Results section for union distribution', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await fillMonacoEditor(page, `type Test<T> = T extends any ? T[] : never;`);

    // Act
    await page.fill(TYPE_INPUT_SELECTOR, 'Test<string | number>');
    await page.click('button:has-text("Generate")');
    await waitForGeneration(page);

    // Navigate through steps to find union member step
    const nextButton = page.locator('button:has-text("Next")');
    let foundUnionResults = false;

    for (let i = 0; i < 20; i++) {
      const hasRunningResults = await page.locator('text=Running Results').isVisible();
      if (hasRunningResults) {
        foundUnionResults = true;
        break;
      }
      if (await nextButton.isEnabled()) {
        await nextButton.click();
        await page.waitForTimeout(100);
      } else {
        break;
      }
    }

    // Assert - should find Running Results section during union stepping
    expect(foundUnionResults).toBe(true);
  });

  test('playback controls are functional', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.fill(TYPE_INPUT_SELECTOR, 'string');
    await page.click('button:has-text("Generate")');
    await waitForGeneration(page);

    // Assert - Play button should be visible
    const playButton = page.locator('button:has-text("Play")');
    await expect(playButton).toBeVisible();

    // Act - Click play
    await playButton.click();

    // Assert - Should change to Pause
    await expect(page.locator('button:has-text("Pause")')).toBeVisible();

    // Act - Click pause
    await page.locator('button:has-text("Pause")').click();

    // Assert - Should change back to Play
    await expect(page.locator('button:has-text("Play")')).toBeVisible();
  });

  test('Prev/Next buttons navigate steps', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await fillMonacoEditor(page, `type Loop2<str> = str extends "a" ? 1 : str extends "b" ? 2 : never;`);
    await page.fill(TYPE_INPUT_SELECTOR, 'Loop2<"a" | "b">');
    await page.click('button:has-text("Generate")');
    await waitForGeneration(page);

    // Assert - Initially at step 1
    await expect(page.locator('text=/Step 1 \\/ \\d+/')).toBeVisible();

    // Assert - Prev button should be disabled at step 1
    const prevButton = page.locator('button:has-text("Prev")');
    await expect(prevButton).toBeDisabled();

    // Act - Click Next
    const nextButton = page.locator('button:has-text("Next")');
    await nextButton.click();

    // Assert - Should be at step 2
    await expect(page.locator('text=/Step 2 \\/ \\d+/')).toBeVisible();

    // Assert - Prev should now be enabled
    await expect(prevButton).toBeEnabled();

    // Act - Click Prev
    await prevButton.click();

    // Assert - Back to step 1
    await expect(page.locator('text=/Step 1 \\/ \\d+/')).toBeVisible();
  });

  test('timeline slider changes current step', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await fillMonacoEditor(page, `type Loop2<str> = str extends "a" ? 1 : str extends "b" ? 2 : never;`);
    await page.fill(TYPE_INPUT_SELECTOR, 'Loop2<"a" | "b">');
    await page.click('button:has-text("Generate")');
    await waitForGeneration(page);

    // Get the slider
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();

    // Get max value
    const max = await slider.getAttribute('max');
    expect(max).toBeTruthy();
    const maxValue = parseInt(max!);
    expect(maxValue).toBeGreaterThan(1);

    // Act - Set slider to last step
    await slider.fill(max!);

    // Assert - Should show last step
    const stepText = await page.locator('text=/Step \\d+ \\/ \\d+/').textContent();
    expect(stepText).toContain(`Step ${maxValue + 1} /`);
  });

  test('speed buttons change playback speed', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.fill(TYPE_INPUT_SELECTOR, 'string');
    await page.click('button:has-text("Generate")');
    await waitForGeneration(page);

    // Assert - Speed indicator should show default 1x
    await expect(page.locator('text=Speed: 1')).toBeVisible();

    // Act - Click 2x speed button
    await page.locator('button:has-text("2x")').click();

    // Assert - Speed should update to 2x
    await expect(page.locator('text=Speed: 2')).toBeVisible();
  });
});
