import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const SUGGESTIONS = [
  'What projects has Franci built?',
  'What are his technical skills?',
  'Tell me about his experience',
  'Is he open to new opportunities?',
]

export default function AiChat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const trimmed = (text ?? input).trim()
    if (!trimmed || isLoading) return

    const userMessage = { role: 'user', content: trimmed }
    const updated = [...messages, userMessage]
    setMessages(updated)
    setInput('')
    setError(null)
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error(`${res.status}`)
      const { reply } = await res.json()

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setError("Sorry, I couldn't reach the AI right now. Please try again in a moment.")
    } finally {
      setIsLoading(false)
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <section id="ai-chat" className="section">
      <div className="section-head">
        <p className="eyebrow">AI Assistant</p>
        <h2>Ask about my work</h2>
        <p>
          A built-in assistant that answers recruiter questions about my skills,
          projects, and background — instantly, in your language.
        </p>
      </div>

      <div className="ai-shell">
        <div className="ai-intro">
          <h3>Skip the back-and-forth</h3>
          <p style={{ marginTop: '0.6rem' }}>
            Ask anything you&rsquo;d normally email about. It only answers from my
            real profile — no invented details.
          </p>
          <div className="ai-points">
            <div className="ai-point">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              Skills, stack, and project details
            </div>
            <div className="ai-point">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              Education and work background
            </div>
            <div className="ai-point">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              Availability for roles &amp; contact
            </div>
            <div className="ai-point">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
              Replies in English or Albanian
            </div>
          </div>
        </div>

        <div className="ai-section-panel">
          <div className="ai-panel-head">
            <div className="chat-avatar">AI</div>
            <div style={{ flex: 1 }}>
              <div className="title">Portfolio Assistant</div>
              <div className="status">
                <span className="dot"></span>
                Online · answers about Franci
              </div>
            </div>
          </div>
        {isEmpty ? (
          <div className="ai-section-empty">
            <div className="ai-section-empty-icon" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="ai-section-empty-label">Try asking one of these questions:</p>
            <div className="ai-suggestions">
              {SUGGESTIONS.map(q => (
                <button
                  key={q}
                  className="ai-suggestion-chip"
                  onClick={() => send(q)}
                  disabled={isLoading}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="ai-section-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message chat-message-${msg.role}`}>
                <div className="chat-bubble">
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message chat-message-assistant">
                <div className="chat-bubble chat-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            {error && !isLoading && (
              <div className="chat-message chat-message-assistant">
                <div className="chat-bubble chat-bubble-error">{error}</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className="ai-section-input-row">
          {!isEmpty && (
            <div className="ai-suggestions ai-suggestions-inline">
              {SUGGESTIONS.map(q => (
                <button
                  key={q}
                  className="ai-suggestion-chip ai-suggestion-chip-sm"
                  onClick={() => send(q)}
                  disabled={isLoading}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <div className="ai-section-input-wrap">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about skills, projects, experience…"
              rows={1}
              disabled={isLoading}
            />
            <button
              className="chat-send"
              onClick={() => send()}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              ↑
            </button>
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}
