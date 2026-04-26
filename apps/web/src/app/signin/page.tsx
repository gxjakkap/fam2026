"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"

const signInFormSchema = z.object({
	email: z.string().email("Invalid email"),
	password: z.string().min(1, "Password required"),
})

type FormValues = z.infer<typeof signInFormSchema>

export default function SignInPage() {
	const form = useForm<FormValues>({
		resolver: zodResolver(signInFormSchema),
	})

	const onSubmit = async (values: FormValues) => {
		console.log(values)
		// TODO: Implement sign-in
	}

	return (
		<div className="container mx-auto max-w-sm px-4 py-8">
			<h1 className="text-2xl font-bold mb-4">Sign In</h1>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<div className="space-y-2">
					<label className="text-sm font-medium">Email</label>
					<input
						{...form.register("email")}
						className="w-full h-8 px-2 border rounded"
						type="email"
					/>
					{form.formState.errors.email && (
						<p className="text-sm text-destructive">
							{form.formState.errors.email.message}
						</p>
					)}
				</div>
				<div className="space-y-2">
					<label className="text-sm font-medium">Password</label>
					<input
						{...form.register("password")}
						className="w-full h-8 px-2 border rounded"
						type="password"
					/>
					{form.formState.errors.password && (
						<p className="text-sm text-destructive">
							{form.formState.errors.password.message}
						</p>
					)}
				</div>
				<Button type="submit" className="w-full">
					Sign In
				</Button>
			</form>
		</div>
	)
}