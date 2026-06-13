import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { db, schema } from "../db/index.ts";

const SignupBody = z.object({
  name: z.string().min(1).optional(),
});

const signup: FastifyPluginAsync = async (fastify) => {
  fastify.post("/api/signup", async (request, reply) => {
    const parsed = SignupBody.parse(request.body ?? {});
    const name = parsed.name ?? null;

    const id = crypto.randomUUID();
    await db.insert(schema.users).values({ id, name: name ?? null });

    return reply.status(201).send({ userId: id });
  });
};

export default signup;