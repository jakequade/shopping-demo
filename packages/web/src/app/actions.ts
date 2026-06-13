// Server actions are not used directly.
// Components use client-side fetch to the API with x-user-id header.
// This file is kept for future migration to full Server Action pattern.

export async function addToCart(_productId: string, _formData: FormData) {
  throw new Error(
    "Direct Server Action not wired — use client-side fetch instead.",
  );
}

export async function removeFromCart(
  _productId: string,
  _formData: FormData,
) {
  throw new Error(
    "Direct Server Action not wired — use client-side fetch instead.",
  );
}

export async function getCart(): Promise<null> {
  throw new Error(
    "Direct Server Action not wired — use client-side fetch instead.",
  );
}