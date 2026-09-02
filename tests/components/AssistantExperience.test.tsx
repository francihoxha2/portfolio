// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
// @ts-expect-error The production section remains incrementally migrated JSX.
import AiChat from '../../src/components/AiChat.jsx'
// @ts-expect-error The production widget remains incrementally migrated JSX.
import ChatWidget from '../../src/components/ChatWidget.jsx'
import { AssistantProvider } from '../../src/components/ai/AssistantProvider.tsx'

const suggestions = [
  'What projects has Franci built?',
  'Tell me about Planify.',
]

class IntersectionObserverStub {
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords() { return [] }
  root = null
  rootMargin = ''
  thresholds = []
}

function renderExperience() {
  return render(
    <AssistantProvider>
      <div className="app-shell">
        <main>
          <AiChat suggestions={suggestions} />
        </main>
        <ChatWidget name="Franci Hoxha" suggestions={suggestions} />
      </div>
    </AssistantProvider>,
  )
}

function successfulResponse(reply: string) {
  return new Response(JSON.stringify({ reply }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', IntersectionObserverStub)
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    return window.setTimeout(() => callback(performance.now()), 0)
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id))
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.style.overflow = ''
})

describe('shared portfolio assistant experience', () => {
  it('shares message history in both directions and clears every surface', async () => {
    const user = userEvent.setup()
    const upstream = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(String(init.body))
      const question = body.messages.at(-1).content
      return successfulResponse(`Answer to: ${question}`)
    })
    vi.stubGlobal('fetch', upstream)
    const { container } = renderExperience()
    const section = within(container.querySelector('#ai') as HTMLElement)

    await user.type(section.getByLabelText('Ask the portfolio assistant'), 'Question A')
    await user.keyboard('{Enter}')
    await section.findByText('Answer to: Question A')

    await user.click(screen.getByRole('button', { name: 'Open AI portfolio assistant' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText('Question A')).toBeTruthy()
    expect(within(dialog).getByText('Answer to: Question A')).toBeTruthy()

    await user.type(within(dialog).getByLabelText('Ask the portfolio assistant'), 'Question B')
    await user.keyboard('{Enter}')
    await within(dialog).findByText('Answer to: Question B')

    await user.click(within(dialog).getByRole('button', { name: 'Close AI assistant' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(section.getByText('Question B')).toBeTruthy()
    expect(section.getByText('Answer to: Question B')).toBeTruthy()

    await user.click(screen.getByRole('button', { name: 'Open AI portfolio assistant' }))
    const reopenedDialog = await screen.findByRole('dialog')
    expect(within(reopenedDialog).getByText('Question A')).toBeTruthy()
    expect(within(reopenedDialog).getByText('Question B')).toBeTruthy()

    await user.click(within(reopenedDialog).getByRole('button', { name: 'New conversation' }))
    expect(within(reopenedDialog).queryByText('Question A')).toBeNull()
    expect(within(reopenedDialog).getByRole('button', { name: 'Tell me about Planify.' })).toBeTruthy()

    await user.click(within(reopenedDialog).getByRole('button', { name: 'Close AI assistant' }))
    expect(section.queryByText('Question A')).toBeNull()
    expect(section.getByRole('button', { name: 'Tell me about Planify.' })).toBeTruthy()
    expect(upstream).toHaveBeenCalledTimes(2)
  })

  it('allows only one active request and exposes the same pending state everywhere', async () => {
    let resolveRequest: ((response: Response) => void) | undefined
    const upstream = vi.fn(() => new Promise<Response>((resolve) => {
      resolveRequest = resolve
    }))
    vi.stubGlobal('fetch', upstream)
    const { container } = renderExperience()
    const section = within(container.querySelector('#ai') as HTMLElement)
    const inlineInput = section.getByLabelText('Ask the portfolio assistant')

    fireEvent.change(inlineInput, { target: { value: 'Only send this once' } })
    fireEvent.keyDown(inlineInput, { key: 'Enter', shiftKey: false })
    fireEvent.keyDown(inlineInput, { key: 'Enter', shiftKey: false })
    expect(upstream).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Open AI portfolio assistant' }))
    const dialog = await screen.findByRole('dialog')
    expect(screen.getAllByRole('status')).toHaveLength(2)
    expect(
      (within(dialog).getByLabelText('Ask the portfolio assistant') as HTMLTextAreaElement).disabled,
    ).toBe(true)
    fireEvent.submit(within(dialog).getByLabelText('Ask the portfolio assistant').closest('form')!)
    expect(upstream).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolveRequest?.(successfulResponse('One shared answer'))
    })
    await within(dialog).findByText('One shared answer')
    expect(section.getByText('One shared answer')).toBeTruthy()
  })

  it('shares a safe error and retries only when the visitor asks', async () => {
    const user = userEvent.setup()
    const upstream = vi.fn()
      .mockResolvedValueOnce(new Response(
        JSON.stringify({ code: 'SERVICE_UNAVAILABLE', error: 'private upstream detail' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      ))
      .mockResolvedValueOnce(successfulResponse('Recovered answer'))
    vi.stubGlobal('fetch', upstream)
    const { container } = renderExperience()
    const section = within(container.querySelector('#ai') as HTMLElement)

    await user.type(section.getByLabelText('Ask the portfolio assistant'), 'Try safely')
    await user.keyboard('{Enter}')
    await section.findByText(/temporarily unavailable/i)
    expect(section.queryByText(/private upstream detail/i)).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Open AI portfolio assistant' }))
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/temporarily unavailable/i)).toBeTruthy()
    await user.click(within(dialog).getByRole('button', { name: 'Retry' }))

    await within(dialog).findByText('Recovered answer')
    expect(section.getByText('Recovered answer')).toBeTruthy()
    expect(upstream).toHaveBeenCalledTimes(2)
  })

  it('sends starter prompts through the shared session', async () => {
    const user = userEvent.setup()
    const upstream = vi.fn().mockResolvedValue(successfulResponse('Planify answer'))
    vi.stubGlobal('fetch', upstream)
    const { container } = renderExperience()
    const section = within(container.querySelector('#ai') as HTMLElement)

    await user.click(section.getByRole('button', { name: 'Tell me about Planify.' }))
    await section.findByText('Planify answer')

    const payload = JSON.parse(String(upstream.mock.calls[0][1].body))
    expect(payload.messages.at(-1)).toEqual({
      role: 'user',
      content: 'Tell me about Planify.',
    })

    await user.click(screen.getByRole('button', { name: 'Open AI portfolio assistant' }))
    expect(within(await screen.findByRole('dialog')).getByText('Planify answer')).toBeTruthy()
  })

  it('moves focus into the dialog, contains Tab, closes on Escape, and returns focus', async () => {
    const user = userEvent.setup()
    renderExperience()
    const launcher = screen.getByRole('button', { name: 'Open AI portfolio assistant' })

    await user.click(launcher)
    const dialog = await screen.findByRole('dialog')
    const input = within(dialog).getByLabelText('Ask the portfolio assistant')
    await waitFor(() => expect(document.activeElement).toBe(input))

    await user.tab()
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Close AI assistant' }))

    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    await waitFor(() => {
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'Open AI portfolio assistant' }),
      )
    })
  })
})
