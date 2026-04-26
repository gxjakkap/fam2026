import { auth } from "@repo/auth"
import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
	title: "CPE Family 2026 Staff",
}

export default async function UnauthenticatedLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	const session = await auth.api.getSession({
		headers: await headers(),
	})

	if (session) {
		redirect("/")
	}

	return <>{children}</>
}
