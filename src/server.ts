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

  const corsOrigin =
    env.FRONTEND_ORIGIN === "*"
      ? true
      : createOriginMatcher(env.FRONTEND_ORIGIN);

  app.register(cors, {
    origin: corsOrigin,
    credentials: true
  });

  app.register(registerHealthRoutes);
  app.register(registerLinkRoutes);
  app.register(registerRedirectRoute);

  return app;
}

function createOriginMatcher(originConfig: string) {
  const allowedOrigins = new Set(
    originConfig
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  );

  return (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.has(origin)) {
      cb(null, true);
      return;
    }

    cb(new Error(`Origin "${origin}" is not allowed by CORS`), false);
  };
}

