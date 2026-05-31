import { resolve } from "node:path";

import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Mismo orden que Next.js: .env.local tiene prioridad sobre .env
const root = process.cwd();
config({ path: resolve(root, ".env") });
config({ path: resolve(root, ".env.local"), override: true });

/**
 * Prisma CLI (migrate, db pull, studio) usa conexión directa a Postgres.
 * En Supabase: Settings → Database → Connection string → URI (puerto 5432).
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DIRECT_URL"),
  },
});
