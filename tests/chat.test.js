import { afterEach, describe, expect, it, vi } from 'vitest'
import handler from '../api/chat.ts'

function createResponse() {
  return {
    body: undefined,
    headers: {},
    statusCode: 200,
    setHeader(name, value) {
      this.headers[name] = value
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
    end() {
      return this
    },
  }
}

afterEach(() => {
  vi.unstubAllGlobals()
  delete process.env.OPENROUTER_API_KEY
})

describe('chat handler Phase 0 prompt integration', () => {
  it('places the generated canonical prompt before visitor messages', async () => {
    process.env.OPENROUTER_API_KEY = 'test-key'
    const upstream = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ choices: [{ message: { content: 'Test reply' } }] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    )
    vi.stubGlobal('fetch', upstream)

    const req = {
      method: 'POST',
      headers: { origin: 'http://localhost:5173' },
      body: { messages: [{ role: 'user', content: 'What has Franci built?' }] },
    }
    const res = createResponse()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(res.body).toEqual({ reply: 'Test reply' })

    const request = upstream.mock.calls[0][1]
    const payload = JSON.parse(request.body)
    expect(payload.messages[0]).toMatchObject({ role: 'system' })
    expect(payload.messages[0].content).toContain('Flagship Software Project')
    expect(payload.messages[0].content).not.toMatch(/currently pursuing|polar/i)
    expect(payload.messages[1]).toEqual(req.body.messages[0])
  })
})
