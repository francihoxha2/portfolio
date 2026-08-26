function Education({ journey }) {
  const education = journey.filter((item) => item.kind === 'education')
  const experience = journey.filter((item) => item.kind === 'experience')

  return (
    <section id="education" className="section">
      <div className="section-head">
        <p className="eyebrow">Background</p>
        <h2>Business, IT support, and software — by design</h2>
        <p>
          A path that connects business education, hands-on IT support, a completed
          Master&rsquo;s degree, and practical software development.
        </p>
      </div>

      <div className="timeline-grid">
        <div className="timeline-col">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--primary-bright)' }}>
              <path d="M22 10 12 5 2 10l10 5 10-5Z" />
              <path d="M6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5" />
            </svg>
            Education
          </h3>
          <div className="timeline">
            {education.map((item) => (
              <article key={item.title} className="timeline-item">
                {item.period && <span className="timeline-period">{item.period}</span>}
                <h4>{item.title}</h4>
                {item.organization && <p className="org">{item.organization}</p>}
                {item.location && <p>{item.location}</p>}
                {item.description && <p>{item.description}</p>}
              </article>
            ))}
          </div>
        </div>

        <div className="timeline-col">
          <h3>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--primary-bright)' }}>
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            Experience
          </h3>
          <div className="timeline">
            {experience.map((item) => (
              <article key={item.title} className="timeline-item">
                {item.period && <span className="timeline-period">{item.period}</span>}
                <h4>{item.title}</h4>
                {item.organization && <p className="org">{item.organization}</p>}
                {item.description && <p>{item.description}</p>}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Education
