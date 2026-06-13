import { z } from "zod";
import { Product } from "@pc/shared";
import { AddToCartButton } from "./components/AddToCartButton";

const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:3001";

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_ORIGIN}/api/products`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return z.array(Product).parse(await res.json());
}

export default async function HomePage() {
  let products: Product[] = [];
  try {
    products = await getProducts();
  } catch {
    // will surface on screen
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto" }}>
      <section>
        <h2 className="text-lg font-semibold mb-3">Products</h2>
        {products.length === 0 && <p>No products available.</p>}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1rem",
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const dollars = (product.price / 100).toFixed(2);
  return (
    <div className="card bg-base-100 border border-base-200">
      <div className="card-body p-4">
        <h3 className="card-title">{product.name}</h3>
        <p className="text-sm text-base-content/70">{product.category}</p>
        <p className="text-lg font-bold">${dollars}</p>
        <AddToCartButton productId={product.id} />
      </div>
    </div>
  );
}