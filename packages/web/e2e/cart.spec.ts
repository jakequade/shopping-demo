import { test, expect } from "@playwright/test";

test.describe("Shopping cart e2e", () => {
  test("sign up, browse products, add to cart, verify cart", async ({ page }) => {
    await page.goto("/");

    // Should show the products list
    await expect(page.locator("h1")).toHaveText("Pet Circle");
    await expect(page.locator("button", { hasText: "Add to cart" }).first()).toBeVisible();

    // Grab product names for later assertions
    const productCards = page.locator(".card .card-title");
    const firstProductName = await productCards.nth(0).textContent();
    const secondProductName = await productCards.nth(1).textContent();
    expect(firstProductName).not.toBeNull();
    expect(secondProductName).not.toBeNull();

    // Sign in with a name (tests the react-hook-form input)
    const nameInput = page.locator('input[placeholder="Your name (optional)"]');
    await nameInput.fill("Test User");

    const signInButton = page.locator("button", { hasText: "Sign in" });
    await expect(signInButton).toBeVisible();
    await signInButton.click();

    // Wait for the cart sidebar to show the empty state
    await expect(page.locator("text=Cart is empty")).toBeVisible({ timeout: 10_000 });

    // ── Add first product ──
    await page.locator("button", { hasText: "Add to cart" }).first().click();

    // Cart should show the product name, Remove button, and Total
    await expect(
      page.locator(`text=${firstProductName}`).first(),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("button", { hasText: "Remove" })).toBeVisible();
    await expect(page.locator("text=Total:")).toBeVisible();

    // ── Increase quantity with + button ──
    const increaseButton = page.locator('button[aria-label="Increase quantity"]');
    await expect(increaseButton).toBeVisible();
    await increaseButton.click();

    // Quantity input should now show 2
    const quantityInput = page.locator('input[type="number"]');
    await expect(quantityInput).toHaveValue("2", { timeout: 10_000 });

    // ── Add second product ──
    // The first product's button is now quantity controls, so the next
    // "Add to cart" belongs to the second product
    await page.locator("button", { hasText: "Add to cart" }).first().click();

    // Both products should appear in the cart table
    await expect(
      page.locator(`text=${secondProductName}`).first(),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.locator(`text=${firstProductName}`).first(),
    ).toBeVisible();

    // ── Remove first product ──
    await page.locator("button", { hasText: "Remove" }).first().click();

    // First product should be gone from the cart sidebar, second should remain
    const cartSidebar = page.locator(".drawer-side");
    await expect(
      cartSidebar.getByText(firstProductName!),
    ).not.toBeVisible();
    await expect(
      page.locator(`text=${secondProductName}`).first(),
    ).toBeVisible();
    // Total should still be visible after removal
    await expect(page.locator("text=Total:")).toBeVisible();
  });
});