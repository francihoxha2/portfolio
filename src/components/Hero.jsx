function Hero({ identity, contacts, cvPath, featuredTechnologies }) {
  const capabilityAreas = identity.capabilityLine.split(' • ')

  return (
    <section id="about" className="section hero">
      <div className="hero-copy">
        <span className="availability">
          <span className="dot" aria-hidden="true"></span>
          {identity.title}
        </span>

        <h1>
          Building modern software experiences,{' '}
          <span className="accent">from idea to production.</span>
        </h1>

        <div className="hero-identity">
          <strong>{identity.name}</strong>
          <span className="sep" aria-hidden="true"></span>
          <span>{identity.capabilityLine}</span>
          {contacts.location && (
            <>
              <span className="sep" aria-hidden="true"></span>
              <span>{contacts.location.value}</span>
            </>
          )}
        </div>

        <p className="hero-summary">{identity.summary}</p>

        <div className="hero-actions">
          <a className="button button-primary" href="#projects">
            Explore My Work
          </a>
          <a className="button button-secondary" href={cvPath} download>
            Download CV
          </a>
          <a className="button button-ghost" href="#contact">
            Contact Me
          </a>
        </div>

        <div className="hero-tech">
          <p className="hero-tech-label">Core stack</p>
          <div className="tech-badges">
            {featuredTechnologies.map((tech) => (
              <span key={tech} className="tech-badge">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>

      <aside className="hero-aside" aria-label="Profile summary">
        <div className="aside-head">
          <span className="aside-avatar">FH</span>
          <div>
            <div className="name">{identity.name}</div>
            <div className="role">{identity.title}</div>
          </div>
        </div>

        <div className="aside-stats">
          {capabilityAreas.map((area) => (
            <div className="aside-stat" key={area}>
              <strong>{area}</strong>
              <span>Software capability</span>
            </div>
          ))}
        </div>

        <div className="aside-info">
          {contacts.location && (
            <div className="aside-info-row">
              <span>{contacts.location.label}</span>
              <strong>{contacts.location.value}</strong>
            </div>
          )}
          {contacts.email && (
            <div className="aside-info-row">
              <span>{contacts.email.label}</span>
              <a href={contacts.email.href}>{contacts.email.value}</a>
            </div>
          )}
          {contacts.linkedin && (
            <div className="aside-info-row">
              <span>{contacts.linkedin.label}</span>
              <a href={contacts.linkedin.href} target="_blank" rel="noreferrer">
                {contacts.linkedin.value}
              </a>
            </div>
          )}
        </div>
      </aside>
    </section>
  )
}

export default Hero
