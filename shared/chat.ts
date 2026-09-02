export const CHAT_LIMITS = {
  maxRequestBytes: 16 * 1024,
  maxMessages: 12,
  maxMessageCharacters: 1_500,
  maxTotalCharacters: 8_000,
  maxReplyCharacters: 1_500,
  upstreamTimeoutMs: 12_000,
} as const

export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export function boundChatHistory<T extends ChatMessage>(messages: readonly T[]): T[] {
  const bounded: T[] = []
  let totalCharacters = 0

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index]
    if (bounded.length >= CHAT_LIMITS.maxMessages) break
    if (totalCharacters + message.content.length > CHAT_LIMITS.maxTotalCharacters) break

    bounded.unshift(message)
    totalCharacters += message.content.length
  }

  // Keep a coherent suffix instead of beginning the submitted context with an
  // assistant answer whose visitor question has already been trimmed away.
  while (bounded[0]?.role === 'assistant') bounded.shift()

  return bounded
}
