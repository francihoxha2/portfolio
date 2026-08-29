// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { portfolio } from '../../shared/portfolio.ts'
// @ts-expect-error The production section remains an incrementally migrated JSX module.
import SelectedWorkSection from '../../src/sections/SelectedWorkSection.jsx'

function createMediaQuery(matches: boolean, media: string): MediaQueryList {
  return {
    matches,
    media,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }
}

function setMedia({ fine = false, reduced = false } = {}) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) =>
      createMediaQuery(
        query.includes('prefers-reduced-motion') ? reduced : fine,
        query,
      ),
    ),
  )
}

const selectedProjects = portfolio.projects.filter((project) => !project.featured)

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Phase 5 selected work', () => {
  it('renders both canonical projects and honest visual provenance', () => {
    setMedia()
    const { container } = render(<SelectedWorkSection projects={selectedProjects} />)

    expect(screen.getByRole('heading', { name: 'BarberSpot.al' })).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Online Charging Station Management System' }),
    ).toBeTruthy()
    expect(screen.getAllByText('Abstract composition - not product UI')).toHaveLength(2)
    expect(container.textContent).not.toMatch(
      /appointments?|customers?|payments?|analytics|real-time|IoT|hardware|maps?/i,
    )
  })

  it('keeps external and internal project actions semantically distinct', () => {
    setMedia()
    render(<SelectedWorkSection projects={selectedProjects} />)

    const barberSpotLink = screen.getByRole('link', {
      name: /View BarberSpot.*opens in a new tab/,
    })
    expect(barberSpotLink.getAttribute('href')).toBe('https://barberspot.al')
    expect(barberSpotLink.getAttribute('target')).toBe('_blank')
    expect(barberSpotLink.getAttribute('rel')).toContain('noreferrer')

    const chargingLink = screen.getByRole('link', { name: 'Discuss the project' })
    expect(chargingLink.getAttribute('href')).toBe('#contact')
    expect(chargingLink.hasAttribute('target')).toBe(false)
  })

  it('provides a stable keyboard-operated evidence view', async () => {
    setMedia()
    const user = userEvent.setup()
    render(<SelectedWorkSection projects={selectedProjects} />)

    const inspectButton = screen.getAllByRole('button', { name: 'Inspect evidence' })[0]
    inspectButton.focus()
    await user.keyboard('{Enter}')

    expect(inspectButton.getAttribute('aria-pressed')).toBe('true')
    expect(inspectButton.closest('article')?.dataset.evidenceState).toBe('revealed')
    expect(screen.getAllByText('External project site')).toHaveLength(1)
  })

  it('disables pointer tracking on coarse pointers while preserving tap disclosure', async () => {
    setMedia({ fine: false })
    const user = userEvent.setup()
    const { container } = render(<SelectedWorkSection projects={selectedProjects} />)
    const article = container.querySelector<HTMLElement>('[data-project-id="barberspot"]')!

    await waitFor(() => expect(article.dataset.pointerMode).toBe('coarse'))
    fireEvent.pointerMove(article, { clientX: 120, clientY: 80 })
    expect(article.style.getPropertyValue('--selected-x')).toBe('')

    await user.click(screen.getAllByRole('button', { name: 'Inspect evidence' })[0])
    expect(article.dataset.evidenceState).toBe('revealed')
  })

  it('uses the immediate reduced-motion composition without pointer transforms', async () => {
    setMedia({ fine: true, reduced: true })
    const { container } = render(<SelectedWorkSection projects={selectedProjects} />)
    const section = container.querySelector<HTMLElement>('#selected-work')!
    const article = container.querySelector<HTMLElement>('[data-project-id="barberspot"]')!

    await waitFor(() => expect(section.dataset.motionMode).toBe('reduced'))
    expect(article.dataset.pointerMode).toBe('reduced')
    expect(article.dataset.revealed).toBe('true')
    fireEvent.pointerMove(article, { clientX: 120, clientY: 80 })
    expect(article.style.getPropertyValue('--selected-x')).toBe('')
  })

  it('falls back to the abstract visual when a future project image fails', () => {
    setMedia()
    const projectWithBrokenImage = {
      ...selectedProjects[0],
      previewImage: '/missing-project-image.png',
      previewAlt: 'Approved BarberSpot project view',
      previewWidth: 1200,
      previewHeight: 800,
    }
    render(<SelectedWorkSection projects={[projectWithBrokenImage]} />)

    fireEvent.error(screen.getByRole('img', { name: 'Approved BarberSpot project view' }))

    expect(screen.queryByRole('img', { name: 'Approved BarberSpot project view' })).toBeNull()
    expect(screen.getByText('Abstract composition - not product UI')).toBeTruthy()
  })
})
