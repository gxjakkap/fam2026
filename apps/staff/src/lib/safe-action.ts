import { headers } from "next/headers"
import { createServerActionProcedure } from "zsa"

import { AuthenticationError, PublicError } from "@/lib/errors"

import { auth } from "./auth"

// biome-ignore lint/suspicious/noExplicitAny: <>
export function shapeErrors({ err }: any) {
	const isAllowedError = err instanceof PublicError
	const isDev = process.env.NODE_ENV === "development"
	if (isAllowedError || isDev) {
		console.error(err)
		return {
			code: err.code ?? "ERROR",
			message: `${!isAllowedError && isDev ? "DEV ONLY ENABLED - " : ""}${err.message}`,
		}
	} else {
		return {
			code: "ERROR",
			message: "Something went wrong",
		}
	}
}

export const unauthenticatedAction = createServerActionProcedure()
	.experimental_shapeError(shapeErrors)
	// biome-ignore lint/suspicious/noEmptyBlockStatements: <>
	.handler(async () => {})

export const authenticatedAction = createServerActionProcedure()
	.experimental_shapeError(shapeErrors)
	.handler(async () => {
		const session = await auth.api.getSession({
			headers: await headers(),
		})

		if (!session) {
			throw new AuthenticationError()
		}

		return { user: session?.user }
	})
