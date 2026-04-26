import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

import { ApiKeyManager } from "@/components/api-key-manager"
import { StaffUsersTable } from "@/app/(authed)/admin/staff-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { AdminRoles } from "@/lib/auth/role"

export default async function AdminPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (!session?.user.role) {
		return
	}

	// biome-ignore lint/suspicious/noExplicitAny: <>
	if (!AdminRoles.includes(session.user.role as any)) {
		redirect(`/`)
	}

	const staffsData = await auth.api.listUsers({
		headers: await headers(),
		query: {},
	})

	return (
		<div className="container mx-auto flex flex-col gap-y-4 px-6 pt-8 pb-12">
			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Admin panel</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-lg">
						<strong>Hi!</strong> {`${session.user.name} (${session.user.username})`}
					</p>
				</CardContent>
			</Card>

			<ApiKeyManager />

			<Card>
				<CardHeader>
					<CardTitle className="text-lg">Staff accounts</CardTitle>
				</CardHeader>
				<CardContent>
					<StaffUsersTable data={staffsData} isLoading={false} />
				</CardContent>
			</Card>
		</div>
	)
}
