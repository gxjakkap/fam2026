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
		BETTER_AUTH_URL: z.string().url(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
})
