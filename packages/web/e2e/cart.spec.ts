import { test, expect } from "@playwright/test";

test.describe("Shopping cart e2e", () => {
  test("sign up, browse products, add to cart, verify cart", async ({ page }) => {
    // Intercept cart API calls
    const cartResponsePromise = page.waitForResponse(
      (res) => res.url().includes("/api/cart") && res.status() === 200,
    );

    await page.goto("/");

    // Should show the products list
    await expect(page.locator("h1")).toHaveText("Pet Circle");
    await expect(page.locator("text=Add to cart").first()).toBeVisible();

    // Sign in
    const signInButton = page.locator("button", { hasText: "Sign in" });
    await expect(signInButton).toBeVisible();
    await signInButton.click();

    // Wait for the cart API call after signup completes
    await cartResponsePromise;

    // Cart should be visible and empty
    await expect(page.locator("text=Cart is empty")).toBeVisible();

    // Add a product to cart
    const addResponsePromise = page.waitForResponse(
      (res) =>
        res.url().includes("/api/cart") &&
        res.request().method() === "POST" &&
        res.status() === 200,
    );

    await page.locator("button", { hasText: "Add to cart" }).first().click();

    // Wait for the POST to complete, then for the subsequent GET that refreshes the cart
    await addResponsePromise;
    await page.waitForResponse(
      (res) =>
        res.url().includes("/api/cart") &&
        res.request().method() === "GET" &&
        res.status() === 200,
    );

    // Cart should now show the item
    await expect(page.locator("text=Remove")).toBeVisible();
    await expect(page.locator("text=Total:")).toBeVisible();
  });
});