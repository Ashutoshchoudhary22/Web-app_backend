import type { FastifyInstance } from "fastify";
//health check
export async function registerHealthRoutes(app: FastifyInstance) {
  app.get("/healthz", async () => ({ ok: true }));
}

