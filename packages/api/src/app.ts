import "dotenv/config";
import Fastify from "fastify";
import autoload from "@fastify/autoload";
import cors from "@fastify/cors";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

await app.register(autoload, {
  dir: join(__dirname, "plugins"),
});

await app.register(autoload, {
  dir: join(__dirname, "routes"),
});

const port = parseInt(process.env.PORT ?? "3001", 10);
const host = process.env.HOST ?? "0.0.0.0";

try {
  await app.listen({ port, host });
  console.log(`API listening on ${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

export default app;