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

export interface LegacyEmbed {
    title: string
    description?: string
    color?: number
    fields?: LegacyEmbedField[]
    startedAt: string
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

function colorToHex(n?: number): string | undefined {
    if (typeof n !== 'number' || !isFinite(n)) return undefined
    const hex = n.toString(16).padStart(6, '0').slice(-6)
    return `#${hex}`
}

// Convert a single legacy embed to Slack Block Kit blocks
function embedToSlackBlocks(e: LegacyEmbed) {
    const blocks: any[] = []

    // Title becomes a header block
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

    // Description becomes a section block
    if (e.description) {
        blocks.push({
            type: 'section',
            text: { type: 'mrkdwn', text: truncate(e.description, 3000) },
        })
    }

    // Each field becomes its own section block
    if (e.fields && e.fields.length) {
        for (const f of e.fields.slice(0, 25)) {
            const name = truncate(f.name || '', 256)
            const value = truncate(f.value || '', 3000)
            const text = name ? `*${name}*\n${value}` : value
            blocks.push({ type: 'section', text: { type: 'mrkdwn', text } })
        }
    }

    // Footer + timestamp combined into a single context block
    const footerParts: string[] = []

    if (e.footer?.text) {
        footerParts.push(truncate(e.footer.text, 200))
    }
    if (e.startedAt) {
        try {
            const dt = new Date(e.startedAt)
            if (!isNaN(dt.getTime())) {
                footerParts.push(
                    dt.toLocaleString('zh-CN', {
                        timeZone: 'Asia/Shanghai',
                        hour12: false,
                    })
                )
            }
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

    return blocks
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
        // Map each embed to a Slack attachment so we can use the left color bar
        const attachments = embed.embeds.slice(0, 20).map((e) => {
            const att: any = {
                ...(colorToHex(e.color) ? { color: colorToHex(e.color) } : {}),
                blocks: embedToSlackBlocks(e),
            }
            const fb = [e.title, e.description].filter(Boolean).join(' - ')
            if (fb) att.fallback = truncate(fb, 200)
            return att
        })
        // Only send attachments (no top-level text) per request
        body = { attachments }
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
