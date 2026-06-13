import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Fastify from "fastify";
import autoload from "@fastify/autoload";
import type { FastifyInstance } from "fastify";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  await app.register(autoload, {
    dir: join(__dirname, "..", "plugins"),
  });

  await app.register(autoload, {
    dir: join(__dirname, "..", "routes"),
  });

  await app.ready();
  return app;
}