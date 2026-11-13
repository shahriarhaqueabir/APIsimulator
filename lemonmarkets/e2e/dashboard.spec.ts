import { test, expect } from "@playwright/test";

test.describe("Lemon Ops Console", () => {
  test("loads dashboard with KPI cards", async ({ page }) => {
    await page.goto("/dashboard");

    // Dashboard title is visible
    await expect(page.locator("h1")).toHaveText("Dashboard");

    // KPI cards are rendered (CardTitle renders as div[data-slot="card-title"])
    const cards = page.locator('[data-slot="card-title"]');
    await expect(cards.nth(0)).toHaveText("Orders Today");
    await expect(cards.nth(1)).toHaveText("Failed Today");
    await expect(cards.nth(2)).toHaveText("Active Clients");
    await expect(cards.nth(3)).toHaveText("Open Issues");
  });

  test("navigates through all views", async ({ page }) => {
    await page.goto("/dashboard");

    // Navigate to Orders
    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.locator("h1")).toHaveText("Orders");

    // Navigate to Accounts
    await page.getByRole("link", { name: "Accounts" }).click();
    await expect(page.locator("h1")).toHaveText("Accounts");

    // Navigate to Events
    await page.getByRole("link", { name: "Events" }).click();
    await expect(page.locator("h1")).toHaveText("Events");

    // Navigate to Triage
    await page.getByRole("link", { name: "Triage Center" }).click();
    await expect(page.locator("h1")).toHaveText("Triage Center");
  });

  test("triage page shows playbooks", async ({ page }) => {
    await page.goto("/triage");

    const allGuidesCard = page.locator("text=All Triage Playbooks");
    await expect(allGuidesCard).toBeVisible();

    // Click first playbook
    const playbook = page.locator("text=Order Stuck in 'open'").first();
    await playbook.click();

    // Guide panel opens
    await expect(
      page.locator("text=Check if the market is currently open")
    ).toBeVisible();
  });
});
