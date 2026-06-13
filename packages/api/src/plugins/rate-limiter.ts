import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import rateLimit from "@fastify/rate-limit";

const rateLimiter: FastifyPluginAsync = async (fastify) => {
  await fastify.register(rateLimit, {
    global: true,
    max: 200,
    timeWindow: "1 minute",
    keyGenerator: (request) => {
      const userId = request.headers["x-user-id"];
      if (userId && typeof userId === "string") return userId;
      return request.ip;
    },
    errorResponseBuilder: (_request, context) => ({
      statusCode: 429,
      error: "Too Many Requests",
      message: `Rate limit exceeded — retry after ${context.after}`,
    }),
  });

  // Apply per-route rate limit config (autoloaded routes don't set their own)
  fastify.addHook("onRoute", (routeOptions) => {
    const url = routeOptions.url ?? "";

    if (url === "/api/health") {
      routeOptions.config = { ...routeOptions.config, rateLimit: false };
      return;
    }

    const limits: Record<string, { max: number; timeWindow: string }> = {
      "/api/signup": { max: 10, timeWindow: "1 minute" },
      "/api/products": { max: 100, timeWindow: "1 minute" },
      "POST /api/cart": { max: 60, timeWindow: "1 minute" },
      "PUT /api/cart": { max: 60, timeWindow: "1 minute" },
      "DELETE /api/cart": { max: 60, timeWindow: "1 minute" },
      "GET /api/cart": { max: 120, timeWindow: "1 minute" },
    };

    const method = routeOptions.method ?? "GET";
    const methodUrl =
      typeof method === "string"
        ? `${method} ${url}`
        : Array.isArray(method)
          ? `${method[0]} ${url}`
          : url;

    const limit = limits[methodUrl] ?? limits[url];
    if (limit) {
      routeOptions.config = {
        ...routeOptions.config,
        rateLimit: limit,
      };
    }
  });
};

export default fp(rateLimiter);