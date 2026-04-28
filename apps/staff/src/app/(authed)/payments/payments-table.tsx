"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { useMemo } from "react"

import { DataTable } from "@/components/data-table"
import { DataTableColumnHeader } from "@/components/data-table/column-header"
import { PaymentStatusBadge } from "@/components/payment-status-badge"
import type { DataTableFilterField } from "@/types"

type PaymentStatus = "pending" | "verified" | "failed" | "timeout"

export type PaymentRow = {
	id: string
	payerName: string
	payerEmail: string
	productName: string
	status: PaymentStatus
	price: string
	createdAt: string
}

const formatCurrency = (value: string) => {
	const parsed = Number(value)
	if (Number.isNaN(parsed)) {
		return value
	}
	return new Intl.NumberFormat("th-TH", {
		style: "currency",
		currency: "THB",
		minimumFractionDigits: 2,
	}).format(parsed)
}

const formatDateTime = (value: string) => {
	if (!value) {
		return "-"
	}
	return new Intl.DateTimeFormat("th-TH", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(value))
}

export function PaymentsTable({ payments }: { payments: PaymentRow[] }) {
	const columns = useMemo<ColumnDef<PaymentRow>[]>(
		() => [
			{
				accessorKey: "id",
				header: "Payment ID",
				cell: ({ row }) => (
					<Link
						href={`/payments/${row.original.id}`}
						className="text-primary font-medium underline-offset-4 hover:underline"
					>
						{row.original.id}
					</Link>
				),
				size: 220,
				filterFn: "includesString",
				enableSorting: false,
			},
			{
				accessorKey: "payerName",
				header: "Payer",
				cell: ({ row }) => <div>{row.original.payerName}</div>,
				size: 180,
				filterFn: "includesString",
				enableSorting: false,
			},
			{
				accessorKey: "payerEmail",
				header: "Payer email",
				cell: ({ row }) => <div>{row.original.payerEmail}</div>,
				size: 240,
				filterFn: "includesString",
				enableSorting: false,
			},
			{
				accessorKey: "productName",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Product type" />
				),
				cell: ({ row }) => <div>{row.original.productName}</div>,
				size: 200,
			},
			{
				accessorKey: "status",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Status" />
				),
				cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
				size: 140,
			},
			{
				accessorKey: "createdAt",
				header: ({ column }) => (
					<DataTableColumnHeader column={column} title="Created at" />
				),
				cell: ({ row }) => <div>{formatDateTime(row.original.createdAt)}</div>,
				size: 200,
			},
			{
				accessorKey: "price",
				header: () => <div className="text-right">Price</div>,
				cell: ({ row }) => (
					<div className="text-right tabular-nums">{formatCurrency(row.original.price)}</div>
				),
				size: 140,
				enableSorting: false,
			},
		],
		[],
	)

	const filterFields = useMemo<DataTableFilterField<PaymentRow>[]>(
		() => [
			{
				id: "id",
				label: "",
				placeholder: "Search by payment ID",
			},
			{
				id: "payerName",
				label: "",
				placeholder: "Search by name",
			},
			{
				id: "payerEmail",
				label: "",
				placeholder: "Search by email",
			},
		],
		[],
	)

	return (
		<DataTable
			columns={columns}
			data={payments}
			filterFields={filterFields}
			initialState={{
				sorting: [{ id: "createdAt", desc: true }],
			}}
		/>
	)
}
