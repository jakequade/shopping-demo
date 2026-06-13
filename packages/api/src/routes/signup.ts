import { FastifyPluginAsync } from "fastify";
import { db, schema } from "../db/index.ts";

const signup: FastifyPluginAsync = async (fastify) => {
  fastify.post("/api/signup", async (request, reply) => {
    const body = request.body as Record<string, unknown> | undefined;
    const name = body?.name as string | undefined;

    const id = crypto.randomUUID();
    await db.insert(schema.users).values({ id, name: name ?? null });

    return reply.status(201).send({ userId: id });
  });
};

export default signup;