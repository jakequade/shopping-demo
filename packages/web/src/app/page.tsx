import { Product } from "@pc/shared";
import { AddToCartButton } from "./components/AddToCartButton";

const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:3001";

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_ORIGIN}/api/products`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
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
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: "1rem",
        background: "#fff",
      }}
    >
      <div style={{ fontWeight: 600 }}>{product.name}</div>
      <div style={{ color: "#666", fontSize: "0.875rem", marginTop: 4 }}>
        {product.category}
      </div>
      <div style={{ fontSize: "1.125rem", fontWeight: 700, marginTop: 8 }}>
        ${dollars}
      </div>
      <AddToCartButton productId={product.id} />
    </div>
  );
}