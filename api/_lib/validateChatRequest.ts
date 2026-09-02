import { Buffer } from 'node:buffer'
import { CHAT_LIMITS, type ChatMessage } from '../../shared/chat.ts'

export type ChatRequestErrorCode =
  | 'INVALID_REQUEST'
  | 'REQUEST_TOO_LARGE'

export type ChatValidationResult =
  | { ok: true; messages: ChatMessage[] }
  | {
      ok: false
      status: 400 | 413
      code: ChatRequestErrorCode
      error: string
    }

function hasDisallowedControlCharacters(value: string) {
  return [...value].some((character) => {
    const code = character.charCodeAt(0)
    return code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127
  })
}

function invalid(error: string): ChatValidationResult {
  return { ok: false, status: 400, code: 'INVALID_REQUEST', error }
}

function tooLarge(error: string): ChatValidationResult {
  return { ok: false, status: 413, code: 'REQUEST_TOO_LARGE', error }
}

function getRequestBytes(body: unknown) {
  try {
    const serialised = JSON.stringify(body)
    return typeof serialised === 'string'
      ? Buffer.byteLength(serialised, 'utf8')
      : Number.POSITIVE_INFINITY
  } catch {
    return Number.POSITIVE_INFINITY
  }
}

export function validateChatRequest(body: unknown): ChatValidationResult {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return invalid('Request body must be a JSON object')
  }

  if (getRequestBytes(body) > CHAT_LIMITS.maxRequestBytes) {
    return tooLarge('Request body is too large')
  }

  const messages = (body as { messages?: unknown }).messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return invalid('messages must be a non-empty array')
  }

  if (messages.length > CHAT_LIMITS.maxMessages) {
    return tooLarge(`A conversation may contain at most ${CHAT_LIMITS.maxMessages} messages`)
  }

  const sanitised: ChatMessage[] = []
  let totalCharacters = 0

  for (const message of messages) {
    if (!message || typeof message !== 'object' || Array.isArray(message)) {
      return invalid('Every message must be an object')
    }

    const { role, content } = message as { role?: unknown; content?: unknown }
    if (role !== 'user' && role !== 'assistant') {
      return invalid('Message role must be user or assistant')
    }
    if (typeof content !== 'string') {
      return invalid('Message content must be text')
    }
    if (content.length > CHAT_LIMITS.maxMessageCharacters) {
      return tooLarge(
        `Each message may contain at most ${CHAT_LIMITS.maxMessageCharacters} characters`,
      )
    }

    const trimmedContent = content.trim()
    if (!trimmedContent) return invalid('Message content cannot be empty')
    if (hasDisallowedControlCharacters(trimmedContent)) {
      return invalid('Message content contains unsupported control characters')
    }

    totalCharacters += trimmedContent.length
    if (totalCharacters > CHAT_LIMITS.maxTotalCharacters) {
      return tooLarge(
        `Conversation content may contain at most ${CHAT_LIMITS.maxTotalCharacters} characters`,
      )
    }

    sanitised.push({ role, content: trimmedContent })
  }

  if (sanitised.at(-1)?.role !== 'user') {
    return invalid('The final message must be from the user')
  }

  return { ok: true, messages: sanitised }
}
