import { serverEnv } from "@repo/env"
import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"

const { Pool } = pg

const pool = new Pool({
	user: serverEnv.PG_USER,
	password: serverEnv.PG_PASSWORD,
	host: serverEnv.PG_HOST,
	port: serverEnv.PG_PORT,
	database: serverEnv.PG_DBNAME,
})

export const db = drizzle(pool)
