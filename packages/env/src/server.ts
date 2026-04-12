import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const serverEnv = createEnv({
	server: {
		// Database
		PG_HOST: z.string().min(1),
		PG_MIGRATE_HOST: z.string().optional(),
		PG_PORT: z.coerce.number().int().default(5432),
		PG_USER: z.string().min(1),
		PG_PASSWORD: z.string().min(1),
		PG_DBNAME: z.string().min(1),

		// Auth
		BETTER_AUTH_SECRET: z.string().min(1),
		BETTER_AUTH_URL: z.url(),
    API_URL: z.url().default("http://localhost:3000"),

    // Port
    API_PORT: z.number().default(3000)
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
})
