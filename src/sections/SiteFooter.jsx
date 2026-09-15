export default function SiteFooter({ identity, sections }) {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="page-frame site-footer__inner">
        <a
          className="site-footer__brand"
          href="#top"
          aria-label={`${identity.name} — back to the top of the page`}
        >
          {identity.name}
          <span className="site-footer__brand-arrow" aria-hidden="true">↑</span>
        </a>

        <nav aria-label="Footer navigation">
          {sections.map((section) => (
            <a key={section.id} href={section.href}>{section.label}</a>
          ))}
        </nav>

        <p className="site-footer__meta">
          <span>{identity.title}</span>
          <span className="site-footer__copyright">
            © {year} {identity.name}
          </span>
        </p>
      </div>
    </footer>
  )
}
