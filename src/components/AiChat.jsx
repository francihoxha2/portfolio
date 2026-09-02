import {
  AssistantComposer,
  AssistantMessages,
  AssistantSuggestions,
} from './ai/AssistantConversation.tsx'
import { useAssistant } from './ai/AssistantProvider.tsx'

export default function AiChat({ suggestions }) {
  const {
    newConversation,
    canStartNewConversation,
  } = useAssistant()

  return (
    <section id="ai" className="section portfolio-section ai-section" aria-labelledby="ai-title">
      <div className="section-head">
        <p className="eyebrow">AI Assistant</p>
        <h2 id="ai-title">Ask about Franci&rsquo;s work</h2>
        <p>
          Ask about his projects, skills, professional background, or credentials.
          The assistant replies in your language.
        </p>
      </div>

      <div className="ai-shell">
        <div className="ai-intro">
          <h3>A direct route through the portfolio</h3>
          <p className="ai-intro__copy">
            Use a starter question or ask your own. The same conversation continues
            if you open the compact assistant elsewhere on the page.
          </p>
          <div className="ai-points">
            {[
              'Work and project details',
              'Technologies and engineering skills',
              'Professional journey and education',
              'Selected credentials and AI experience',
            ].map((point) => (
              <div key={point} className="ai-point">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="ai-section-panel">
          <div className="ai-panel-head">
            <div className="chat-avatar" aria-hidden="true">AI</div>
            <div className="ai-panel-head__identity">
              <div className="title">AI portfolio assistant</div>
              <div className="status">
                <span className="dot" aria-hidden="true" />
                Ready for questions about Franci
              </div>
            </div>
            <button
              className="chat-new-conversation"
              type="button"
              onClick={newConversation}
              disabled={!canStartNewConversation}
            >
              New conversation
            </button>
          </div>

          <AssistantMessages
            className="ai-section-messages"
            label="Assistant conversation in the AI section"
            emptyState={(
              <div className="ai-section-empty">
                <div className="ai-section-empty-icon" aria-hidden="true">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <p className="ai-section-empty-label">Start with one of these questions</p>
                <AssistantSuggestions suggestions={suggestions} />
              </div>
            )}
          />

          <div className="ai-section-input-row">
            <AssistantComposer id="assistant-composer-inline" />
          </div>
        </div>
      </div>
    </section>
  )
}
