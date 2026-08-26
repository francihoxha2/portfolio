import SectionHeading from '../components/common/SectionHeading.jsx'

export default function SelectedWorkSection({ projects }) {
  return (
    <section
      id="selected-work"
      className="portfolio-section selected-work-section"
      aria-labelledby="selected-work-title"
    >
      <div className="page-frame">
        <SectionHeading
          eyebrow="Selected Work"
          title="More software projects"
          headingId="selected-work-title"
        >
          A focused selection of additional software work.
        </SectionHeading>

        <div className="selected-work-list">
          {projects.map((project, index) => {
            const externalProps = project.link?.external
              ? { target: '_blank', rel: 'noreferrer' }
              : {}

            return (
              <article className="selected-work-item" key={project.id}>
                <p className="selected-work-item__index" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <div>
                  <p className="eyebrow">{project.category}</p>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
                {project.link ? (
                  <a className="text-link text-link--arrow" href={project.link.href} {...externalProps}>
                    {project.link.label}
                  </a>
                ) : null}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
