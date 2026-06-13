import { FastifyPluginAsync } from "fastify";
import { db, schema } from "../db/index.ts";
import { Cart, CartItem, Product, AddToCartInput, RemoveFromCartInput } from "@pc/shared";
import { ZodError } from "zod";
import { eq, and } from "drizzle-orm";

const cart: FastifyPluginAsync = async (fastify) => {
  // ── GET /api/cart — fetch current cart with totals ──
  fastify.get("/api/cart", async (request, reply) => {
    const userId = request.currentUserId;
    if (!userId) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "x-user-id header is required",
      });
    }

    const rows = await db
      .select()
      .from(schema.cartItems)
      .innerJoin(
        schema.products,
        eq(schema.cartItems.productId, schema.products.id),
      )
      .where(eq(schema.cartItems.userId, userId));

    const items: CartItem[] = rows.map((row) => {
      const p = row.products;
      const ci = row.cart_items;
      return {
        product: {
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
        },
        quantity: ci.quantity,
        subtotal: p.price * ci.quantity,
      };
    });

    const grandTotal = items.reduce((sum, i) => sum + i.subtotal, 0);

    const cart: Cart = { items, grandTotal };
    return reply.send(cart);
  });

  // ── POST /api/cart — add product / increment quantity ───
  fastify.post("/api/cart", async (request, reply) => {
    const userId = request.currentUserId;
    if (!userId) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "x-user-id header is required",
      });
    }

    let productId: string, qty: number;
    try {
      const parsed = AddToCartInput.parse(request.body);
      productId = parsed.productId;
      qty = parsed.quantity;
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: err.errors.map((e) => e.message).join("; "),
        });
      }
      throw err;
    }

    const [product] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.id, productId))
      .limit(1);

    if (!product) {
      return reply.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: `Unknown product ID: ${productId}`,
      });
    }

    const [existing] = await db
      .select()
      .from(schema.cartItems)
      .where(
        and(
          eq(schema.cartItems.userId, userId),
          eq(schema.cartItems.productId, productId),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(schema.cartItems)
        .set({ quantity: existing.quantity + qty })
        .where(eq(schema.cartItems.id, existing.id));
    } else {
      await db.insert(schema.cartItems).values({
        id: crypto.randomUUID(),
        userId,
        productId,
        quantity: qty,
      });
    }

    return reply.status(200).send({ ok: true });
  });

  // ── DELETE /api/cart — remove line item ─────────────
  fastify.delete("/api/cart", async (request, reply) => {
    const userId = request.currentUserId;
    if (!userId) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "x-user-id header is required",
      });
    }

    let productId: string;
    try {
      const parsed = RemoveFromCartInput.parse(request.query);
      productId = parsed.productId;
    } catch (err) {
      if (err instanceof ZodError) {
        return reply.status(400).send({
          statusCode: 400,
          error: "Bad Request",
          message: err.errors.map((e) => e.message).join("; "),
        });
      }
      throw err;
    }

    const [existing] = await db
      .select()
      .from(schema.cartItems)
      .where(
        and(
          eq(schema.cartItems.userId, userId),
          eq(schema.cartItems.productId, productId),
        ),
      )
      .limit(1);

    if (!existing) {
      return reply.status(404).send({
        statusCode: 404,
        error: "Not Found",
        message: `Product ${productId} not found in cart`,
      });
    }

    await db
      .delete(schema.cartItems)
      .where(eq(schema.cartItems.id, existing.id));

    return reply.status(200).send({ ok: true });
  });

  // ── PUT /api/cart — set exact quantity (bonus) ──────
  fastify.put("/api/cart", async (request, reply) => {
    const userId = request.currentUserId;
    if (!userId) {
      return reply.status(401).send({
        statusCode: 401,
        error: "Unauthorized",
        message: "x-user-id header is required",
      });
    }

    const { productId, quantity } = request.body as {
      productId: string;
      quantity: number;
    };

    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 0) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "quantity must be a non-negative integer",
      });
    }

    if (typeof productId !== "string" || productId.length === 0) {
      return reply.status(400).send({
        statusCode: 400,
        error: "Bad Request",
        message: "productId is required",
      });
    }

    if (quantity === 0) {
      const [existing] = await db
        .select()
        .from(schema.cartItems)
        .where(
          and(
            eq(schema.cartItems.userId, userId),
            eq(schema.cartItems.productId, productId),
          ),
        )
        .limit(1);

      if (existing) {
        await db
          .delete(schema.cartItems)
          .where(eq(schema.cartItems.id, existing.id));
      }
    } else {
      const [existing] = await db
        .select()
        .from(schema.cartItems)
        .where(
          and(
            eq(schema.cartItems.userId, userId),
            eq(schema.cartItems.productId, productId),
          ),
        )
        .limit(1);

      if (existing) {
        await db
          .update(schema.cartItems)
          .set({ quantity })
          .where(eq(schema.cartItems.id, existing.id));
      } else {
        await db.insert(schema.cartItems).values({
          id: crypto.randomUUID(),
          userId,
          productId,
          quantity,
        });
      }
    }

    return reply.status(200).send({ ok: true });
  });
};

export default cart;