import ProjectCard from './ProjectCard'

function FeaturedProject({ project }) {
  return (
    <article className="featured">
      <div className="featured-media">
        <div className="browser">
          <div className="browser-bar">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="browser-url">{project.link.replace('https://', '')}</span>
          </div>
          <img
            className="browser-shot"
            src={project.previewImage}
            alt={project.previewAlt || `${project.title} dashboard preview`}
            style={
              project.previewPosition
                ? { objectPosition: project.previewPosition }
                : undefined
            }
            loading="lazy"
          />
        </div>
      </div>

      <div className="featured-body">
        <span className="flagship-badge">★ Flagship SaaS Project</span>

        <div className="featured-title-row">
          <h3 style={{ fontSize: '1.7rem' }}>{project.title}</h3>
          <span className="live-pill">
            <span className="dot"></span>
            Live
          </span>
        </div>

        <p className="featured-desc">{project.description}</p>

        {project.highlights?.length > 0 && (
          <ul className="featured-highlights">
            {project.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        )}

        <div className="featured-foot">
          <div className="tag-list">
            {project.stack.map((item) => (
              <span key={item} className="tag">
                {item}
              </span>
            ))}
          </div>
          <a
            className="button button-primary"
            href={project.link}
            target="_blank"
            rel="noreferrer"
          >
            Visit Live Platform
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7 17 17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  )
}

function Projects({ projects }) {
  const featured = projects.find((project) => project.featured)
  const others = projects.filter((project) => project !== featured)

  return (
    <section id="projects" className="section">
      <div className="section-head">
        <p className="eyebrow">Selected Work</p>
        <h2>Real products, not just tutorials</h2>
        <p>
          A focus on practical business platforms — booking systems, role-based
          dashboards, and deployment-ready web products used by real businesses.
        </p>
      </div>

      {featured && <FeaturedProject project={featured} />}

      {others.length > 0 && (
        <>
          <div className="projects-subhead">
            <h3>More projects</h3>
            <span>Booking platforms &amp; web applications</span>
          </div>
          <div className="project-grid">
            {others.map((project) => (
              <ProjectCard
                key={project.title}
                title={project.title}
                description={project.description}
                link={project.link}
                category={project.category}
                stack={project.stack}
                highlights={project.highlights}
                previewImage={project.previewImage}
                previewAlt={project.previewAlt}
                previewPosition={project.previewPosition}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default Projects
