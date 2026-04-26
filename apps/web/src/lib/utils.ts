import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const shortDateString = (date: number) => {
	const epdate = new Date(date)
	return epdate.toLocaleDateString("en-CA", {
		year: "numeric",
		month: "short",
	})
}

export const formatDateString = (date: number) => {
	const epdate = new Date(date)
	return epdate.toLocaleDateString("en-CA", {
		year: "numeric",
		month: "short",
		day: "numeric",
	})
}
