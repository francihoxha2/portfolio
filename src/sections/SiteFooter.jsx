export default function SiteFooter({ identity, sections }) {
  return (
    <footer className="site-footer">
      <div className="page-frame site-footer__inner">
        <a className="site-footer__brand" href="#top">{identity.name}</a>
        <nav aria-label="Footer navigation">
          {sections.map((section) => (
            <a key={section.id} href={section.href}>{section.label}</a>
          ))}
        </nav>
        <p>{identity.title}</p>
      </div>
    </footer>
  )
}
