import type { FastifyInstance } from "fastify";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { codeRegex } from "../lib/validation.js";

export async function registerRedirectRoute(app: FastifyInstance) {
  app.get("/:code", async (request, reply) => {
    const { code } = request.params as { code: string };

    if (!codeRegex.test(code)) {
      return reply.status(404).send({ message: "Link not found" });
    }

    try {
      const link = await prisma.link.update({
        where: { code },
        data: {
          totalClicks: { increment: 1 },
          lastClickedAt: new Date()
        },
        select: { url: true }
      });

      return reply.redirect(link.url, 302);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return reply.status(404).send({ message: "Link not found" });
      }
      throw error;
    }
  });
}

