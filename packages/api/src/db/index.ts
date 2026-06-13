import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.ts";

const url = process.env.DATABASE_URL ?? "postgres://pc:pc@localhost:5432/pc_interview";

const client = postgres(url);
export const db = drizzle(client, { schema });
export { schema }; // re-export for convenience
export default db;