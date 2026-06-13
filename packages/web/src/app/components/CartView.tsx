"use client";

import { useState, useEffect } from "react";
import { Cart, formatPrice } from "@pc/shared";

const API_ORIGIN =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_ORIGIN ?? "http://localhost:3001"
    : "http://localhost:3001";

export function CartView() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (uid) setUserId(uid);
  }, []);

  const refreshCart = async (uid: string) => {
    try {
      const res = await fetch(`${API_ORIGIN}/api/cart`, {
        headers: { "x-user-id": uid },
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message ?? "Failed to load cart");
        return;
      }
      setCart(await res.json());
      setError(null);
    } catch {
      setError("Failed to load cart");
    }
  };

  useEffect(() => {
    if (userId) refreshCart(userId);
  }, [userId]);

  // Listen for cart-updated events from AddToCartButton
  useEffect(() => {
    const handler = () => userId && refreshCart(userId);
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [userId]);

  const handleRemove = async (productId: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_ORIGIN}/api/cart?productId=${productId}`, {
        method: "DELETE",
        headers: { "x-user-id": userId },
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message ?? "Failed to remove item");
        return;
      }
      setError(null);
      await refreshCart(userId);
    } catch {
      setError("Failed to remove item");
    }
  };

  if (!userId) {
    return (
      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Your Cart
        </h2>
        <SignupForm onSignup={(id) => setUserId(id)} />
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Your Cart
        </h2>
        <p style={{ color: "#dc2626" }}>{error}</p>
      </section>
    );
  }

  if (!cart) return <p>Loading cart...</p>;

  return (
    <section>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>
        Your Cart
      </h2>
      {cart.items.length === 0 ? (
        <p>Cart is empty.</p>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
                <th style={{ padding: 8 }}>Product</th>
                <th style={{ padding: 8 }}>Qty</th>
                <th style={{ padding: 8 }}>Subtotal</th>
                <th style={{ padding: 8 }}></th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.product.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: 8 }}>{item.product.name}</td>
                  <td style={{ padding: 8 }}>{item.quantity}</td>
                  <td style={{ padding: 8 }}>{formatPrice(item.subtotal)}</td>
                  <td style={{ padding: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.product.id)}
                      style={{
                        color: "#dc2626",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            style={{
              fontWeight: 700,
              fontSize: "1.125rem",
              marginTop: "1rem",
            }}
          >
            Total: {formatPrice(cart.grandTotal)}
          </div>
        </>
      )}
    </section>
  );
}

function SignupForm({ onSignup }: { onSignup: (id: string) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_ORIGIN}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message ?? "Signup failed");
        return;
      }
      const data = await res.json();
      localStorage.setItem("userId", data.userId);
      onSignup(data.userId);
    } catch {
      setError("Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "0.5rem" }}>
      {error && <p style={{ color: "#dc2626", marginBottom: 8 }}>{error}</p>}
      <p style={{ marginBottom: 8, color: "#666" }}>Sign in to start shopping</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name (optional)"
        style={{
          padding: "0.4rem 0.75rem",
          border: "1px solid #ccc",
          borderRadius: 6,
          marginRight: 8,
        }}
      />
      <button
        type="submit"
        style={{
          padding: "0.4rem 1rem",
          background: "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Sign in
      </button>
    </form>
  );
}