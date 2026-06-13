"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Cart } from "@pc/shared";
import { getCart, addToCartItem, setCartQuantity } from "../actions";

const QuantityFormSchema = z.object({
  quantity: z.coerce.number().int().nonnegative(),
});

type QuantityForm = z.infer<typeof QuantityFormSchema>;

export function AddToCartButton({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<QuantityForm>({
    resolver: zodResolver(QuantityFormSchema),
    defaultValues: { quantity: 0 },
  });

  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const fetchCartQuantity = useCallback(async () => {
    const uid = localStorage.getItem("userId");
    if (!uid) {
      setQuantity(null);
      return;
    }
    try {
      const cart = await getCart(uid);
      const item = cart.items.find((i) => i.product.id === productId);
      const q = item ? item.quantity : null;
      setQuantity(q);
      if (q !== null) setValue("quantity", q);
    } catch {
      // silent
    }
  }, [productId, setValue]);

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
      setValue("quantity", 1);
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
      } else {
        setQuantity(newQty);
        setValue("quantity", newQty);
      }
      notifyCartUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  const commitInput = async () => {
    const valid = await trigger("quantity");
    if (!valid) return;
    const val = getValues("quantity");
    if (val === quantity) return;
    handleSetQuantity(val);
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

  const quantityRegister = register("quantity", { valueAsNumber: true });

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
          name={quantityRegister.name}
          ref={quantityRegister.ref}
          onChange={quantityRegister.onChange}
          onBlur={(e) => {
            quantityRegister.onBlur(e);
            commitInput();
          }}
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
      {errors.quantity && (
        <p className="text-error text-xs mt-1">{errors.quantity.message}</p>
      )}
      {error && <p className="text-error text-xs mt-1">{error}</p>}
    </div>
  );
}