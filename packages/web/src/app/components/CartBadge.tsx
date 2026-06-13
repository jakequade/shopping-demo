"use client";

import { useState, useEffect } from "react";
import { Cart } from "@pc/shared";
import { getCart } from "../actions";

export function CartBadge() {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setCount(0);
      return;
    }
    try {
      const cart = await getCart(userId);
      setCount(cart.items.reduce((s, i) => s + i.quantity, 0));
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