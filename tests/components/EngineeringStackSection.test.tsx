// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { portfolio } from '../../shared/portfolio.ts'
// @ts-expect-error The production section remains an incrementally migrated JSX module.
import EngineeringStackSection from '../../src/sections/EngineeringStackSection.jsx'

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

const publishedGroups = portfolio.capabilityGroups
  .filter((group) => group.status === 'published')
  .map((group) => ({
    ...group,
    items: group.items.filter((item) => item.status === 'published'),
  }))

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Phase 6 Engineering System Map', () => {
  it('renders every required group and the exact approved language set in semantic DOM', () => {
    setMedia()
    render(<EngineeringStackSection capabilityGroups={publishedGroups} />)

    const desktop = screen.getByTestId('engineering-desktop-map')
    for (const title of [
      'Frontend',
      'Backend / APIs',
      'Data',
      'Mobile',
      'AI',
      'Engineering / Delivery',
      'Languages',
    ]) {
      expect(within(desktop).getByRole('heading', { name: title })).toBeTruthy()
    }

    const languages = desktop.querySelector('[data-cluster-id="languages"]')!
    expect(
      within(languages as HTMLElement)
        .getAllByRole('button')
        .map((button) => button.textContent),
    ).toEqual(['JavaScript', 'TypeScript', 'Python', 'Java'])
    expect(desktop.textContent).not.toContain('Additional Engineering Language')
  })

  it('updates capability, cluster, related-node, path, and evidence state together', () => {
    setMedia()
    const { container } = render(
      <EngineeringStackSection capabilityGroups={publishedGroups} />,
    )
    const desktop = screen.getByTestId('engineering-desktop-map')

    fireEvent.pointerEnter(within(desktop).getByRole('button', { name: 'React' }))

    const section = container.querySelector<HTMLElement>('#stack')!
    expect(section.dataset.activeCapability).toBe('react')
    expect(section.dataset.activeCluster).toBe('frontend')
    expect(
      desktop.querySelector('[data-cluster-id="frontend"]')?.getAttribute('data-cluster-state'),
    ).toBe('active')
    expect(
      desktop.querySelector('[data-cluster-id="backend"]')?.getAttribute('data-cluster-state'),
    ).toBe('related')
    expect(
      desktop.querySelector('[data-capability-id="javascript"]')?.getAttribute(
        'data-capability-state',
      ),
    ).toBe('related')
    expect(
      desktop.querySelector('[data-path-id="frontend-backend"]')?.getAttribute(
        'data-path-state',
      ),
    ).toBe('active')
    expect(screen.getByRole('heading', { name: 'React', level: 3 })).toBeTruthy()
    expect(
      within(container.querySelector<HTMLElement>('#engineering-system-evidence')!)
        .getByText(/component-based application interfaces/i),
    ).toBeTruthy()
  })

  it('gives keyboard focus the same deterministic state as pointer activation', () => {
    setMedia()
    const { container } = render(
      <EngineeringStackSection capabilityGroups={publishedGroups} />,
    )
    const desktop = screen.getByTestId('engineering-desktop-map')
    const fastApi = within(desktop).getByRole('button', { name: 'FastAPI' })

    fireEvent.focus(fastApi)

    expect(container.querySelector<HTMLElement>('#stack')?.dataset.activeCapability).toBe(
      'fastapi',
    )
    expect(fastApi.getAttribute('aria-pressed')).toBe('true')
    expect(
      desktop.querySelector('[data-path-id="backend-data"]')?.getAttribute('data-path-state'),
    ).toBe('active')
    expect(
      within(container.querySelector<HTMLElement>('#engineering-system-evidence')!)
        .getByText(/Used with Python for API-oriented backend work/i),
    ).toBeTruthy()
  })

  it('supports mobile accordion disclosure and tap-driven evidence', async () => {
    setMedia()
    const user = userEvent.setup()
    const { container } = render(
      <EngineeringStackSection capabilityGroups={publishedGroups} />,
    )
    const mobile = screen.getByTestId('engineering-mobile-map')
    const backendDisclosure = within(mobile).getByRole('button', {
      name: /Backend \/ APIs/,
    })

    await user.click(backendDisclosure)
    expect(backendDisclosure.getAttribute('aria-expanded')).toBe('true')
    await user.click(within(mobile).getByRole('button', { name: 'FastAPI' }))

    expect(container.querySelector<HTMLElement>('#stack')?.dataset.activeCapability).toBe(
      'fastapi',
    )
    expect(screen.getByRole('heading', { name: 'FastAPI', level: 3 })).toBeTruthy()
  })

  it('keeps all evidence in DOM and gives Java equal primary language treatment', () => {
    setMedia()
    const { container } = render(
      <EngineeringStackSection capabilityGroups={publishedGroups} />,
    )
    const desktop = screen.getByTestId('engineering-desktop-map')
    const java = desktop.querySelector<HTMLElement>('[data-capability-id="java"]')!

    expect(java.dataset.prominence).toBe('primary')
    expect(java.textContent).not.toContain('Secondary')
    expect(java.textContent).toMatch(/one of the programming languages in my development toolkit/i)
    expect(container.querySelector('svg')?.textContent).toBe('')

    const evidenceNodes = desktop.querySelectorAll('[id$="-evidence"]')
    expect(evidenceNodes).toHaveLength(publishedGroups.flatMap((group) => group.items).length)
    expect([...evidenceNodes].every((node) => Boolean(node.textContent?.trim()))).toBe(true)
  })

  it('assembles immediately in reduced motion while retaining operable system states', () => {
    setMedia(true)
    const { container } = render(
      <EngineeringStackSection capabilityGroups={publishedGroups} />,
    )
    const section = container.querySelector<HTMLElement>('#stack')!

    expect(section.dataset.motionMode).toBe('reduced')
    expect(section.dataset.assembled).toBe('true')
    fireEvent.click(
      within(screen.getByTestId('engineering-desktop-map')).getByRole('button', {
        name: 'AI integration',
      }),
    )
    expect(section.dataset.activeCapability).toBe('ai-integration')
  })
})
