/// <reference types="vite/client" />
import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const clientEnv = createEnv({
	clientPrefix: "VITE_",
	client: {
		VITE_API_URL: z.url().default("http://localhost:3000"),
		VITE_BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
	},
	runtimeEnv: import.meta.env,
	emptyStringAsUndefined: true,
})
