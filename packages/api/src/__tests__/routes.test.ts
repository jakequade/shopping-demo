import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { buildApp } from "./helper.ts";
import type { FastifyInstance } from "fastify";

let app: FastifyInstance;
let userId: string;
let productId: string;

beforeAll(async () => {
  app = await buildApp();

  // Fetch a product to use in cart tests
  const productsRes = await app.inject({
    method: "GET",
    url: "/api/products",
  });
  const products = JSON.parse(productsRes.payload);
  productId = products[0].id;
});

afterAll(async () => {
  await app.close();
});

describe("POST /api/signup", () => {
  it("creates a user and returns a userId", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/signup",
      payload: { name: "Test User" },
    });
    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty("userId");
    expect(typeof body.userId).toBe("string");
    userId = body.userId;
  });

  it("creates a user without a name", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/signup",
    });
    expect(res.statusCode).toBe(201);
    expect(JSON.parse(res.payload)).toHaveProperty("userId");
  });
});

describe("GET /api/products", () => {
  it("returns all seeded products", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/products",
    });
    expect(res.statusCode).toBe(200);
    const products = JSON.parse(res.payload);
    expect(products.length).toBeGreaterThanOrEqual(6);
    expect(products[0]).toHaveProperty("id");
    expect(products[0]).toHaveProperty("name");
    expect(products[0]).toHaveProperty("price");
    expect(products[0]).toHaveProperty("category");
  });

  it("all prices are positive integers (cents)", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/products",
    });
    const products = JSON.parse(res.payload);
    for (const p of products) {
      expect(Number.isInteger(p.price)).toBe(true);
      expect(p.price).toBeGreaterThan(0);
    }
  });

  it("spans at least 3 categories", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/products",
    });
    const products = JSON.parse(res.payload);
    const categories = new Set(products.map((p: any) => p.category));
    expect(categories.size).toBeGreaterThanOrEqual(3);
  });
});

describe("Cart API", () => {
  it("returns empty cart for new user", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/cart",
      headers: { "x-user-id": userId },
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.items).toEqual([]);
    expect(body.grandTotal).toBe(0);
  });

  it("adds a product to the cart", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/cart",
      headers: { "x-user-id": userId },
      payload: { productId, quantity: 2 },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({ ok: true });
  });

  it("cart now contains the item with correct subtotal", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/cart",
      headers: { "x-user-id": userId },
    });
    const body = JSON.parse(res.payload);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].product.id).toBe(productId);
    expect(body.items[0].quantity).toBe(2);
    expect(body.items[0].subtotal).toBeGreaterThan(0);
    expect(body.grandTotal).toBe(body.items[0].subtotal);
  });

  it("increments quantity when adding same product again", async () => {
    await app.inject({
      method: "POST",
      url: "/api/cart",
      headers: { "x-user-id": userId },
      payload: { productId, quantity: 1 },
    });

    const res = await app.inject({
      method: "GET",
      url: "/api/cart",
      headers: { "x-user-id": userId },
    });
    const body = JSON.parse(res.payload);
    expect(body.items[0].quantity).toBe(3);
  });

  it("removes a line item from the cart", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: `/api/cart?productId=${productId}`,
      headers: { "x-user-id": userId },
    });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.payload)).toEqual({ ok: true });
  });

  it("cart is empty after removal", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/cart",
      headers: { "x-user-id": userId },
    });
    const body = JSON.parse(res.payload);
    expect(body.items).toHaveLength(0);
    expect(body.grandTotal).toBe(0);
  });

  it("rejects removing a product not in cart", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: `/api/cart?productId=${productId}`,
      headers: { "x-user-id": userId },
    });
    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty("error", "Not Found");
  });
});

describe("Cart validation", () => {
  it("rejects requests without x-user-id", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/cart",
    });
    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty("error", "Unauthorized");
  });

  it("rejects adding unknown product", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/cart",
      headers: { "x-user-id": userId },
      payload: {
        productId: "00000000-0000-0000-0000-000000000000",
      },
    });
    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body).toHaveProperty("error", "Not Found");
    expect(body.message).toContain("Unknown product ID");
  });

  it("rejects adding with non-positive quantity", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/cart",
      headers: { "x-user-id": userId },
      payload: { productId, quantity: 0 },
    });
    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.message).toContain("positive integer");
  });
});