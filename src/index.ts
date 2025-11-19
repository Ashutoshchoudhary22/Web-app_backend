import { buildServer } from "./server.js";
import { env } from "./env.js";

async function main() {
  const server = buildServer();
  try {
    await server.listen({ port: env.PORT, host: env.HOST });
    console.log(`Backend listening on http://${env.HOST}:${env.PORT}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }
}

main();

