import { defineConfig } from "drizzle-kit"

const pgPort = Number(process.env.PG_PORT ?? 5432)

export default defineConfig({
	out: "./drizzle",
	schema: "./src/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		user: process.env.PG_USER,
		password: process.env.PG_PASSWORD,
		host: process.env.PG_HOST,
		port: pgPort,
		database: process.env.PG_DBNAME,
	},
})
