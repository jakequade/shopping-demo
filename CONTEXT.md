# Pet Circle Interview Example — Context

## Domain Terms

- **Product** — a purchasable item with `id`, `name`, `price` (integer cents), and `category`
- **Category** — one of: `dry-food`, `wet-food`, `treats`, `toys`, `healthcare`
- **CartItem** — a product-quantity pair belonging to a user's cart; includes computed `subtotal`
- **Cart** — a user's collection of `CartItem`s with computed `grandTotal`
- **ApiError** — structured error envelope: `{ statusCode: number, error: string, message: string }`
- **User** — minimal identity (`id` UUID) for cart ownership; no password/email required
- **PriceCents** — prices stored as integers (cents) to avoid float precision issues

## Architecture

- Monorepo with Bun workspaces: `packages/{shared,api,web}`
- `@pc/shared` — Zod schemas + inferred types + shared constants
- `@pc/api` — Fastify with autoload, Drizzle ORM + Postgres
- `@pc/web` — Next.js App Router, Server Actions proxying to Fastify
- User identity: client stores UUID in localStorage, sent as `x-user-id` header