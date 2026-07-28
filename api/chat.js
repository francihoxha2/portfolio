/**
 * Vercel Serverless Function — POST /api/chat
 *
 * Set OPENROUTER_API_KEY in Vercel:
 *   Vercel Dashboard → Your Project → Settings → Environment Variables
 *   Name:  OPENROUTER_API_KEY
 *   Value: sk-or-v1-...
 *   Environment: Production (and Preview if needed)
 */

const OPENROUTER_MODEL = 'openai/gpt-oss-20b:free'

const ALLOWED_ORIGINS = [
  'https://francihoxha.github.io',
  'https://portfolio-azure-nu-94.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
]

const SYSTEM_PROMPT = `You are Franci Hoxha's AI Portfolio Assistant.
Answer only about Franci's professional profile, projects, skills, education, and contact.
Do not pretend to be Franci personally.
Answer in the same language as the visitor.
If the visitor writes in Albanian, answer in natural Albanian.
Keep answers short, professional, and useful for recruiters.
Do not invent information.
If you do not know something, say that the visitor can contact Franci directly.
FORMATTING: Write in plain conversational prose. Never use markdown tables. Use short bullet lists only when listing 3+ items. Bold key terms sparingly. No headers.

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
- IT Hardware Support and IT Operation Systems`

export default async function handler(req, res) {
  const origin = req.headers.origin || ''

  // Set CORS headers — only allow listed origins
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Vary', 'Origin')

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body ?? {}

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' })
  }

  // Sanitise — only forward role + content to OpenRouter
  const sanitised = messages
    .filter(m => m && typeof m.role === 'string' && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content }))

  if (sanitised.length === 0) {
    return res.status(400).json({ error: 'No valid messages found' })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Service configuration error' })
  }

  try {
    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: 0.4,
        max_tokens: 300,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...sanitised],
      }),
    })

    if (!upstream.ok) {
      let upstreamBody = ''
      try {
        upstreamBody = await upstream.text()
      } catch {
        upstreamBody = '(could not read body)'
      }

      let upstreamMessage = upstreamBody
      try {
        const parsed = JSON.parse(upstreamBody)
        upstreamMessage =
          parsed?.error?.message ?? parsed?.message ?? upstreamBody
      } catch {
        /* keep raw text */
      }

      console.error('[chat] OpenRouter error', {
        status: upstream.status,
        statusText: upstream.statusText,
        model: OPENROUTER_MODEL,
        message: String(upstreamMessage).slice(0, 500),
      })

      return res.status(502).json({ error: 'AI service unavailable' })
    }

    const data = await upstream.json()
    const reply = data.choices?.[0]?.message?.content ?? ''

    return res.status(200).json({ reply })
  } catch (err) {
    console.error('[chat] handler failed', {
      message: err instanceof Error ? err.message : String(err),
    })
    return res.status(500).json({ error: 'Internal server error' })
  }
}
