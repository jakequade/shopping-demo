"use client";

import { useState, useEffect } from "react";

const API_ORIGIN =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:3001"
    : "http://localhost:3001";

export function CartBadge() {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setCount(0);
      return;
    }
    try {
      const res = await fetch(`${API_ORIGIN}/api/cart`, {
        headers: { "x-user-id": userId },
      });
      if (!res.ok) {
        setCount(0);
        return;
      }
      const cart = await res.json();
      setCount(cart.items?.reduce((s: number, i: { quantity: number }) => s + i.quantity, 0) ?? 0);
    } catch {
      setCount(0);
    }
  };

  useEffect(() => {
    fetchCount();
  }, []);

  useEffect(() => {
    const handler = () => fetchCount();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, []);

  if (count === 0) return null;

  return (
    <span className="badge badge-primary badge-sm absolute -top-1 -right-1">
      {count}
    </span>
  );
}