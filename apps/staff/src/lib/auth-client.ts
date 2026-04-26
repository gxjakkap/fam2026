import { adminClient, usernameClient } from "@repo/auth/better-auth-client"
import { createAuthClient } from "@repo/auth/better-auth-react"

export const authClient = createAuthClient({
	baseURL: process.env.NODE_ENV === "development" ? "http://localhost:3037" : "https://famstaff.cpesu.com/",
	plugins: [usernameClient(), adminClient()],
})
