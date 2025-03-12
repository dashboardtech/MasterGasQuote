import { defineConfig } from "drizzle-kit";
import { join } from "node:path";

// Define the SQLite database path
const dbPath = join(process.cwd(), "gas_station_quotes.db");

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: `file:${dbPath}`,
  },
});
