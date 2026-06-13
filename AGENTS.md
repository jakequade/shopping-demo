# AGENTS.md — Pet Circle Interview Example

Monorepo (Bun workspaces) for a pet e-commerce technical interview. Three packages: `shared`, `api`, `web`.

## Quick reference

```bash
# run project locally (requires Postgres)
docker compose up -d                    # start Postgres
bun install                             # install all workspace deps
cd packages/api && bun run db:seed      # seed 10 products
# terminal 1: cd packages/api && bun run dev   # API on :3001
# terminal 2: cd packages/web && bun run dev   # web on :3000

# tests
cd packages/shared && bun run test      # unit (Zod schemas)
cd packages/api && bun run test         # integration (needs DB)
cd packages/web && bun run test:e2e     # Playwright (starts both servers)
```

## Architecture

| Package | Stack | Role |
|---|---|---|
| `@pc/shared` | Zod | Schema types + `formatPrice` helper; no runtime deps beyond Zod |
| `@pc/api` | Fastify 5 + Drizzle ORM + Postgres 16 | REST API, route autoload by directory |
| `@pc/web` | Next.js 15 App Router + Tailwind 4 + daisyUI 5 | SSR product list, client components for cart |

**Control flow:** Next.js Server Component (`page.tsx`) does a direct `fetch` to Fastify for products. Client components call **Server Actions** (`actions.ts`) which proxy requests to the Fastify API internally — no direct `fetch` from browser to the API server. The only exception is the server component's initial product fetch.

**User identity:** `localStorage` stores a UUID. Sent as `x-user-id` header on every request. Extracted by a Fastify `onRequest` hook in `plugins/user-identity.ts`. No passwords, no JWTs, no sessions. The `user-identity` plugin uses `fastify-plugin` (wrapped with `fp()`) to break Fastify encapsulation so the hook applies to autoloaded routes.

**Cart-keying:** No `carts` table. `cart_items` are keyed directly by `user_id`. A `carts` table would be needed for cart-wide state (discounts, status).

## Domain model (from `@pc/shared`)

- **Product** — `{ id: uuid, name: string, price: integer-cents, category }`
- **Category** — `"dry-food" | "wet-food" | "treats" | "toys" | "healthcare"`
- **CartItem** — `{ product, quantity: positive-int, subtotal: integer-cents }` (subtotal computed server-side)
- **Cart** — `{ items: CartItem[], grandTotal: integer-cents }` (computed server-side via `.reduce()`)
- **ApiError** — `{ statusCode, error, message }` envelope returned on all errors
- **AddToCartInput** / **RemoveFromCartInput** — Zod schemas for request validation

All prices are **integer cents** — never floats (see `docs/adr/0001-store-prices-as-integer-cents.md`). `formatPrice(cents)` renders as `"$24.99"`.

## API endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/products` | No auth needed |
| POST | `/api/signup` | Body: `{ name?: string }`, returns `{ userId }` |
| GET | `/api/cart` | Requires `x-user-id` |
| POST | `/api/cart` | Body: `{ productId, quantity?: 1 }` — increments if exists |
| DELETE | `/api/cart?productId=` | Removes line item |
| PUT | `/api/cart` | Body: `{ productId, quantity }` — set exact qty (0 = remove) |

## Code patterns & gotchas

### Fastify autoload
`plugins/` and `routes/` are auto-discovered via `@fastify/autoload` in `app.ts`. Files export a default `FastifyPluginAsync`. Route paths are relative to each file (e.g., `routes/cart.ts` registers `/api/cart`). The `user-identity` plugin **must** be registered before routes (app.ts does plugins first, then routes).

### Importing shared types
Each package has `"@pc/shared": "workspace:*"` in its `package.json`. Types are re-exported from `packages/shared/src/index.ts`. API/Drizzle imports are separate: `from "../db/index.ts"` for DB client and schema.

### No Zod validation on API routes
The API routes use manual type assertions (`request.body as {...}`) and manual validation (e.g., `!Number.isInteger(qty) || qty < 1`). They do NOT use Zod schemas at runtime — only `@pc/shared` defines the Zod schemas for type safety. This is a surprising gap.

### `user-identity` plugin
- Uses `fp()` (from `fastify-plugin`) — crucial. Without it, autoload isolates the hook and cart routes won't see `request.currentUserId`.
- Augments the Fastify `FastifyRequest` type with `currentUserId` via module declaration in the same file.

### API test helper
`packages/api/src/__tests__/helper.ts` builds a Fastify instance with autoload + `logger: false` (no log noise in tests). Uses `app.inject()` — no HTTP server needed for tests.

### API vitest config
Uses `pool: "forks"` with `--import tsx`. This means tests are isolated per-worker, but `tsx` must handle ESM TypeScript. The shared and web vitest configs don't use forks.

### E2E tests
Playwright config starts **both** API and Next.js as `webServer` entries. The API entry uses `npx tsx src/app.ts` (not `bun run dev`). The e2e test has a notable pattern: after signup + add-to-cart, it does `page.reload()` to see cart state — because the client component only loads cart on mount + custom events, and the event mechanism can race.

### Frontend event bus
Cross-component communication uses a **custom DOM event** (`cart-updated` dispatched on `window`). `AddToCartButton` dispatches it; `CartView` and `CartBadge` both listen for it to refresh. This is the only non-React state mechanism in the project.

### Styling
Tailwind 4 + daisyUI 5. Theme set to `"lofi"` on the `<html>` element. `globals.css` uses the new Tailwind 4 `@import "tailwindcss"` directive (not the old `@tailwind` directives). All components use daisyUI classes (`btn`, `card`, `drawer`, `table`, `badge`, `navbar`, `input`, `theme-controller`, etc.).

## Testing patterns

- **Shared tests** — Pure unit tests. Parse valid/invalid objects through Zod schemas. No setup needed.
- **API tests** — Integration tests using `app.inject()`. Require Postgres to be running with seeded data. `beforeAll` fetches the first product to use in cart tests. Test suite shares state via module-level `let` variables (`userId`, `productId`).
- **E2E tests** — Playwright. Requires Next.js build (or dev). Tests are sequential with page reloads.

## Gotchas

- `bun run test` from root does nothing — must `cd` into each package
- Docker compose defaults to `pc:pc` credentials and `pc_interview` database — override via `.env` (see `.env.example`)
- `.env` is gitignored — `app.ts` imports `dotenv/config` so a `.env` file is loaded if present
- `packages/api/drizzle/` contains migration SQL and metadata — Drizzle generates these; manually editing them will break the migration chain
- The web package has `vitest.config.ts` but no unit tests written yet — only Playwright e2e tests exist
- Prices are `integer` in Postgres, not `numeric` — this is intentional per ADR 0001
- `packages/shared/package.json` points `main` and `types` directly to `src/index.ts` (no build step) — this works because tsx/Next resolve TypeScript sources
- `packages/web/src/css.d.ts` exists to make CSS imports work in TypeScript