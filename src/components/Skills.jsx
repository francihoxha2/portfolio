const ICONS = {
  frontend: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  ),
  backend: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" />
      <path d="M7 7h.01M7 17h.01" />
    </svg>
  ),
  data: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  ),
  engineering: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 11 19-9-9 19-2-8-8-2z" />
    </svg>
  ),
  mobile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M10 18h4" />
    </svg>
  ),
  ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <circle cx="12" cy="12" r="5" />
      <path d="m8.5 8.5 7 7M15.5 8.5l-7 7" />
    </svg>
  ),
  secondary: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m8 9-3 3 3 3M16 9l3 3-3 3M14 5l-4 14" />
    </svg>
  ),
}

function Skills({ skillGroups, languages }) {
  return (
    <section id="skills" className="section">
      <div className="section-head">
        <p className="eyebrow">Technical Toolkit</p>
        <h2>Skills tied to shipped products</h2>
        <p>
          A reconciled view of the technologies and engineering practices behind
          my web, mobile, backend, data, and AI work.
        </p>
      </div>

      <div className="skills-grid">
        {skillGroups.map((group) => (
          <article key={group.title} className="skill-card">
            <div className="skill-card-head">
              <span className="skill-icon">{ICONS[group.id]}</span>
              <h3>{group.title}</h3>
            </div>
            <div className="chip-list">
              {group.items.map((item) => (
                <span key={item.id} className="chip">
                  {item.label}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      {languages.length > 0 && (
        <div className="skills-foot">
          <div className="langs">
            <span>Languages</span>
            <div className="chip-list">
              {languages.map((language) => (
                <span key={language.id} className="chip">
                  {language.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default Skills
