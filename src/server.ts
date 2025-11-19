import Fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./env.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerLinkRoutes } from "./routes/links.js";
import { registerRedirectRoute } from "./routes/redirect.js";

export function buildServer() {
  const app = Fastify({
    logger: true
  });

  const allowedOrigins =
    env.FRONTEND_ORIGIN === "*"
      ? true
      : env.FRONTEND_ORIGIN.split(",").map((origin) => origin.trim());

  app.register(cors, {
    origin: allowedOrigins,
    credentials: true
  });

  app.register(registerHealthRoutes);
  app.register(registerLinkRoutes);
  app.register(registerRedirectRoute);

  return app;
}

