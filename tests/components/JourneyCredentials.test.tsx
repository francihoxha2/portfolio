// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { portfolio } from '../../shared/portfolio.ts'
import type { Credential } from '../../shared/portfolio.types.ts'
// @ts-expect-error The production sections remain incrementally migrated JSX modules.
import CredentialsSection from '../../src/sections/CredentialsSection.jsx'
// @ts-expect-error The production sections remain incrementally migrated JSX modules.
import JourneySection from '../../src/sections/JourneySection.jsx'

function setMedia(reduced = false) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reduced : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  )
}

function availableCredential(): Credential {
  return {
    ...structuredClone(portfolio.credentials[0]),
    asset: {
      id: 'credential-software-engineering',
      status: 'available',
      src: '/certificates/software-engineering-build-better-software.jpg',
      alt: 'Software engineering course certificate',
      width: 1600,
      height: 1131,
    },
  }
}

beforeEach(() => {
  setMedia()
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value() {
      this.setAttribute('open', '')
    },
  })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value() {
      this.removeAttribute('open')
    },
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  document.body.style.overflow = ''
  document.getElementById('root')?.remove()
})

describe('Phase 7 Journey', () => {
  it('renders the canonical progression in chronological semantic order', () => {
    render(
      <JourneySection
        journey={portfolio.journey}
        narrative={portfolio.journeyNarrative}
      />,
    )

    const list = screen.getByRole('list', { name: 'Professional progression' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(4)
    expect(within(list).getAllByRole('heading').map((heading) => heading.textContent)).toEqual([
      'Master’s degree in Business Administration',
      'Computer Technician & IT Support',
      'Master of Science in Informatics Engineering',
      'Building software as a product',
    ])
    expect(list.textContent).toContain('Completed July 2026')
    expect(list.textContent).not.toMatch(/currently studying|2024\s*[-–]\s*present/i)
  })

  it('updates the active narrative stage from the viewport observer', () => {
    let observerCallback: IntersectionObserverCallback | undefined
    class ObserverStub {
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback
      }
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() { return [] }
      root = null
      rootMargin = ''
      thresholds = []
    }
    vi.stubGlobal('IntersectionObserver', ObserverStub)

    const { container } = render(
      <JourneySection
        journey={portfolio.journey}
        narrative={portfolio.journeyNarrative}
      />,
    )
    const systemsStage = container.querySelector<HTMLElement>('[data-stage-index="1"]')!

    act(() => {
      observerCallback?.([
        {
          isIntersecting: true,
          target: systemsStage,
          boundingClientRect: { top: 300 } as DOMRectReadOnly,
        } as unknown as IntersectionObserverEntry,
      ], {} as IntersectionObserver)
    })

    expect(container.querySelector('#journey')?.getAttribute('data-active-stage')).toBe(
      'systems',
    )
    expect(systemsStage.getAttribute('data-stage-state')).toBe('active')
  })

  it('keeps every stage revealed when reduced motion is requested', () => {
    setMedia(true)
    const { container } = render(
      <JourneySection
        journey={portfolio.journey}
        narrative={portfolio.journeyNarrative}
      />,
    )

    expect(container.querySelector('#journey')?.getAttribute('data-motion-mode')).toBe(
      'reduced',
    )
    for (const stage of container.querySelectorAll('[data-stage-index]')) {
      expect(stage.getAttribute('data-revealed')).toBe('true')
    }
  })
})

describe('Phase 7 Credentials', () => {
  it('renders exactly the canonical title, provider, instructor, date, and duration set', () => {
    render(
      <CredentialsSection
        credentials={portfolio.credentials}
        narrative={portfolio.credentialsNarrative}
      />,
    )

    const list = screen.getByRole('list', { name: 'Selected credentials' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(3)
    expect(list.textContent).toContain('23 June 2026')
    expect(list.textContent).toContain('Ligency, Ed Donner')
    expect(list.textContent).toContain('8.5 hours')
    expect(screen.queryByRole('link', { name: /verify/i })).toBeNull()
    expect(screen.getAllByRole('button', { name: /view certificate/i })).toHaveLength(3)
    expect(within(list).getAllByRole('img', { name: /Certificate preview/i })).toHaveLength(3)
  })

  it('opens the real-image dialog, moves focus, closes on Escape, and returns focus', async () => {
    const user = userEvent.setup()
    const root = document.createElement('div')
    root.id = 'root'
    document.body.append(root)
    render(
      <CredentialsSection
        credentials={[availableCredential()]}
        narrative={portfolio.credentialsNarrative}
      />,
      { container: root },
    )

    const trigger = screen.getByRole('button', {
      name: /View certificate: Complete Software Engineering Course/i,
    })
    await user.click(trigger)

    const dialog = screen.getByRole('dialog')
    expect(dialog.hasAttribute('open')).toBe(true)
    expect(root.inert).toBe(true)
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Close certificate viewer' }),
    )
    expect(within(dialog).getByRole('img').getAttribute('src')).toBe(
      '/certificates/software-engineering-build-better-software.jpg',
    )
    expect(
      within(dialog).getByRole('link', { name: /Open original image/ }).getAttribute('href'),
    ).toBe(
      '/certificates/software-engineering-build-better-software.jpg',
    )

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(root.inert).toBe(false)
    expect(document.activeElement).toBe(trigger)
  })

  it('keeps credential metadata and an original-image route if preview loading fails', async () => {
    const user = userEvent.setup()
    render(
      <CredentialsSection
        credentials={[availableCredential()]}
        narrative={portfolio.credentialsNarrative}
      />,
    )
    await user.click(screen.getByRole('button', { name: /View certificate:/i }))
    fireEvent.error(screen.getByRole('img', { name: /Certificate for/i }))

    const dialog = screen.getByRole('dialog')
    expect(screen.getByRole('status').textContent).toMatch(/could not be displayed/i)
    expect(
      within(dialog).getByRole('heading', { name: /Complete Software Engineering Course/i }),
    ).toBeTruthy()
    expect(within(dialog).getByRole('link', { name: /Open original image/ })).toBeTruthy()
  })
})
