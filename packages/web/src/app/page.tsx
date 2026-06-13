import { Product } from "@pc/shared";
import { AddToCartButton } from "./components/AddToCartButton";
import { CartView } from "./components/CartView";

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
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
        Pet Circle
      </h1>

      <section>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.75rem" }}>
          Products
        </h2>
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

      <hr style={{ margin: "2rem 0" }} />

      <CartView />
    </main>
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