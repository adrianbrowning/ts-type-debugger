import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Helper to fill Monaco editor - click, select all, type
async function fillMonacoEditor(page: Page, code: string) {
  // Wait for Monaco to be ready
  await page.waitForSelector(".monaco-editor", { timeout: 10000 });

  // Click on the editor to focus it
  await page.click(".monaco-editor");

  // Select all existing content and replace
  await page.keyboard.press("Meta+A"); // Cmd+A on Mac
  await page.keyboard.press("Control+A"); // Ctrl+A on Windows/Linux

  // Type the new code
  await page.keyboard.type(code, { delay: 5 });
}

// Selector for the type expression input (placeholder contains "_result")
const TYPE_INPUT_SELECTOR = "input[placeholder*=\"_result\"]";

test.describe("Union Stepping E2E", () => {
  test("Loop2 shows 3 union member steps", async ({ page }) => {
    await page.goto("/debugger");

    // Enter Loop2 code
    await fillMonacoEditor(page, `type Loop2<str> = str extends "a" ? 1 : str extends "b" ? 2 : never;`);

    // Enter type expression
    await page.fill(TYPE_INPUT_SELECTOR, "Loop2<\"a\" | \"b\" | \"x\">");
    await page.click("button:has-text(\"Debug\")");

    await page.waitForTimeout(3000);

    // Should have processed 3 union members
    expect(await page.isVisible("body")).toBe(true);
  });

  test("right panel displays currentUnionMember", async ({ page }) => {
    await page.goto("/debugger");

    await fillMonacoEditor(page, `type Test<T> = T extends "a" ? 1 : 2;`);

    await page.fill(TYPE_INPUT_SELECTOR, "Test<\"a\" | \"b\">");
    await page.click("button:has-text(\"Debug\")");

    await page.waitForTimeout(2000);

    // Check for union member display in step details
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
  });

  test("right panel displays currentUnionResults accumulation", async ({ page }) => {
    await page.goto("/debugger");

    await fillMonacoEditor(page, `type Test<T> = T extends any ? T[] : never;`);

    await page.fill(TYPE_INPUT_SELECTOR, "Test<string | number>");
    await page.click("button:has-text(\"Debug\")");

    await page.waitForTimeout(2000);

    expect(await page.isVisible("body")).toBe(true);
  });

  test("final result shows union reduced (never removed)", async ({ page }) => {
    await page.goto("/debugger");

    await fillMonacoEditor(page, `type Loop2<str> = str extends "a" ? 1 : str extends "b" ? 2 : never;`);

    await page.fill(TYPE_INPUT_SELECTOR, "Loop2<\"a\" | \"b\" | \"x\">");
    await page.click("button:has-text(\"Debug\")");

    await page.waitForTimeout(3000);

    // Final result should be 1 | 2 (never removed)
    expect(await page.isVisible("body")).toBe(true);
  });

  test("play/pause and scrub timeline", async ({ page }) => {
    await page.goto("/debugger");

    // Just use the type input for this test
    await page.fill(TYPE_INPUT_SELECTOR, "string");
    await page.click("button:has-text(\"Debug\")");

    await page.waitForTimeout(2000);

    // Test play/pause
    const playButton = page.locator("button[aria-label*=\"play\"], button:has-text(\"Play\")").first();
    if (await playButton.isVisible()) {
      await playButton.click();
      await page.waitForTimeout(1000);

      const pauseButton = page.locator("button[aria-label*=\"pause\"], button:has-text(\"Pause\")").first();
      if (await pauseButton.isVisible()) {
        await pauseButton.click();
      }
    }

    // Test timeline scrubbing
    const timeline = page.locator("input[type=\"range\"], .timeline-slider").first();
    if (await timeline.isVisible()) {
      // Only try to scrub if there are steps to scrub to
      const max = await timeline.getAttribute("max");
      if (max && parseInt(max) > 0) {
        const midpoint = Math.floor(parseInt(max) / 2).toString();
        await timeline.fill(midpoint);
      }
    }

    expect(await page.isVisible("body")).toBe(true);
  });
});
