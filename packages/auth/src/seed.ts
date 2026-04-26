import { db } from "@repo/db"
import { eq } from "@repo/db/orm"
import { user } from "@repo/db/schema"

import { auth } from "./auth"
import { Roles } from "./roles"

async function main() {
	if (!process.argv[2] || !process.argv[3] || !process.argv[4]) {
		console.error("Usage: bun run auth:seed <email> <username> <password>")
		process.exit(1)
	}

	const email = process.argv[2]
	const username = process.argv[3]
	const password = process.argv[4]

	console.log(`Email: ${email}`)
	console.log(`User: ${username}`)


	function createCurrentDate() {
		return new Date().toLocaleString("en-GB", {
			day: "2-digit",
			month: "2-digit",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		})
	}

	try {
		const res = await auth.api.signUpEmail({
			body: {
				email,
				password,
				name: username,
				username,
			},
			asResponse: false,
		})

		if (!res.user) throw Error("SuperAdmin User Creation Failed")

		await db.update(user).set({ role: Roles.SUPER_ADMIN }).where(eq(user.id, res.user.id))

		console.log(`SuperAdmin user created successfully! at ${createCurrentDate()}`)
	} catch (error) {
		console.error(`❌ Failed to create admin user at ${createCurrentDate()} \n error : `, error)
	} finally {
		process.exit()
	}
}

main()
