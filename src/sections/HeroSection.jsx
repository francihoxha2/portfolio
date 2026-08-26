export default function HeroSection({ identity, cvPath }) {
  return (
    <section id="top" className="portfolio-section hero-section" aria-labelledby="hero-title">
      <div className="page-frame hero-section__inner">
        <p className="eyebrow">{identity.name} · {identity.title}</p>
        <h1 id="hero-title">{identity.heroStatement}</h1>
        <p className="hero-section__capabilities">{identity.capabilityLine}</p>
        <p className="hero-section__summary">{identity.summary}</p>
        <div className="hero-section__actions" aria-label="Portfolio actions">
          <a className="button button--primary" href="#work">Explore My Work</a>
          <a className="button button--secondary" href="#ai">Ask My AI</a>
          <a className="text-link" href={cvPath} download>Download CV</a>
        </div>
      </div>
    </section>
  )
}
