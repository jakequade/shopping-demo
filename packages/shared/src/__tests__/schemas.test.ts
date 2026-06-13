import { describe, it, expect } from "vitest";
import {
  Product,
  Category,
  CartItem,
  Cart,
  ApiError,
  AddToCartInput,
  RemoveFromCartInput,
  formatPrice,
} from "../schemas.ts";

const validProduct = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  name: "Premium Chicken Kibble",
  price: 2499,
  category: "dry-food" as const,
};

describe("Product", () => {
  it("accepts a valid product", () => {
    expect(Product.parse(validProduct)).toEqual(validProduct);
  });

  it("rejects a product with non-integer price", () => {
    expect(() => Product.parse({ ...validProduct, price: 24.99 })).toThrow();
  });

  it("rejects a product with negative price", () => {
    expect(() => Product.parse({ ...validProduct, price: -100 })).toThrow();
  });

  it("rejects a product with zero price", () => {
    expect(() => Product.parse({ ...validProduct, price: 0 })).toThrow();
  });

  it("rejects a product with invalid category", () => {
    expect(() =>
      Product.parse({ ...validProduct, category: "electronics" }),
    ).toThrow();
  });

  it("rejects a product with empty name", () => {
    expect(() => Product.parse({ ...validProduct, name: "" })).toThrow();
  });

  it("rejects a product with non-UUID id", () => {
    expect(() => Product.parse({ ...validProduct, id: "not-a-uuid" })).toThrow();
  });
});

describe("Category", () => {
  it("accepts all valid categories", () => {
    const cats = ["dry-food", "wet-food", "treats", "toys", "healthcare"] as const;
    for (const c of cats) {
      expect(Category.parse(c)).toBe(c);
    }
  });

  it("rejects an unknown category", () => {
    expect(() => Category.parse("clothing")).toThrow();
  });
});

describe("CartItem", () => {
  it("computes no schema-level subtotal (computed at runtime)", () => {
    const item = {
      product: validProduct,
      quantity: 2,
      subtotal: 4998,
    };
    expect(CartItem.parse(item)).toEqual(item);
  });

  it("rejects zero quantity", () => {
    expect(() =>
      CartItem.parse({ product: validProduct, quantity: 0, subtotal: 0 }),
    ).toThrow();
  });

  it("rejects negative quantity", () => {
    expect(() =>
      CartItem.parse({ product: validProduct, quantity: -1, subtotal: -2499 }),
    ).toThrow();
  });

  it("rejects non-integer quantity", () => {
    expect(() =>
      CartItem.parse({ product: validProduct, quantity: 1.5, subtotal: 3748 }),
    ).toThrow();
  });
});

describe("Cart", () => {
  it("accepts an empty cart", () => {
    expect(Cart.parse({ items: [], grandTotal: 0 })).toEqual({
      items: [],
      grandTotal: 0,
    });
  });

  it("rejects negative grand total", () => {
    expect(() =>
      Cart.parse({
        items: [{ product: validProduct, quantity: 1, subtotal: 2499 }],
        grandTotal: -1,
      }),
    ).toThrow();
  });

  it("validates grand total is integer", () => {
    expect(() =>
      Cart.parse({
        items: [],
        grandTotal: 10.5,
      }),
    ).toThrow();
  });
});

describe("ApiError", () => {
  it("accepts a valid error object", () => {
    expect(
      ApiError.parse({
        statusCode: 404,
        error: "Not Found",
        message: "Product not found",
      }),
    ).toBeTruthy();
  });

  it("rejects a missing message", () => {
    expect(() =>
      ApiError.parse({ statusCode: 400, error: "Bad Request" }),
    ).toThrow();
  });

  it("rejects a non-integer status code", () => {
    expect(() =>
      ApiError.parse({ statusCode: 400.5, error: "Bad", message: "x" }),
    ).toThrow();
  });
});

describe("AddToCartInput", () => {
  it("accepts valid input with defaults", () => {
    const result = AddToCartInput.parse({
      productId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.quantity).toBe(1);
  });

  it("accepts explicit quantity", () => {
    const result = AddToCartInput.parse({
      productId: "550e8400-e29b-41d4-a716-446655440000",
      quantity: 5,
    });
    expect(result.quantity).toBe(5);
  });

  it("rejects non-positive quantity", () => {
    expect(() =>
      AddToCartInput.parse({
        productId: "550e8400-e29b-41d4-a716-446655440000",
        quantity: 0,
      }),
    ).toThrow();
  });

  it("rejects non-UUID productId", () => {
    expect(() =>
      AddToCartInput.parse({ productId: "bad-id" }),
    ).toThrow();
  });
});

describe("RemoveFromCartInput", () => {
  it("accepts valid input", () => {
    expect(
      RemoveFromCartInput.parse({
        productId: "550e8400-e29b-41d4-a716-446655440000",
      }),
    ).toBeTruthy();
  });

  it("rejects non-UUID productId", () => {
    expect(() =>
      RemoveFromCartInput.parse({ productId: "" }),
    ).toThrow();
  });
});

describe("formatPrice", () => {
  it("formats cents to dollars", () => {
    expect(formatPrice(2499)).toBe("$24.99");
  });

  it("handles zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("handles single digit cents", () => {
    expect(formatPrice(5)).toBe("$0.05");
  });
});