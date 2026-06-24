function Footer({ profile, sections = [] }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="brand-mark">FH</span>
          <span>{profile.name}</span>
        </div>

        {sections.length > 0 && (
          <nav className="footer-links" aria-label="Footer">
            {sections.map((section) => (
              <a key={section.href} href={section.href}>
                {section.label}
              </a>
            ))}
          </nav>
        )}

        <p className="footer-meta">&copy; {new Date().getFullYear()} {profile.name} · Built with React</p>
      </div>
    </footer>
  )
}

export default Footer
