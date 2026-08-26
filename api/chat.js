/**
 * Vercel Serverless Function — POST /api/chat
 *
 * Set OPENROUTER_API_KEY in Vercel:
 *   Vercel Dashboard → Your Project → Settings → Environment Variables
 *   Name:  OPENROUTER_API_KEY
 *   Value: sk-or-v1-...
 *   Environment: Production (and Preview if needed)
 */

import { buildPortfolioSystemPrompt } from './_lib/buildPortfolioSystemPrompt.ts'

const OPENROUTER_MODEL = 'openai/gpt-oss-20b:free'

const ALLOWED_ORIGINS = [
  'https://francihoxha.github.io',
  'https://portfolio-azure-nu-94.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
]

const SYSTEM_PROMPT = buildPortfolioSystemPrompt()

export default async function handler(req, res) {
  const origin = req.headers.origin || ''

  // Set CORS headers — only allow listed origins
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Vary', 'Origin')

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body ?? {}

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' })
  }

  // Sanitise — only forward role + content to OpenRouter
  const sanitised = messages
    .filter(m => m && typeof m.role === 'string' && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content }))

  if (sanitised.length === 0) {
    return res.status(400).json({ error: 'No valid messages found' })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Service configuration error' })
  }

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: 0.4,
        max_tokens: 300,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...sanitised],
      }),
    })

    if (!upstream.ok) {
      let upstreamBody = ''
      try {
        upstreamBody = await upstream.text()
      } catch {
        upstreamBody = '(could not read body)'
      }

      let upstreamMessage = upstreamBody
      try {
        const parsed = JSON.parse(upstreamBody)
        upstreamMessage =
          parsed?.error?.message ?? parsed?.message ?? upstreamBody
      } catch {
        /* keep raw text */
      }

      console.error('[chat] OpenRouter error', {
        status: upstream.status,
        statusText: upstream.statusText,
        model: OPENROUTER_MODEL,
        message: String(upstreamMessage).slice(0, 500),
      })

      return res.status(502).json({ error: 'AI service unavailable' })
    }

    const data = await upstream.json()
    const reply = data.choices?.[0]?.message?.content ?? ''

    return res.status(200).json({ reply })
  } catch (err) {
    console.error('[chat] handler failed', {
      message: err instanceof Error ? err.message : String(err),
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}
