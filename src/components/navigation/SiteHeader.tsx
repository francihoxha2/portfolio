import { useEffect, useRef, useState } from 'react'
import type { NavigationItem, PortfolioIdentity } from '../../../shared/portfolio.types.ts'

interface SiteHeaderProps {
  identity: PortfolioIdentity
  sections: NavigationItem[]
  cvPath: string
}

export default function SiteHeader({
  identity,
  sections,
  cvPath,
}: SiteHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (isOpen) firstLinkRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    function closeFromKeyboard(event: KeyboardEvent) {
      if (event.key !== 'Escape' || !isOpen) return

      setIsOpen(false)
      toggleRef.current?.focus()
    }

    function closeFromOutside(event: PointerEvent) {
      if (!isOpen || headerRef.current?.contains(event.target as Node)) return
      setIsOpen(false)
    }

    document.addEventListener('keydown', closeFromKeyboard)
    document.addEventListener('pointerdown', closeFromOutside)

    return () => {
      document.removeEventListener('keydown', closeFromKeyboard)
      document.removeEventListener('pointerdown', closeFromOutside)
    }
  }, [isOpen])

  function closeMenu() {
    setIsOpen(false)
  }

  const navLinks = (mobile = false) =>
    sections.map((section, index) => (
      <a
        key={section.id}
        ref={mobile && index === 0 ? firstLinkRef : undefined}
        className="site-nav__link"
        href={section.href}
        onClick={closeMenu}
      >
        {section.label}
      </a>
    ))

  return (
    <header ref={headerRef} className="site-header">
      <div className="site-header__inner page-frame">
        <a
          className="site-brand"
          href="#top"
          aria-label={`${identity.name}, back to top`}
          onClick={closeMenu}
        >
          <span className="site-brand__mark" aria-hidden="true">FH</span>
          <span className="site-brand__name">{identity.name}</span>
        </a>

        <nav className="site-nav site-nav--desktop" aria-label="Primary navigation">
          {navLinks()}
          <a className="button button--quiet site-nav__cv" href={cvPath} download>
            Download CV
          </a>
        </nav>

        <button
          ref={toggleRef}
          className="menu-toggle"
          type="button"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setIsOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <nav
          id="mobile-navigation"
          className="site-nav site-nav--mobile"
          aria-label="Mobile navigation"
          hidden={!isOpen}
        >
          {navLinks(true)}
          <a className="button button--quiet site-nav__cv" href={cvPath} download onClick={closeMenu}>
            Download CV
          </a>
        </nav>
      </div>
    </header>
  )
}
