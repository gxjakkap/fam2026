import { db } from "@modflix/db"
import { serverEnv } from "@modflix/env"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
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
	}),
	emailAndPassword: {
		enabled: true,
	},
	plugins: [
		username(),
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
	trustedOrigins: [
		serverEnv.API_URL,
	],
})
