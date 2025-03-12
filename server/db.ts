import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set up SQLite database file path
const dbPath = join(__dirname, '..', 'gas_station_quotes.db');

// Log database location for debugging
console.error(`Using SQLite database at: ${dbPath}`);

// Initialize SQLite database
const sqlite = new Database(dbPath);

// Create Drizzle database instance
export const db = drizzle(sqlite, { schema });

// Export SQLite instance for potential direct access
export const sqliteDb = sqlite;
