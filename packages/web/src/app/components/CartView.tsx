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
      const res = await fetch(
        `${API_ORIGIN}/api/cart?productId=${productId}`,
        {
          method: "DELETE",
          headers: { "x-user-id": userId },
        },
      );
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
      <div className="card bg-base-100">
        <div className="card-body p-4">
          <h2 className="card-title">Your Cart</h2>
          <SignupForm onSignup={(id) => setUserId(id)} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-base-100">
        <div className="card-body p-4">
          <h2 className="card-title">Your Cart</h2>
          <p className="text-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!cart) return <p className="p-4 text-base-content/70">Loading cart...</p>;

  return (
    <div className="card bg-base-100">
      <div className="card-body p-4">
        <h2 className="card-title">Your Cart</h2>
        {cart.items.length === 0 ? (
          <p>Cart is empty.</p>
        ) : (
          <>
            <table className="table table-zebra table-sm">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item.product.id}>
                    <td>{item.product.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatPrice(item.subtotal)}</td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.product.id)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="font-bold text-lg mt-2">
              Total: {formatPrice(cart.grandTotal)}
            </p>
          </>
        )}
      </div>
    </div>
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
    <form onSubmit={handleSubmit}>
      {error && <p className="text-error text-sm mb-2">{error}</p>}
      <p className="text-sm text-base-content/60 mb-2">
        Sign in to start shopping
      </p>
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name (optional)"
          className="input input-bordered input-sm flex-1"
        />
        <button type="submit" className="btn btn-primary btn-sm">
          Sign in
        </button>
      </div>
    </form>
  );
}