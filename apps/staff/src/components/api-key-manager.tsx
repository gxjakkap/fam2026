"use client"

import { useState } from "react"
import { Plus, Copy, Trash2, RefreshCw, Check } from "lucide-react"
import { useServerActionMutation } from "@/hook/server-action-hooks"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table"
import { createApiKey, deleteApiKey, listApiKeys } from "@/app/(authed)/admin/actions"

interface ApiKey {
	id: string
	name: string
	key: string
	prefix: string
	expiresAt: number | null | Date
	createdAt: number | Date
	lastUsedAt: number | null
	remaining: number
	metadata: Record<string, unknown> | null
}

interface ApiKeyManagerProps {
	initialKeys?: ApiKey[]
}

export function ApiKeyManager({ initialKeys = [] }: ApiKeyManagerProps) {
	const [keys, setKeys] = useState<ApiKey[]>(initialKeys)
	const [newKeyName, setNewKeyName] = useState("")
	const [newKeyExpires, setNewKeyExpires] = useState("30")
	const [showKey, setShowKey] = useState<string | null>(null)
	const [copiedKey, setCopiedKey] = useState<string | null>(null)

	const { mutate: listKeysAction, isPending: isLoadingKeys } = useServerActionMutation(
		listApiKeys,
		{
			onSuccess: (data) => {
				if (data?.apiKeys) {
					setKeys(data.apiKeys as unknown as ApiKey[])
				}
			},
		},
	)

	const { mutate: createKeyAction, isPending: isCreatingKey } = useServerActionMutation(
		createApiKey,
		{
			onSuccess: (data) => {
				if (data?.key) {
					setShowKey(data.key)
					toast.success("API key created successfully")
					setNewKeyName("")
					listKeysAction(undefined)
				}
			},
		},
	)

	const { mutate: deleteKeyAction, isPending: isDeletingKey } =
		useServerActionMutation(deleteApiKey, {
			onSuccess: () => {
				toast.success("API key deleted")
				listKeysAction(undefined)
			},
		})

	const copyKey = (key: string) => {
		navigator.clipboard.writeText(key)
		setCopiedKey(key)
		toast.success("Copied to clipboard")
		setTimeout(() => setCopiedKey(null), 2000)
	}

	const formatDate = (date: number | Date) => {
		return new Intl.DateTimeFormat("th-TH", {
			dateStyle: "medium",
			timeStyle: "short",
		}).format(new Date(date))
	}

	const formatExpiry = (date: number | Date | null) => {
		if (!date) return "No expiry"
		const ts = typeof date === "number" ? date : date.getTime()
		if (ts < Date.now()) return "Expired"
		return formatDate(ts)
	}

	// Expiry options in days
	const expiryOptions = [
		{ value: "7", label: "7 days" },
		{ value: "30", label: "30 days" },
		{ value: "90", label: "90 days" },
		{ value: "180", label: "180 days" },
		{ value: "365", label: "1 year" },
		{ value: "never", label: "Never" },
	]

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0">
				<div>
					<CardTitle>API Keys</CardTitle>
					<CardDescription>
						Manage API keys for programmatic access.
					</CardDescription>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => listKeysAction(undefined)}
						disabled={isLoadingKeys}
					>
						<RefreshCw
							className={`mr-2 h-4 w-4 ${isLoadingKeys ? "animate-spin" : ""}`}
						/>
						Refresh
					</Button>
					<Dialog>
						<DialogTrigger asChild>
							<Button size="sm">
								<Plus className="mr-2 h-4 w-4" />
								Create Key
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Create API Key</DialogTitle>
								<DialogDescription>
									Create a new API key for programmatic access.
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<label className="text-sm font-medium">Name</label>
									<Input
										placeholder="e.g., Production API"
										value={newKeyName}
										onChange={(e) => setNewKeyName(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Expires In</label>
									<Select
										value={newKeyExpires}
										onValueChange={setNewKeyExpires}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{expiryOptions.map((opt) => (
												<SelectItem key={opt.value} value={opt.value}>
													{opt.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
							<DialogFooter>
								<Button
									onClick={() => {
										const expiresIn =
											newKeyExpires === "never"
												? undefined
												: parseInt(newKeyExpires) * 24 * 60 * 60
										createKeyAction({ name: newKeyName, expiresIn })
									}}
									disabled={isCreatingKey || !newKeyName.trim()}
								>
									{isCreatingKey ? "Creating..." : "Create Key"}
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				{showKey && (
					<div className="mb-4 rounded-md border border-green-500/50 bg-green-500/10 p-4">
						<p className="mb-2 text-sm font-medium text-green-700 dark:text-green-400">
							API Key Created
						</p>
						<p className="mb-2 text-xs text-muted-foreground">
							Copy this key now. You won&apos;t be able to see it again!
						</p>
						<div className="flex items-center gap-2">
							<code className="flex-1 break-all rounded bg-background p-2 text-sm font-mono">
								{showKey}
							</code>
							<Button
								variant="outline"
								size="sm"
								onClick={() => copyKey(showKey)}
							>
								{copiedKey === showKey ? (
									<Check className="h-4 w-4" />
								) : (
									<Copy className="h-4 w-4" />
								)}
							</Button>
						</div>
						<Button
							variant="ghost"
							size="sm"
							className="mt-2"
							onClick={() => setShowKey(null)}
						>
							Done
						</Button>
					</div>
				)}
				{keys.length === 0 ? (
					<p className="text-muted-foreground py-8 text-center">
						No API keys found. Create one to get started.
					</p>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Prefix</TableHead>
								<TableHead>Expires</TableHead>
								<TableHead>Remaining</TableHead>
								<TableHead>Created</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{keys.map((key) => (
								<TableRow key={key.id}>
									<TableCell className="font-medium">{key.name}</TableCell>
									<TableCell>
										<Badge variant="outline">{key.prefix}***</Badge>
									</TableCell>
									<TableCell>
										<Badge
											variant={
												key.expiresAt &&
												(typeof key.expiresAt === "number"
													? key.expiresAt
													: key.expiresAt.getTime()) < Date.now()
													? "destructive"
													: "default"
											}
										>
											{formatExpiry(key.expiresAt)}
										</Badge>
									</TableCell>
									<TableCell>
										{key.remaining < 0 ? "Unlimited" : key.remaining}
									</TableCell>
									<TableCell className="text-muted-foreground">
										{formatDate(key.createdAt)}
									</TableCell>
									<TableCell className="text-right">
										<div className="flex justify-end gap-2">
											<Button
												variant="ghost"
												size="icon"
												onClick={() => deleteKeyAction({ keyId: key.id })}
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	)
}