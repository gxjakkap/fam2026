import { serverEnv } from "@modflix/env"
import { drizzle } from "drizzle-orm/node-postgres/driver"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import pg from "pg"

const { Pool } = pg

const pool = new Pool({
	user: serverEnv.PG_USER,
	password: serverEnv.PG_PASSWORD,
	host: serverEnv.PG_MIGRATE_HOST ?? serverEnv.PG_HOST,
	port: serverEnv.PG_PORT,
	database: serverEnv.PG_DBNAME,
})

const db = drizzle(pool)

async function runMigrations() {
	try {
		await migrate(db, { migrationsFolder: "./drizzle" })
		console.log("Migrations completed!")
		process.exit(0)
	} catch (error) {
		console.error("Migration error:", error)
		process.exit(1)
	}
}

runMigrations()
