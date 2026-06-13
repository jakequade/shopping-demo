import { z } from "zod";

// ── Category ──────────────────────────────────────────
export const Category = z.enum([
  "dry-food",
  "wet-food",
  "treats",
  "toys",
  "healthcare",
]);
export type Category = z.infer<typeof Category>;

// ── Product ───────────────────────────────────────────
export const Product = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().int().positive(), // cents
  category: Category,
});
export type Product = z.infer<typeof Product>;

// ── CartItem ──────────────────────────────────────────
export const CartItem = z.object({
  product: Product,
  quantity: z.number().int().positive(),
  subtotal: z.number().int().nonnegative(), // cents
});
export type CartItem = z.infer<typeof CartItem>;

// ── Cart ──────────────────────────────────────────────
export const Cart = z.object({
  items: z.array(CartItem),
  grandTotal: z.number().int().nonnegative(), // cents
});
export type Cart = z.infer<typeof Cart>;

// ── ApiError ──────────────────────────────────────────
export const ApiError = z.object({
  statusCode: z.number().int(),
  error: z.string(),
  message: z.string(),
});
export type ApiError = z.infer<typeof ApiError>;

// ── API request payloads ──────────────────────────────
export const AddToCartInput = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});
export type AddToCartInput = z.infer<typeof AddToCartInput>;

export const RemoveFromCartInput = z.object({
  productId: z.string().uuid(),
});
export type RemoveFromCartInput = z.infer<typeof RemoveFromCartInput>;

// ── Signup ────────────────────────────────────────────
export const SignupInput = z.object({
  name: z.string().optional(),
});
export type SignupInput = z.infer<typeof SignupInput>;

// ── Helpers ───────────────────────────────────────────
export function formatPrice(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}