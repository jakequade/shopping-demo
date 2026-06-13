# Progress

Workspace: repo-root
Path: /Users/jake/code/pc-interview-example
Branch: main
Source: Pet Circle Senior Engineer technical interview brief — shopping cart for pet e-commerce store with Next.js, Fastify, Drizzle + Postgres, Playwright e2e
Last updated: 2026-06-13

## Slices

| #  | Slice                            | Status      | Notes                       |
|----|----------------------------------|-------------|-----------------------------|
| 01 | Monorepo + DB scaffold           | todo        | bun workspaces, shared Zod schemas (Product, CartItem, Cart, ApiError), Docker Compose (Postgres 16), Drizzle config + migrations (users, products, cart_items) |
| 02 | Products seed + API + list page  | todo        | Seed 6-10 products across 3+ categories, GET /api/products, Next.js RSC product list page, "Add to cart" button (wired but needs signup) |
| 03 | Signup + user identity plumbing  | todo        | POST /api/signup, Fastify x-user-id hook, client-side localStorage provider |
| 04 | Cart API                         | todo        | GET/POST/DELETE /api/cart/items, line subtotals + grand total, validation (unknown product → 4xx + ApiError, non-positive qty → 4xx) |
| 05 | Cart UI                          | todo        | Cart client component, Server Actions, add/remove, totals, error surfacing |
| 06 | Tests                            | todo        | Vitest unit + integration (schemas, API routes), Playwright e2e (full chain), README |

## Surprises, gotchas, quirks

(Empty)