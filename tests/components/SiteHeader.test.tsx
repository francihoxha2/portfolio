// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import SiteHeader from '../../src/components/navigation/SiteHeader.tsx'
import type { NavigationItem, PortfolioIdentity } from '../../shared/portfolio.types.ts'

const identity: PortfolioIdentity = {
  name: 'Franci Hoxha',
  title: 'Full-Stack Software Developer',
  heroStatement: 'Building modern software experiences, from idea to production.',
  capabilityLine: 'Web • Mobile • Backend • AI',
  summary: 'Portfolio summary',
}

const sections: NavigationItem[] = [
  { id: 'work', label: 'Work', href: '#work', status: 'published' },
  { id: 'stack', label: 'Stack', href: '#stack', status: 'published' },
]

afterEach(cleanup)

describe('SiteHeader keyboard behavior', () => {
  it('opens the mobile menu with correct state and deliberate initial focus', async () => {
    const user = userEvent.setup()
    render(<SiteHeader identity={identity} sections={sections} cvPath="/cv.pdf" />)

    const toggle = screen.getByRole('button', { name: 'Open navigation menu' })
    await user.click(toggle)

    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(toggle.getAttribute('aria-controls')).toBe('mobile-navigation')
    expect(screen.getByRole('navigation', { name: 'Mobile navigation' })).toBeTruthy()
    expect(document.activeElement).toBe(
      screen.getAllByRole('link', { name: 'Work' })[1],
    )
  })

  it('closes on Escape and returns focus to the menu button', async () => {
    const user = userEvent.setup()
    render(<SiteHeader identity={identity} sections={sections} cvPath="/cv.pdf" />)

    const toggle = screen.getByRole('button', { name: 'Open navigation menu' })
    await user.click(toggle)
    await user.keyboard('{Escape}')

    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(toggle)
  })

  it('closes on an outside pointer interaction', async () => {
    const user = userEvent.setup()
    render(<SiteHeader identity={identity} sections={sections} cvPath="/cv.pdf" />)

    const toggle = screen.getByRole('button', { name: 'Open navigation menu' })
    await user.click(toggle)
    await user.click(document.body)

    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    expect(document.getElementById('mobile-navigation')?.hidden).toBe(true)
  })
})
