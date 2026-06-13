"use server";

import type { Cart } from "@pc/shared";

const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:3001";

export async function signup(name?: string) {
  const res = await fetch(`${API_ORIGIN}/api/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name || undefined }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Signup failed");
  }
  return res.json() as Promise<{ userId: string }>;
}

export async function getCart(userId: string): Promise<Cart> {
  const res = await fetch(`${API_ORIGIN}/api/cart`, {
    headers: { "x-user-id": userId },
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Failed to load cart");
  }
  return res.json();
}

export async function addToCartItem(
  productId: string,
  userId: string,
  quantity: number = 1,
) {
  const res = await fetch(`${API_ORIGIN}/api/cart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Failed to add to cart");
  }
  return res.json();
}

export async function setCartQuantity(
  productId: string,
  quantity: number,
  userId: string,
) {
  if (quantity === 0) {
    return removeFromCart(productId, userId);
  }
  const res = await fetch(`${API_ORIGIN}/api/cart`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": userId,
    },
    body: JSON.stringify({ productId, quantity }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Failed to update quantity");
  }
  return res.json();
}

export async function removeFromCart(productId: string, userId: string) {
  const res = await fetch(
    `${API_ORIGIN}/api/cart?productId=${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
      headers: { "x-user-id": userId },
    },
  );
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Failed to remove from cart");
  }
  return res.json();
}