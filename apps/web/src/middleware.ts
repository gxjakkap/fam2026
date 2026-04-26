import { NextRequest, NextResponse } from "next/server"

export default async function middleware(request: NextRequest) {
    const sessionResponse = await fetch(new URL("/api/auth/get-session", request.url), {
        headers: {
            // pass the cookie from the request
            cookie: request.headers.get("cookie") || "",
        },
    });

    const sessionInfo = await sessionResponse.json().catch(() => null);

    if (!sessionResponse.ok || !sessionInfo || !sessionInfo.session) {
        const callbackUrl = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)
        return NextResponse.redirect(new URL(`/signin?callbackUrl=${callbackUrl}`, request.url))
    }
    
    return NextResponse.next()
}

export const config = {
    matcher: [
        "/register/:path*",
        "/dash/:path*"
    ],
}