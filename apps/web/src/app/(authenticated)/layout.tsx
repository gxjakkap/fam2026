import { auth } from "@repo/auth"
import { redirect } from "next/navigation"

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
    const user = await auth.api.getSession()
    if (!user) {
        redirect("/signin")
    }

    return <>{children}</>
}