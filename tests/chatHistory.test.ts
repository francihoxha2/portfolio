import { describe, expect, it } from 'vitest'
import { CHAT_LIMITS, boundChatHistory, type ChatMessage } from '../shared/chat.ts'

describe('assistant history bounding', () => {
  it('keeps a deterministic recent suffix within the message limit', () => {
    const messages = Array.from(
      { length: CHAT_LIMITS.maxMessages + 1 },
      (_, index) => ({
        id: `message-${index}`,
        role: index % 2 === 0 ? 'user' as const : 'assistant' as const,
        content: `message ${index}`,
      }),
    )

    const bounded = boundChatHistory(messages)

    expect(bounded).toHaveLength(11)
    expect(bounded[0].id).toBe('message-2')
    expect(bounded.at(-1)?.id).toBe('message-12')
    expect(bounded[0].role).toBe('user')
  })

  it('keeps recent coherent turns within the total-content limit', () => {
    const messages: ChatMessage[] = Array.from({ length: 7 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: String(index).repeat(1_200),
    }))

    const bounded = boundChatHistory(messages)

    expect(bounded.reduce((total, message) => total + message.content.length, 0))
      .toBeLessThanOrEqual(CHAT_LIMITS.maxTotalCharacters)
    expect(bounded[0].role).toBe('user')
    expect(bounded.at(-1)?.role).toBe('user')
    expect(bounded).toEqual(messages.slice(2))
  })
})
