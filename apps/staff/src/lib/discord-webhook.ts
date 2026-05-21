"use server"

interface DiscordRichMessageData {
	content: string | null
	embeds: {
		title: string
		description: string
		color: number
		url?: string
		footer: {
			text: string
		}
		timestamp: string
	}[]
	attachments: never[]
}

export const logEventToWebhook = async (title: string, msg: string, link?: string) => {
	const endpoint = process.env.DISCORD_WEBHOOK || ""

	if (!endpoint) return

	const now = new Date()
	const data: DiscordRichMessageData = {
		content: null,
		embeds: [
			{
				title: title,
				description: msg,
				color: 5814783,
				footer: {
					text: "CPE Student Union 2026",
				},
				timestamp: now.toISOString(),
			},
		],
		attachments: [],
	}

	if (link) {
		data.embeds[0].url = link
	}

	await fetch(endpoint, {
		method: "post",
		body: JSON.stringify(data),
		headers: {
			"Content-Type": "application/json",
		},
	})
}
