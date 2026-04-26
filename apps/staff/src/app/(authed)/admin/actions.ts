"use server"

import { headers } from "next/headers"
import { z } from "zod"

import { auth } from "@/lib/auth"
import { StaffRolesEnum } from "@/lib/auth/role"
import { ForbiddenError } from "@/lib/errors"
import { authenticatedAction } from "@/lib/safe-action"

export const addStaffAccount = authenticatedAction
	.createServerAction()
	.input(
		z.object({
			name: z.string(),
			role: StaffRolesEnum,
			email: z.string(),
			username: z.string(),
			password: z.string(),
		}),
	)
	.handler(async ({ ctx, input }) => {
		if (ctx.user.role !== "admin") {
			throw new ForbiddenError()
		}

		await auth.api.createUser({
			headers: await headers(),
			body: {
				email: input.email,
				name: input.name,
				password: input.password,
				role: input.role,
				data: {
					username: input.username,
				},
			},
		})
	})

export const deleteStaffAccount = authenticatedAction
	.createServerAction()
	.input(
		z.object({
			id: z.string(),
		}),
	)
	.handler(async ({ ctx, input }) => {
		if (ctx.user.role !== "admin") {
			throw new ForbiddenError()
		}

		await auth.api.removeUser({
			headers: await headers(),
			body: {
				userId: input.id,
			},
		})
	})

export const editStaffAccount = authenticatedAction
	.createServerAction()
	.input(
		z.object({
			id: z.string(),
			password: z.string().optional(),
			role: StaffRolesEnum.optional(),
		}),
	)
	.handler(async ({ ctx, input }) => {
		if (ctx.user.role !== "admin") {
			throw new ForbiddenError()
		}

		if (input.password) {
			await auth.api.setUserPassword({
				headers: await headers(),
				body: {
					userId: input.id,
					newPassword: input.password,
				},
			})
		}

		if (input.role) {
			await auth.api.setRole({
				headers: await headers(),
				body: {
					userId: input.id,
					role: input.role,
				},
			})
		}
	})

export const listApiKeys = authenticatedAction.createServerAction().handler(async ({ ctx }) => {
	if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
		throw new Error("Unauthorized")
	}
	const apiKeys = await auth.api.listApiKeys({
		headers: await headers(),
	})
	return apiKeys
})

export const createApiKey = authenticatedAction
	.createServerAction()
	.input(
		z.object({
			name: z.string(),
			expiresIn: z.number().optional(),
		}),
	)
	.handler(async ({ ctx, input }) => {
		if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
			throw new Error("Unauthorized")
		}
		const apiKey = await auth.api.createApiKey({
			headers: await headers(),
			body: {
				name: input.name,
				expiresIn: input.expiresIn,
			},
		})
		return apiKey
	})

export const deleteApiKey = authenticatedAction
	.createServerAction()
	.input(z.object({ keyId: z.string() }))
	.handler(async ({ ctx, input }) => {
		if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
			throw new ForbiddenError()
		}
		const result = await auth.api.deleteApiKey({
			body: { keyId: input.keyId },
		})
		return { success: result.success ?? true }
	})

export const resetApiKeyRateLimit = authenticatedAction
	.createServerAction()
	.input(z.object({ keyId: z.string() }))
	.handler(async ({ ctx, input }) => {
		if (ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
			throw new ForbiddenError()
		}
		await auth.api.deleteApiKey({
			body: { keyId: input.keyId },
		})
		return { success: true }
	})