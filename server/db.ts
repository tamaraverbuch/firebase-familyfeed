
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// websocket constructor for direct connections to Neon db
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not set."
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // SSL settings for prod environments
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

export const db = drizzle({ client: pool, schema });