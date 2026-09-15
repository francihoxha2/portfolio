// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { portfolio } from '../../shared/portfolio.ts'
// @ts-expect-error The production sections remain incrementally migrated JSX modules.
import ContactSection from '../../src/sections/ContactSection.jsx'
// @ts-expect-error The production sections remain incrementally migrated JSX modules.
import SiteFooter from '../../src/sections/SiteFooter.jsx'

const publicContacts = portfolio.contact.filter(
  (channel) => channel.public && channel.status === 'published',
)
const cvPath = portfolio.assets.find((asset) => asset.id === 'cv')?.src

function renderContact() {
  return render(
    <ContactSection
      contacts={publicContacts}
      narrative={portfolio.contactNarrative}
      cvPath={cvPath}
    />,
  )
}

afterEach(cleanup)

describe('Phase 9 contact section', () => {
  it('closes the page with the approved calm invitation', () => {
    renderContact()

    const heading = screen.getByRole('heading', { level: 2, name: /Let’s build something useful\./ })
    expect(heading.getAttribute('id')).toBe('contact-title')
    expect(document.querySelector('#contact')).toBeTruthy()
  })

  it('offers email, LinkedIn, and the CV as the confirmed routes', () => {
    renderContact()

    expect(screen.getByRole('link', { name: 'Email me' }).getAttribute('href')).toBe(
      'mailto:francihoxha@yahoo.com',
    )

    const cv = screen.getByRole('link', { name: 'Download CV' })
    expect(cv.getAttribute('href')).toBe('/Franci-Hoxha-CV.pdf')
    expect(cv.hasAttribute('download')).toBe(true)

    const linkedin = screen.getByRole('link', { name: 'View profile' })
    expect(linkedin.getAttribute('target')).toBe('_blank')
    expect(linkedin.getAttribute('rel')).toBe('noreferrer')
  })

  it('publishes no phone number and no availability or response-time claim', () => {
    const { container } = renderContact()
    const text = container.textContent ?? ''

    expect(container.querySelector('a[href^="tel:"]')).toBeNull()
    expect(text).not.toMatch(/\+355/)
    expect(text).not.toMatch(/replies|response time|available for|open to/i)
  })
})

describe('Phase 9 site footer', () => {
  it('returns the brand to the top and repeats the public sections', () => {
    render(
      <SiteFooter
        identity={portfolio.identity}
        sections={portfolio.navigation.filter((item) => item.status === 'published')}
      />,
    )

    const footer = screen.getByRole('contentinfo')
    const brand = within(footer).getByRole('link', { name: /back to the top/i })
    expect(brand.getAttribute('href')).toBe('#top')

    const navigation = within(footer).getByRole('navigation', { name: 'Footer navigation' })
    expect(within(navigation).getAllByRole('link')).toHaveLength(
      portfolio.navigation.filter((item) => item.status === 'published').length,
    )

    expect(footer.textContent).toContain(portfolio.identity.title)
    expect(footer.textContent).toContain(String(new Date().getFullYear()))
  })
})
