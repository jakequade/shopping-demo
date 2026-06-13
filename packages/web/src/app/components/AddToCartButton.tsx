"use client";

import { useState, useEffect, useCallback } from "react";
import { Cart } from "@pc/shared";
import { getCart, addToCartItem, setCartQuantity } from "../actions";

export function AddToCartButton({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const fetchCartQuantity = useCallback(async () => {
    const uid = localStorage.getItem("userId");
    if (!uid) {
      setQuantity(null);
      setInputValue("");
      return;
    }
    try {
      const cart = await getCart(uid);
      const item = cart.items.find((i) => i.product.id === productId);
      const q = item ? item.quantity : null;
      setQuantity(q);
      setInputValue(q !== null ? String(q) : "");
    } catch {
      // silent
    }
  }, [productId]);

  useEffect(() => {
    fetchCartQuantity();
  }, [fetchCartQuantity]);

  useEffect(() => {
    const handler = () => fetchCartQuantity();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [fetchCartQuantity]);

  const notifyCartUpdated = () => {
    window.dispatchEvent(new CustomEvent("cart-updated"));
  };

  const handleAddToCart = async () => {
    const uid = localStorage.getItem("userId");
    if (!uid) {
      setError("Please sign in first");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await addToCartItem(productId, uid, 1);
      setQuantity(1);
      setInputValue("1");
      notifyCartUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  const handleSetQuantity = async (newQty: number) => {
    const uid = localStorage.getItem("userId");
    if (!uid || newQty < 0) return;
    setLoading(true);
    setError(null);
    try {
      await setCartQuantity(productId, newQty, uid);
      if (newQty === 0) {
        setQuantity(null);
        setInputValue("");
      } else {
        setQuantity(newQty);
        setInputValue(String(newQty));
      }
      notifyCartUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  const commitInput = () => {
    const parsed = parseInt(inputValue, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      if (parsed === (quantity ?? 0)) return;
      handleSetQuantity(parsed);
    } else {
      setInputValue(quantity !== null ? String(quantity) : "");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  if (!userId || quantity === null) {
    return (
      <div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={loading}
          className={`btn btn-primary btn-sm ${loading ? "btn-disabled" : ""}`}
        >
          {loading ? "Adding..." : "Add to cart"}
        </button>
        {error && <p className="text-error text-xs mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handleSetQuantity(quantity - 1)}
          disabled={loading}
          className="btn btn-outline btn-sm btn-square"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={commitInput}
          onKeyDown={handleInputKeyDown}
          min={0}
          className="input input-bordered input-sm w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => handleSetQuantity(quantity + 1)}
          disabled={loading}
          className="btn btn-outline btn-sm btn-square"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}