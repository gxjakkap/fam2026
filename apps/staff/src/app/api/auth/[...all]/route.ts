import { toNextJsHandler } from "@repo/auth/better-auth"

import { auth } from "@/lib/auth"

export const { POST, GET } = toNextJsHandler(auth)
