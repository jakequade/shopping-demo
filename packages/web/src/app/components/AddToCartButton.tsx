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
        style={{
          marginTop: 8,
          padding: "0.5rem 1rem",
          background: loading ? "#93c5fd" : "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Adding..." : "Add to cart"}
      </button>
      {error && (
        <p style={{ color: "#dc2626", fontSize: "0.8rem", marginTop: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}