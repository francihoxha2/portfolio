import { useEffect, useRef, useState } from 'react'
import {
  AssistantComposer,
  AssistantMessages,
  AssistantSuggestions,
} from './ai/AssistantConversation.tsx'
import { useAssistant } from './ai/AssistantProvider.tsx'
import { OPEN_PORTFOLIO_ASSISTANT_EVENT } from '../hooks/useAssistantLauncher.ts'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function ChatWidget({ name, suggestions }) {
  const [isOpen, setIsOpen] = useState(false)
  const [heroVisible, setHeroVisible] = useState(true)
  const {
    newConversation,
    canStartNewConversation,
  } = useAssistant()
  const inputRef = useRef(null)
  const panelRef = useRef(null)
  const launcherRef = useRef(null)

  useEffect(() => {
    const openAssistant = () => setIsOpen(true)
    window.addEventListener(OPEN_PORTFOLIO_ASSISTANT_EVENT, openAssistant)
    return () => window.removeEventListener(OPEN_PORTFOLIO_ASSISTANT_EVENT, openAssistant)
  }, [])

  useEffect(() => {
    if (!isOpen) return undefined

    const shell = panelRef.current?.closest('.app-shell')
    const background = shell
      ? [...shell.children].filter((element) => !element.classList.contains('chat-widget'))
      : []
    const previousOverflow = document.body.style.overflow

    for (const element of background) element.inert = true
    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => inputRef.current?.focus())

    return () => {
      for (const element of background) element.inert = false
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  useEffect(() => {
    const hero = document.querySelector('.hero-section')
    if (!hero || !('IntersectionObserver' in window)) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.02 },
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  function closeAssistant() {
    setIsOpen(false)
    window.requestAnimationFrame(() => launcherRef.current?.focus())
  }

  function handlePanelKeyDown(event) {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeAssistant()
      return
    }
    if (event.key !== 'Tab' || !panelRef.current) return

    const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR)]
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable.at(-1)

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="chat-widget">
      {isOpen ? (
        <>
          <div
            className="chat-backdrop"
            aria-hidden="true"
            onPointerDown={closeAssistant}
          />
          <div
            ref={panelRef}
            id="portfolio-assistant-dialog"
            className="chat-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="portfolio-assistant-title"
            onKeyDown={handlePanelKeyDown}
          >
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-avatar" aria-hidden="true">AI</div>
                <div>
                  <div id="portfolio-assistant-title" className="chat-title">
                    AI Portfolio Assistant
                  </div>
                  <div className="chat-subtitle">Ask about {name}</div>
                </div>
              </div>
              <div className="chat-header-actions">
                <button
                  className="chat-new-conversation chat-new-conversation--compact"
                  type="button"
                  onClick={newConversation}
                  disabled={!canStartNewConversation}
                >
                  New conversation
                </button>
                <button
                  className="chat-close"
                  type="button"
                  onClick={closeAssistant}
                  aria-label="Close AI assistant"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
            </div>

            <AssistantMessages
              className="chat-messages"
              label="Assistant conversation in the floating panel"
              onContact={closeAssistant}
              emptyState={(
                <div className="chat-welcome">
                  <p>
                    Hi! I&rsquo;m an AI assistant about {name} and his work.
                    What would you like to know?
                  </p>
                  <AssistantSuggestions suggestions={suggestions} />
                </div>
              )}
            />

            <div className="chat-input-area">
              <AssistantComposer id="assistant-composer-floating" inputRef={inputRef} />
            </div>
          </div>
        </>
      ) : null}

      {!isOpen ? (
        <button
          ref={launcherRef}
          className={`chat-fab${heroVisible ? ' chat-fab--deferred' : ''}`}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI portfolio assistant"
          aria-expanded="false"
          aria-controls="portfolio-assistant-dialog"
          aria-haspopup="dialog"
        >
          <svg
            className="chat-fab-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="chat-fab-label">Ask AI</span>
        </button>
      ) : null}
    </div>
  )
}
