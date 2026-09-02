import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  CHAT_LIMITS,
  boundChatHistory,
  type ChatMessage,
} from '../../../shared/chat.ts'

export type AssistantErrorKind =
  | 'validation'
  | 'too-large'
  | 'connection'
  | 'unavailable'

export interface AssistantError {
  kind: AssistantErrorKind
  message: string
  retryable: boolean
}

export interface AssistantMessage extends ChatMessage {
  id: string
}

interface ActiveRequest {
  controller: AbortController
  token: number
}

interface AssistantContextValue {
  messages: AssistantMessage[]
  draft: string
  setDraft(value: string): void
  isPending: boolean
  error: AssistantError | null
  sendMessage(text?: string): boolean
  retry(): void
  newConversation(): void
  canStartNewConversation: boolean
  limits: typeof CHAT_LIMITS
}

const AssistantContext = createContext<AssistantContextValue | null>(null)

function responseError(status: number): AssistantError {
  if (status === 413) {
    return {
      kind: 'too-large',
      message: 'This conversation is too large to send. Start a new conversation or shorten your question.',
      retryable: false,
    }
  }

  if (status >= 500 || status === 429) {
    return {
      kind: 'unavailable',
      message: 'The AI assistant is temporarily unavailable. Please try again in a moment.',
      retryable: true,
    }
  }

  return {
    kind: 'validation',
    message: 'That message could not be sent. Check it and try again.',
    retryable: false,
  }
}

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<AssistantError | null>(null)
  const activeRequestRef = useRef<ActiveRequest | null>(null)
  const retryMessagesRef = useRef<AssistantMessage[] | null>(null)
  const requestTokenRef = useRef(0)
  const messageSequenceRef = useRef(0)

  const nextMessageId = useCallback(() => {
    messageSequenceRef.current += 1
    return `assistant-message-${messageSequenceRef.current}`
  }, [])

  const runRequest = useCallback(async (requestMessages: AssistantMessage[]) => {
    if (activeRequestRef.current) return

    const controller = new AbortController()
    requestTokenRef.current += 1
    const token = requestTokenRef.current
    activeRequestRef.current = { controller, token }
    retryMessagesRef.current = requestMessages
    setError(null)
    setIsPending(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: requestMessages.map(({ role, content }) => ({ role, content })),
        }),
      })

      if (activeRequestRef.current?.token !== token) return
      if (!response.ok) throw responseError(response.status)

      const data: unknown = await response.json()
      const reply =
        data && typeof data === 'object' && typeof (data as { reply?: unknown }).reply === 'string'
          ? (data as { reply: string }).reply.trim()
          : ''

      if (!reply) {
        throw {
          kind: 'unavailable',
          message: 'The AI assistant returned no answer. Please try again.',
          retryable: true,
        } satisfies AssistantError
      }

      const assistantMessage: AssistantMessage = {
        id: nextMessageId(),
        role: 'assistant',
        content: reply.slice(0, CHAT_LIMITS.maxReplyCharacters),
      }
      setMessages(boundChatHistory([...requestMessages, assistantMessage]))
      retryMessagesRef.current = null
    } catch (requestError) {
      if (activeRequestRef.current?.token !== token || controller.signal.aborted) return

      if (
        requestError &&
        typeof requestError === 'object' &&
        'kind' in requestError &&
        'message' in requestError
      ) {
        setError(requestError as AssistantError)
      } else {
        setError({
          kind: 'connection',
          message: 'The request could not be completed. Check your connection and try again.',
          retryable: true,
        })
      }
    } finally {
      if (activeRequestRef.current?.token === token) {
        activeRequestRef.current = null
        setIsPending(false)
      }
    }
  }, [nextMessageId])

  const sendMessage = useCallback((text?: string) => {
    if (activeRequestRef.current) return false

    const trimmed = (text ?? draft).trim()
    if (!trimmed) {
      setError({
        kind: 'validation',
        message: 'Enter a question before sending.',
        retryable: false,
      })
      return false
    }
    if (trimmed.length > CHAT_LIMITS.maxMessageCharacters) {
      setError({
        kind: 'too-large',
        message: `Keep each question to ${CHAT_LIMITS.maxMessageCharacters.toLocaleString()} characters or fewer.`,
        retryable: false,
      })
      return false
    }

    const userMessage: AssistantMessage = {
      id: nextMessageId(),
      role: 'user',
      content: trimmed,
    }
    const requestMessages = boundChatHistory([...messages, userMessage])

    setMessages(requestMessages)
    setDraft('')
    setError(null)
    void runRequest(requestMessages)
    return true
  }, [draft, messages, nextMessageId, runRequest])

  const retry = useCallback(() => {
    if (activeRequestRef.current || !retryMessagesRef.current) return
    void runRequest(retryMessagesRef.current)
  }, [runRequest])

  const newConversation = useCallback(() => {
    activeRequestRef.current?.controller.abort()
    activeRequestRef.current = null
    requestTokenRef.current += 1
    retryMessagesRef.current = null
    setMessages([])
    setDraft('')
    setError(null)
    setIsPending(false)
  }, [])

  useEffect(() => () => activeRequestRef.current?.controller.abort(), [])

  const value = useMemo<AssistantContextValue>(() => ({
    messages,
    draft,
    setDraft,
    isPending,
    error,
    sendMessage,
    retry,
    newConversation,
    canStartNewConversation:
      messages.length > 0 || Boolean(draft.trim()) || Boolean(error) || isPending,
    limits: CHAT_LIMITS,
  }), [draft, error, isPending, messages, newConversation, retry, sendMessage])

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>
}

// The provider and its focused consumer hook intentionally share this module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAssistant() {
  const context = useContext(AssistantContext)
  if (!context) throw new Error('useAssistant must be used inside AssistantProvider')
  return context
}
