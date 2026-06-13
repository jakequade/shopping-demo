import { FastifyPluginAsync } from "fastify";
import { db, schema } from "../db/index.ts";

const products: FastifyPluginAsync = async (fastify) => {
  fastify.get("/api/products", async (_request, reply) => {
    const rows = await db.select().from(schema.products);
    return reply.send(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        price: row.price,
        category: row.category,
      })),
    );
  });
};

export default products;