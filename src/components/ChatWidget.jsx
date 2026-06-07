import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const SYSTEM_PROMPT = `You are an AI Portfolio Assistant for Franci Hoxha, a Junior Full-Stack Developer based in Tirana, Albania. Your role is to help visitors learn about his skills, projects, career, and background. Be helpful, concise, and friendly. Answer in the same language the visitor uses.

== PROFILE ==
Name: Franci Hoxha
Title: Junior Full-Stack Developer
Location: Tirana, Albania
Email: francihoxha@yahoo.com
Phone: +355 69 253 8842
LinkedIn: https://www.linkedin.com/in/franci-hoxha-78a174329/

Summary: Builds real-world web platforms with React, Next.js, Node.js, and modern product-focused engineering.

About: Turns practical business problems into clean, usable, and deployment-ready digital solutions. Currently pursuing an MSc in Informatics Engineering while growing through hands-on full-stack product development, responsive UI work, API-driven features, and product ownership.

== TECHNICAL SKILLS ==
Frontend: React, Next.js, JavaScript, HTML & CSS, Responsive UI, PWA
Backend: Node.js, REST APIs, Authentication & Authorization, Business Logic, Reminder Workflows
Databases & Tools: MongoDB, MySQL, SQL Server, GitHub, Vercel
Languages spoken: English, Italian

== PROJECTS ==

1. Planify.al — Booking Platform
   Stack: Next.js, React, Node.js, MongoDB, Vercel
   Live: https://planify.al
   Description: A full-stack booking and business management platform for service-based businesses. Features online appointments, staff and customer management, analytics dashboards, booking reminders, geolocation-based discovery, public business profiles, payment status management, and PWA support.
   Highlights: End-to-end product development, UI/UX and responsive booking flows, API-driven functionality and booking logic, authentication and role-based areas, analytics dashboards and reminder workflows, PWA behavior and deployment-ready architecture.

2. BarberSpot.al — Booking Platform
   Stack: JavaScript, React, Node.js, MongoDB
   Live: https://barberspot.al
   Description: A focused booking platform for barber shops supporting appointment scheduling, staff workflows, reminders, customer communication, and business analytics for day-to-day service operations.
   Highlights: Role-based staff management, appointment scheduling and reminders, WhatsApp and SMS communication flows, business analytics for service teams.

3. Online Charging Station Management System — Web Application
   Stack: JavaScript, Node.js, Database Design
   Description: A reservation and management system for electric vehicle charging stations in Albania, focused on user management, reservation flows, and database integration for daily operations.

== EDUCATION ==
- MSc in Informatics Engineering, European University of Tirana (UET), 2024–Present
- Master's Degree in Business Administration, Fan S. Noli University, Korce, 2015–2017

== WORK EXPERIENCE ==
- Computer Technician & IT Support, 2021–2025: Supported business users and systems across Windows, macOS, and Linux environments. Built a strong foundation in troubleshooting, reliability, documentation, and operational thinking that now supports software development work.

== COURSES & TRAINING ==
- Software Professional Course
- IT Hardware Support and IT Operation Systems

If asked about anything outside this professional portfolio, politely redirect to Franci's career and work. Keep answers concise — under 150 words unless more detail is clearly needed.

FORMATTING: Write in plain conversational prose. Never use markdown tables. Use short bullet lists only when listing 3+ items. Bold key terms sparingly. No headers.`

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Franci's AI Portfolio Assistant. Ask me anything about his skills, projects, or career background!",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) inputRef.current?.focus()
  }, [isOpen])

  async function sendMessage() {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage = { role: 'user', content: text }
    const updated = [...messages, userMessage]
    setMessages(updated)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b:free',
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...updated],
          max_tokens: 400,
        }),
      })
      if (!res.ok) throw new Error(res.status)
      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.choices[0].message.content },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, I couldn't reach the AI right now. Please try again in a moment.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-widget">
      {isOpen && (
        <div className="chat-panel" role="dialog" aria-label="AI Portfolio Assistant">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">AI</div>
              <div>
                <div className="chat-title">AI Portfolio Assistant</div>
                <div className="chat-subtitle">Ask about Franci&rsquo;s career</div>
              </div>
            </div>
            <button
              className="chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chat-messages">
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
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
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
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
            >
              ↑
            </button>
          </div>
        </div>
      )}

      <button
        className="chat-fab"
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? 'Close AI assistant' : 'Open AI Portfolio Assistant'}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <>
            <span className="chat-fab-icon">✕</span>
            <span className="chat-fab-label">Close</span>
          </>
        ) : (
          <>
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
          </>
        )}
      </button>
    </div>
  )
}
