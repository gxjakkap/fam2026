import { serverEnv } from "@repo/env"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
	out: "./drizzle",
	schema: "./src/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		user: serverEnv.PG_USER,
		password: serverEnv.PG_PASSWORD,
		host: serverEnv.PG_HOST,
		port: serverEnv.PG_PORT,
		database: serverEnv.PG_DBNAME,
	},
})
