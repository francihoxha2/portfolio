const ICONS = {
  Frontend: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  ),
  Backend: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <rect x="3" y="14" width="18" height="6" rx="1.5" />
      <path d="M7 7h.01M7 17h.01" />
    </svg>
  ),
  'Databases & Tools': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
      <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
    </svg>
  ),
  'Product & Delivery': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 11 19-9-9 19-2-8-8-2z" />
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
          These are the tools and practices behind my live platforms — full-stack
          JavaScript, responsive interfaces, backend logic, and database-driven apps.
        </p>
      </div>

      <div className="skills-grid">
        {skillGroups.map((group) => (
          <article key={group.title} className="skill-card">
            <div className="skill-card-head">
              <span className="skill-icon">{ICONS[group.title]}</span>
              <h3>{group.title}</h3>
            </div>
            <div className="chip-list">
              {group.items.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <div className="skills-foot">
        <p>
          Clear communication matters as much as clean code when working on teams
          and client-facing products.
        </p>
        <div className="langs">
          <span>Languages</span>
          <div className="chip-list">
            {languages.map((language) => (
              <span key={language} className="chip">
                {language}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Skills
