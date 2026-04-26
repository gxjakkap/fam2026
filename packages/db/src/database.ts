import path from "node:path"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"

// Load environment variables from the workspace root if not already loaded
if (!process.env.PG_PASSWORD || !process.env.S3_URL) {
	const paths = [
		path.resolve(process.cwd(), "../../.env"),
		path.resolve(process.cwd(), ".env"),
		path.resolve(process.cwd(), "../../../.env"),
	]

	for (const envPath of paths) {
		const result = config({ path: envPath })
		if (result.parsed) {
			console.log(`✅ Loaded env from ${envPath}`)
			break
		}
	}
}

const { Pool } = pg
const pgPort = Number(process.env.PG_PORT ?? 5432)

if (!process.env.PG_PASSWORD) {
	console.error("❌ Database password (PG_PASSWORD) is not set. Please check your .env file.")
}

const pool = new Pool({
	user: process.env.PG_USER,
	password: process.env.PG_PASSWORD,
	host: process.env.PG_HOST,
	port: pgPort,
	database: process.env.PG_DBNAME,
})

export const db = drizzle(pool)
