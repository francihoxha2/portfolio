import { useState } from 'react'

function Navbar({ identity, sections, cvPath }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="site-header">
      <nav className="navbar">
        <a className="brand" href="#about" onClick={closeMenu} aria-label={`${identity.name} — home`}>
          <span className="brand-mark">FH</span>
          <span className="brand-text">
            <span className="brand-name">{identity.name}</span>
            <span className="brand-role">{identity.title}</span>
          </span>
        </a>

        <button
          type="button"
          className={`menu-toggle ${isMenuOpen ? 'is-open' : ''}`}
          onClick={() => setIsMenuOpen((current) => !current)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className={`nav-panel ${isMenuOpen ? 'open' : ''}`}>
          <div className="nav-links">
            {sections.map((section) => (
              <a key={section.href} href={section.href} onClick={closeMenu}>
                {section.label}
              </a>
            ))}
          </div>
          <a
            className="nav-cta"
            href={cvPath}
            download
            onClick={closeMenu}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m7 11 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
            Download CV
          </a>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
