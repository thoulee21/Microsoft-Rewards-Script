import axios from 'axios'

import { Config } from '../interface/Config'

// Legacy embed shape used by callers (Discord-like); we'll map it to Slack blocks
interface LegacyEmbedField {
    name: string
    value: string
    inline?: boolean
}

interface LegacyEmbedFooter {
    text?: string
}

interface LegacyEmbed {
    title?: string
    description?: string
    color?: number
    fields?: LegacyEmbedField[]
    timestamp?: string
    footer?: LegacyEmbedFooter
}

interface ConclusionPayload {
    content?: string
    embeds?: LegacyEmbed[]
}

function truncate(input: string, max: number): string {
    if (!input) return ''
    return input.length > max ? input.slice(0, max) : input
}

// Convert legacy Discord-like embeds to Slack Block Kit blocks
function embedsToSlackBlocks(embeds: LegacyEmbed[]) {
    const blocks: any[] = []

    for (const e of embeds) {
        if (e.title) {
            blocks.push({
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: truncate(e.title, 150),
                    emoji: true,
                },
            })
        }

        if (e.description) {
            blocks.push({
                type: 'section',
                text: { type: 'mrkdwn', text: truncate(e.description, 3000) },
            })
        }

        if (e.fields && e.fields.length) {
            // Slack limit: keep it reasonable; one section per field for clarity
            for (const f of e.fields.slice(0, 25)) {
                const name = truncate(f.name || '', 256)
                const value = truncate(f.value || '', 3000)
                const text = name ? `*${name}*\n${value}` : value
                blocks.push({
                    type: 'section',
                    text: { type: 'mrkdwn', text },
                })
            }
        }

        // Footer + timestamp as a context block
        const footerParts: string[] = []
        if (e.footer?.text) footerParts.push(truncate(e.footer.text, 200))
        if (e.timestamp) {
            try {
                const dt = new Date(e.timestamp)
                if (!isNaN(dt.getTime())) footerParts.push(dt.toISOString())
            } catch {
                // ignore bad timestamp
            }
        }
        if (footerParts.length) {
            blocks.push({
                type: 'context',
                elements: [{ type: 'mrkdwn', text: footerParts.join(' • ') }],
            })
        }
    }

    // Slack: max 50 blocks per message
    return blocks.slice(0, 50)
}

/**
 * Send a final structured summary to the dedicated conclusion webhook (if enabled),
 * otherwise do nothing. Does NOT fallback to the normal logging webhook to avoid spam.
 */
export async function ConclusionWebhook(
    configData: Config,
    content: string,
    embed?: ConclusionPayload
) {
    const webhook = configData.conclusionWebhook

    if (!webhook || !webhook.enabled || webhook.url.length < 10) return

    // Build Slack payload
    let body: any
    if (embed?.embeds && embed.embeds.length) {
        const blocks = embedsToSlackBlocks(embed.embeds)
        body = {
            text: content || 'Summary', // fallback for notifications
            blocks,
        }
    } else {
        body = { text: content || 'Summary' }
    }

    const request = {
        method: 'POST',
        url: webhook.url,
        headers: {
            'Content-Type': 'application/json',
        },
        data: body,
    }

    await axios(request).catch(() => {})
}
