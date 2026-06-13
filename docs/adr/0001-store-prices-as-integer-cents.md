# ADR 0001 — Store prices as integer cents

- **Status:** Accepted
- **Date:** 2026-06-13
- **Context:** Product prices need to be stored, summed, and displayed. Float/decimal types in JavaScript are prone to rounding errors (0.1 + 0.2 !== 0.3).
- **Decision:** Store all prices as integers representing cents (e.g. $19.99 → 1999). Display formatting happens only at the presentation layer.
- **Consequences:**
  - No float precision bugs in addition or comparison
  - All arithmetic is safe integer math
  - Requires a display helper to format cents → dollars for the UI
  - Cart totals (grand total) are computed server-side in cents; frontend receives and formats
- **Alternatives considered:**
  - `numeric`/`decimal` in Postgres — Drizzle maps these to string, requiring parsing; same problem deferred
  - Float — JavaScript float addition introduces drift; not acceptable for money