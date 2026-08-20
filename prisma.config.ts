import "dotenv/config";
import path from "path";
import { defineConfig } from "prisma/config";

const rawUrl = process.env["DATABASE_URL"] ?? "file:dev.db";
const dbUrl = rawUrl.startsWith("file:")
  ? `file:${path.resolve(rawUrl.replace("file:", "").replace(/^\.\//, "")).replace(/\\/g, "/")}`
  : rawUrl;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node --env-file=.env node_modules/tsx/dist/cli.mjs prisma/seed.ts",
  },
  datasource: {
    url: dbUrl,
  },
});
