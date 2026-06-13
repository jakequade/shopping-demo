import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

const userIdentity: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest("currentUserId", "");

  fastify.addHook("onRequest", async (request) => {
    const headerVal = request.headers["x-user-id"];
    if (headerVal) {
      request.currentUserId = headerVal as string;
    }
  });
};

declare module "fastify" {
  interface FastifyRequest {
    currentUserId: string;
  }
}

export default fp(userIdentity);