import { apiKey } from "@better-auth/api-key"
import { db } from "@repo/db"
import * as schema from "@repo/db/schema"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { nextCookies } from "better-auth/next-js"
import { admin, username } from "better-auth/plugins"
import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access"
import { Roles } from "./roles"

const statement = {
	...defaultStatements,
} as const

const ac = createAccessControl(statement)

const superAdminRole = ac.newRole({
	...adminAc.statements,
})

const adminRole = ac.newRole({
	...adminAc.statements,
})

const staffRole = ac.newRole({
	user: ["list"],
})

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema,
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		apiKey({
			defaultPrefix: "fam",
			enableSessionForAPIKeys: true,
			rateLimit: {
				enabled: false,
			},
			keyExpiration: {
				defaultExpiresIn: null,
			},
		}),
		username(),
		nextCookies(),
		admin({
			ac,
			defaultRole: Roles.USER,
			adminRoles: [Roles.ADMIN, Roles.SUPER_ADMIN],
			roles: {
				[Roles.SUPER_ADMIN]: superAdminRole,
				[Roles.ADMIN]: adminRole,
				[Roles.STAFF]: staffRole,
			},
		}),
	],
	trustedOrigins: process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : [],
})
