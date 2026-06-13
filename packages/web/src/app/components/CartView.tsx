"use client";

import { useState, useEffect } from "react";
import { Cart, formatPrice } from "@pc/shared";
import { getCart, removeFromCart, signup } from "../actions";

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
      const cart = await getCart(uid);
      setCart(Cart.parse(cart));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load cart");
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
      await removeFromCart(productId, userId);
      setError(null);
      await refreshCart(userId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to remove item");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    setUserId(null);
    setCart(null);
    setError(null);
    window.dispatchEvent(new CustomEvent("cart-updated"));
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
          <div className="flex items-center justify-between">
            <h2 className="card-title">Your Cart</h2>
            <button onClick={handleLogout} className="btn btn-ghost btn-xs">Log out</button>
          </div>
          <p className="text-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!cart) return <p className="p-4 text-base-content/70">Loading cart...</p>;

  return (
    <div className="card bg-base-100">
      <div className="card-body p-4">
        <div className="flex items-center justify-between">
          <h2 className="card-title">Your Cart</h2>
          <button onClick={handleLogout} className="btn btn-ghost btn-xs">Log out</button>
        </div>
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

function SignupForm({ onSignup: onSignupCb }: { onSignup: (id: string) => void }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = await signup(name || undefined);
      localStorage.setItem("userId", data.userId);
      onSignupCb(data.userId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signup failed");
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