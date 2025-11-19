import type { FastifyInstance } from "fastify";
import { Prisma, type Link } from "@prisma/client";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma.js";
import { createLinkSchema, codeRegex } from "../lib/validation.js";
import { generateCode } from "../lib/generateCode.js";
import type { SerializedLink } from "../types.js";

export async function registerLinkRoutes(app: FastifyInstance) {
  app.get("/links", async () => {
    const links = await prisma.link.findMany({
      orderBy: { createdAt: "desc" }
    });
    return links.map(serializeLink);
  });

  app.post("/links", async (request, reply) => {
    try {
      const payload = createLinkSchema.parse(request.body);
      const normalizedUrl = normalizeUrl(payload.url);
      let code = payload.code?.trim();

      if (!code) {
        code = await findAvailableCode();
      } else {
        const existing = await prisma.link.findUnique({ where: { code } });
        if (existing) {
          return reply.status(409).send({ message: "Code already exists" });
        }
      }

      const link = await prisma.link.create({
        data: { code, url: normalizedUrl }
      });

      reply.code(201);
      return serializeLink(link);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return reply.status(409).send({ message: "Code already exists" });
      }

      if (error instanceof ZodError) {
        return reply.status(400).send({ message: "Invalid input" });
      }

      request.log.error(error, "Unexpected error creating link");
      return reply.status(500).send({ message: "Unexpected error creating link" });
    }
  });

  app.get("/links/:code", async (request, reply) => {
    const { code } = request.params as { code: string };

    if (!codeRegex.test(code)) {
      return reply.status(400).send({ message: "Invalid code" });
    }

    const link = await prisma.link.findUnique({ where: { code } });
    if (!link) {
      return reply.status(404).send({ message: "Link not found" });
    }

    return serializeLink(link);
  });

  app.delete("/links/:code", async (request, reply) => {
    const { code } = request.params as { code: string };

    if (!codeRegex.test(code)) {
      return reply.status(400).send({ message: "Invalid code" });
    }

    try {
      await prisma.link.delete({ where: { code } });
      return { ok: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return reply.status(404).send({ message: "Link not found" });
      }
      throw error;
    }
  });
}

function normalizeUrl(url: string) {
  const parsed = new URL(url);
  parsed.hash = "";
  return parsed.toString();
}

async function findAvailableCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = generateCode(6);
    const existing = await prisma.link.findUnique({ where: { code: candidate } });
    if (!existing) {
      return candidate;
    }
  }
  throw new Error("Failed to generate unique code");
}

function serializeLink(link: Link): SerializedLink {
  return {
    id: link.id,
    code: link.code,
    url: link.url,
    totalClicks: link.totalClicks,
    createdAt: link.createdAt.toISOString(),
    updatedAt: link.updatedAt.toISOString(),
    lastClickedAt: link.lastClickedAt ? link.lastClickedAt.toISOString() : null
  };
}

