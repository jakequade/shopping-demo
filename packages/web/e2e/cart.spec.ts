import { test, expect } from "@playwright/test";

test.describe("Shopping cart e2e", () => {
  test("sign up, browse products, add to cart, verify cart", async ({ page }) => {
    await page.goto("/");

    // Should show the products list
    await expect(page.locator("h1")).toHaveText("Pet Circle");
    await expect(page.locator("text=Add to cart").first()).toBeVisible();

    // Sign in
    const signInButton = page.locator("button", { hasText: "Sign in" });
    await expect(signInButton).toBeVisible();
    await signInButton.click();

    // After sign in, cart should be visible and empty
    await expect(page.locator("text=Cart is empty")).toBeVisible({ timeout: 5000 });

    // Add a product to cart — need to refresh page after signup to load cart
    await page.reload();

    // Click first "Add to cart" button
    await page.locator("button", { hasText: "Add to cart" }).first().click();

    // Wait a moment for the API call and cart refresh
    await page.waitForTimeout(1000);

    // Reload — cart should now have an item
    await page.reload();

    // Cart should show the item
    await expect(page.locator("text=Remove")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Total:")).toBeVisible();
  });
});