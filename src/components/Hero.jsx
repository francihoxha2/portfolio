const TECH = ['React', 'Next.js', 'Node.js', 'MongoDB', 'Vercel', 'PWA']

function Hero({ profile }) {
  return (
    <section id="about" className="section hero">
      <div className="hero-copy">
        <span className="availability">
          <span className="dot" aria-hidden="true"></span>
          Available for junior &amp; full-stack roles
        </span>

        <h1>
          I build practical <span className="accent">SaaS &amp; booking</span> platforms.
        </h1>

        <div className="hero-identity">
          <strong>{profile.name}</strong>
          <span className="sep" aria-hidden="true"></span>
          <span>{profile.title}</span>
          <span className="sep" aria-hidden="true"></span>
          <span>{profile.location}</span>
        </div>

        <p className="hero-summary">{profile.about}</p>

        <div className="hero-actions">
          <a className="button button-primary" href="#projects">
            View Projects
          </a>
          <a className="button button-secondary" href={profile.cvPath} download>
            Download CV
          </a>
          <a className="button button-ghost" href="#contact">
            Contact Me
          </a>
        </div>

        <div className="hero-tech">
          <p className="hero-tech-label">Core stack</p>
          <div className="tech-badges">
            {TECH.map((tech) => (
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
            <div className="name">{profile.name}</div>
            <div className="role">{profile.title}</div>
          </div>
        </div>

        <div className="aside-stats">
          <div className="aside-stat">
            <strong>2</strong>
            <span>Live web platforms shipped</span>
          </div>
          <div className="aside-stat">
            <strong>Full-stack</strong>
            <span>JavaScript &amp; React focus</span>
          </div>
          <div className="aside-stat">
            <strong>MSc</strong>
            <span>Informatics Engineering</span>
          </div>
          <div className="aside-stat">
            <strong>SaaS</strong>
            <span>Booking &amp; ops workflows</span>
          </div>
        </div>

        <div className="aside-info">
          <div className="aside-info-row">
            <span>Location</span>
            <strong>{profile.location}</strong>
          </div>
          <div className="aside-info-row">
            <span>Email</span>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </div>
          <div className="aside-info-row">
            <span>LinkedIn</span>
            <a href={profile.linkedin} target="_blank" rel="noreferrer">
              View profile
            </a>
          </div>
        </div>
      </aside>
    </section>
  )
}

export default Hero
