import { FastifyPluginAsync } from "fastify";
import { db, schema } from "../db/index.ts";

const signup: FastifyPluginAsync = async (fastify) => {
  fastify.post("/api/signup", async (request, reply) => {
    const { name } = request.body as { name?: string };

    const id = crypto.randomUUID();
    await db.insert(schema.users).values({ id, name: name ?? null });

    return reply.status(201).send({ userId: id });
  });
};

export default signup;