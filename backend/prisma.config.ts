import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// If DATABASE_URL is not defined, fall back to a local SQLite database for development.
// This allows the app to start without a remote Postgres connection.
const datasourceUrl = process.env.DATABASE_URL;

export default defineConfig({
  datasource: { url: datasourceUrl },
});
