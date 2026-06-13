"use client";

import { useState } from "react";

const API_ORIGIN =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:3001"
    : "http://localhost:3001";

export function AddToCartButton({ productId }: { productId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setError("Please sign in first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_ORIGIN}/api/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.message ?? "Failed to add to cart");
        return;
      }

      // Dispatch a custom event so CartView can refresh
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch {
      setError("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`btn btn-primary btn-sm ${loading ? "btn-disabled" : ""}`}
      >
        {loading ? "Adding..." : "Add to cart"}
      </button>
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}