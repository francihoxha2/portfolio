// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import HeroSceneBoundary from '../../src/components/media/HeroSceneBoundary.tsx'
import HeroSceneSlot from '../../src/components/media/HeroSceneSlot.tsx'
import {
  OPEN_PORTFOLIO_ASSISTANT_EVENT,
  useAssistantLauncher,
} from '../../src/hooks/useAssistantLauncher.ts'

function createMediaQuery(matches: boolean): MediaQueryList {
  return {
    matches,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }
}

beforeEach(() => {
  vi.stubGlobal('matchMedia', vi.fn(() => createMediaQuery(false)))
  vi.stubGlobal('WebGLRenderingContext', class WebGLRenderingContext {})
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Phase 2 hero foundation', () => {
  it('renders the static composition without a canvas', () => {
    const { container } = render(<HeroSceneSlot />)

    expect(screen.getByTestId('hero-static-fallback')).toBeTruthy()
    expect(container.querySelector('canvas')).toBeNull()
    expect(container.querySelector('.hero-scene-slot')?.getAttribute('data-scene-mode'))
      .toBe('fallback')
  })

  it('publishes the assistant-open request from a keyboard-accessible button', async () => {
    const user = userEvent.setup()
    const openListener = vi.fn()
    const LauncherHarness = () => {
      const openAssistant = useAssistantLauncher()
      return <button onClick={openAssistant}>Ask My AI</button>
    }
    window.addEventListener(OPEN_PORTFOLIO_ASSISTANT_EVENT, openListener)
    render(<LauncherHarness />)

    const launcher = screen.getByRole('button', { name: 'Ask My AI' })
    await user.click(launcher)

    expect(openListener).toHaveBeenCalledTimes(1)
    window.removeEventListener(OPEN_PORTFOLIO_ASSISTANT_EVENT, openListener)
  })

  it('uses the static fallback when a future scene child errors', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const BrokenScene = () => {
      throw new Error('scene failed')
    }

    render(
      <HeroSceneBoundary fallback={<div>Static scene</div>}>
        <BrokenScene />
      </HeroSceneBoundary>,
    )

    expect(screen.getByText('Static scene')).toBeTruthy()
    expect(errorSpy).toHaveBeenCalled()
  })
})
