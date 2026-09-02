/**
 * Vercel Serverless Function — POST /api/chat
 *
 * OPENROUTER_API_KEY stays server-only in the Vercel environment.
 */

import { CHAT_LIMITS } from '../shared/chat.ts'
import { buildPortfolioSystemPrompt } from './_lib/buildPortfolioSystemPrompt.ts'
import { validateChatRequest } from './_lib/validateChatRequest.ts'

interface ChatRequest {
  headers: Record<string, string | string[] | undefined>
  method?: string
  body?: unknown
}

interface ChatResponse {
  setHeader(name: string, value: string): void
  status(code: number): ChatResponse
  json(
    body:
      | { error: string; code?: string }
      | { reply: string },
  ): ChatResponse
  end(): ChatResponse
}

const OPENROUTER_MODEL = 'openrouter/free'

const ALLOWED_ORIGINS = [
  'https://francihoxha.github.io',
  'https://portfolio-azure-nu-94.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
]

const SYSTEM_PROMPT = buildPortfolioSystemPrompt()

function getHeader(req: ChatRequest, name: string) {
  const value = req.headers[name] ?? req.headers[name.toLowerCase()]
  return Array.isArray(value) ? value[0] : value ?? ''
}

function serviceUnavailable(res: ChatResponse, status = 503) {
  return res.status(status).json({
    code: 'SERVICE_UNAVAILABLE',
    error: 'AI service unavailable',
  })
}

export default async function handler(req: ChatRequest, res: ChatResponse) {
  const origin = getHeader(req, 'origin')

  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const contentType = getHeader(req, 'content-type').toLowerCase()
  if (!contentType.startsWith('application/json')) {
    return res.status(415).json({
      code: 'UNSUPPORTED_MEDIA_TYPE',
      error: 'Content-Type must be application/json',
    })
  }

  const validation = validateChatRequest(req.body)
  if (!validation.ok) {
    return res.status(validation.status).json({
      code: validation.code,
      error: validation.error,
    })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return serviceUnavailable(res)

  const controller = new AbortController()
  let timedOut = false
  const timeout = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, CHAT_LIMITS.upstreamTimeoutMs)

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: 0.4,
        max_tokens: 300,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...validation.messages,
        ],
      }),
    })

    if (!upstream.ok) {
      console.error('[chat] OpenRouter error', {
        status: upstream.status,
        statusText: upstream.statusText,
        model: OPENROUTER_MODEL,
      })
      return serviceUnavailable(res)
    }

    const data: unknown = await upstream.json()
    const reply =
      data &&
      typeof data === 'object' &&
      Array.isArray((data as { choices?: unknown }).choices) &&
      typeof (data as { choices: Array<{ message?: { content?: unknown } }> })
        .choices[0]?.message?.content === 'string'
        ? (data as { choices: Array<{ message: { content: string } }> })
          .choices[0].message.content.trim()
        : ''

    if (!reply) {
      console.error('[chat] OpenRouter returned an empty reply', {
        model: OPENROUTER_MODEL,
      })
      return serviceUnavailable(res, 502)
    }

    return res.status(200).json({
      reply: reply.slice(0, CHAT_LIMITS.maxReplyCharacters),
    })
  } catch (error) {
    if (timedOut || (error instanceof Error && error.name === 'AbortError')) {
      console.error('[chat] OpenRouter request timed out', {
        model: OPENROUTER_MODEL,
        timeoutMs: CHAT_LIMITS.upstreamTimeoutMs,
      })
      return serviceUnavailable(res, 504)
    }

    console.error('[chat] handler failed', {
      message: error instanceof Error ? error.message : String(error),
    })
    return serviceUnavailable(res)
  } finally {
    clearTimeout(timeout)
  }
}
