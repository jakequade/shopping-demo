# Pet Circle — Shopping Cart

Monorepo with Bun workspaces for a pet e-commerce technical interview.

## Stack

- **Frontend:** Next.js (App Router) + TypeScript
- **Backend:** Fastify 5 + autoload
- **Database:** Postgres 16 via Docker Compose
- **ORM:** Drizzle with migrations
- **Validation:** Zod (shared between frontend and backend)
- **Tests:** Vitest (unit + integration) + Playwright (e2e)

## Quick start

```bash
# 1. Start Postgres
docker compose up -d

# 2. Install dependencies
bun install

# 3. Generate and apply DB migrations
cd packages/api
bun run db:generate
bun run db:migrate

# 4. Seed products
bun run db:seed

# 5. Start the API (port 3001)
bun run dev

# 6. In another terminal, start the frontend (port 3000)
cd packages/web && bun run dev
```

Open http://localhost:3000 — sign in with a name (optional), then add products to cart.

## Project structure

```
packages/
  shared/          Shared Zod schemas, types, and helpers
    src/
      schemas.ts   Product, CartItem, Cart, ApiError, formatPrice
  api/             Fastify API server
    src/
      app.ts       Server entry point
      db/          Drizzle schema, client, seed data
      plugins/     Fastify plugins (user-identity hook)
      routes/      API route handlers (products, cart, signup)
    drizzle/       Migration files
  web/             Next.js frontend
    src/
      app/
        page.tsx             Product list page (RSC)
        components/          Client components (CartView, AddToCartButton)
    e2e/           Playwright tests
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/products | List all products |
| POST | /api/signup | Create a user, returns `{ userId }` |
| GET | /api/cart | Get cart with line items, subtotals, grand total |
| POST | /api/cart | Add product to cart (increment if exists) |
| DELETE | /api/cart?productId= | Remove a line item from cart |

All cart endpoints require the `x-user-id` header (set after signup).

## Testing

```bash
# Shared schemas (unit tests)
cd packages/shared && bun run test

# API integration tests (requires Postgres to be running)
cd packages/api && bun run test

# E2E tests (starts API + Next.js automatically)
cd packages/web && bun run test:e2e
```

## Design decisions

- **Prices as integer cents** — avoids float precision issues. See `docs/adr/0001-store-prices-as-integer-cents.md`.
- **`x-user-id` header** — minimal auth swap-in; in production this would be a JWT or session cookie.
- **No `carts` table** — cart items are keyed directly by `user_id`. A `carts` table would be needed for cart-wide state (discounts, status).
- **Autoload for Fastify** — plugins and routes are auto-discovered by directory structure.
- **fastify-plugin** — used to break Fastify encapsulation so the `x-user-id` hook applies to all routes.