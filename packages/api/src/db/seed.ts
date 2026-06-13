import { db, schema } from "./index.ts";

const PRODUCTS = [
  { name: "Premium Chicken Kibble", price: 2499, category: "dry-food" as const },
  { name: "Salmon & Rice Dinner", price: 1899, category: "wet-food" as const },
  { name: "Beef Liver Bites", price: 799, category: "treats" as const },
  { name: "Squeaky Bone Toy", price: 1299, category: "toys" as const },
  { name: "Flea & Tick Treatment", price: 3499, category: "healthcare" as const },
  { name: "Lamb & Veggie Blend", price: 2199, category: "wet-food" as const },
  { name: "Dental Chew Sticks", price: 999, category: "treats" as const },
  { name: "Plush Squeaky Mouse", price: 849, category: "toys" as const },
  { name: "Joint Support Chews", price: 2999, category: "healthcare" as const },
  { name: "Grain-Free Turkey Kibble", price: 2799, category: "dry-food" as const },
];

async function seed() {
  const existing = await db.select().from(schema.products).limit(1);
  if (existing.length > 0) {
    console.log("Products already seeded, skipping.");
    return;
  }

  await db.insert(schema.products).values(
    PRODUCTS.map((p) => ({
      id: crypto.randomUUID(),
      name: p.name,
      price: p.price,
      category: p.category,
    })),
  );

  console.log(`Seeded ${PRODUCTS.length} products.`);
}

seed()
  .then(() => {
    console.log("Done.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });