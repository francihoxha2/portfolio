import {
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
  type UIEvent,
} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAssistant } from './AssistantProvider.tsx'

interface AssistantMessagesProps {
  className: string
  emptyState: ReactNode
  label: string
  onContact?: () => void
}

function AssistantAnswer({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node: _node, ...props }) => (
          <a {...props} target="_blank" rel="noreferrer noopener" />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

export function AssistantMessages({
  className,
  emptyState,
  label,
  onContact,
}: AssistantMessagesProps) {
  const { messages, isPending, error, retry } = useAssistant()
  const containerRef = useRef<HTMLDivElement>(null)
  const stayAtBottomRef = useRef(true)
  const lastMessage = messages.at(-1)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    if (stayAtBottomRef.current || lastMessage?.role === 'user') {
      container.scrollTop = container.scrollHeight
    }
  }, [error, isPending, lastMessage?.id, lastMessage?.role])

  function rememberScrollPosition(event: UIEvent<HTMLDivElement>) {
    const container = event.currentTarget
    stayAtBottomRef.current =
      container.scrollHeight - container.scrollTop - container.clientHeight < 48
  }

  return (
    <div
      ref={containerRef}
      className={className}
      aria-label={label}
      aria-busy={isPending}
      onScroll={rememberScrollPosition}
    >
      {messages.length === 0 && !error ? emptyState : null}
      {messages.map((message) => (
        <article
          key={message.id}
          className={`chat-message chat-message-${message.role}`}
          aria-label={message.role === 'user' ? 'You' : 'Portfolio assistant'}
        >
          <div className="chat-bubble">
            {message.role === 'assistant' ? (
              <AssistantAnswer>{message.content}</AssistantAnswer>
            ) : (
              message.content
            )}
          </div>
        </article>
      ))}
      {isPending ? (
        <div className="chat-message chat-message-assistant" role="status" aria-live="polite">
          <div className="chat-bubble chat-typing">
            <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
            <span className="sr-only">Franci&rsquo;s AI assistant is thinking.</span>
          </div>
        </div>
      ) : null}
      {error && !isPending ? (
        <div className="chat-message chat-message-assistant">
          <div className="chat-bubble chat-bubble-error" role="alert">
            <p>{error.message}</p>
            <div className="chat-error-actions">
              {error.retryable ? (
                <button type="button" className="chat-error-action" onClick={retry}>
                  Retry
                </button>
              ) : null}
              <a className="chat-error-action" href="#contact" onClick={onContact}>
                Contact Franci
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

interface AssistantComposerProps {
  id: string
  inputRef?: RefObject<HTMLTextAreaElement | null>
}

export function AssistantComposer({ id, inputRef }: AssistantComposerProps) {
  const { draft, setDraft, sendMessage, isPending, limits } = useAssistant()
  const helpId = `${id}-help`

  return (
    <form
      className="chat-composer"
      onSubmit={(event) => {
        event.preventDefault()
        sendMessage()
      }}
    >
      <label className="chat-composer-label" htmlFor={id}>Ask the portfolio assistant</label>
      <div className="chat-composer-row">
        <textarea
          ref={inputRef}
          id={id}
          className="chat-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault()
              sendMessage()
            }
          }}
          placeholder="Ask about work, projects, skills, or background"
          rows={2}
          maxLength={limits.maxMessageCharacters}
          disabled={isPending}
          aria-describedby={helpId}
        />
        <button
          className="chat-send"
          type="submit"
          disabled={!draft.trim() || isPending}
          aria-label={isPending ? 'Waiting for assistant response' : 'Send message'}
        >
          <span aria-hidden="true">&uarr;</span>
        </button>
      </div>
      <div id={helpId} className="chat-composer-help">
        <span>Enter to send &middot; Shift+Enter for a new line</span>
        <span>{draft.length}/{limits.maxMessageCharacters.toLocaleString()}</span>
      </div>
    </form>
  )
}

export function AssistantSuggestions({ suggestions }: { suggestions: string[] }) {
  const { sendMessage, isPending } = useAssistant()

  return (
    <div className="ai-suggestions" aria-label="Suggested questions">
      {suggestions.map((question) => (
        <button
          key={question}
          className="ai-suggestion-chip"
          type="button"
          onClick={() => sendMessage(question)}
          disabled={isPending}
        >
          {question}
        </button>
      ))}
    </div>
  )
}
