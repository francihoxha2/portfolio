import SectionHeading from '../components/common/SectionHeading.jsx'

export default function PlanifySection({ project }) {
  if (!project) return null

  const externalProps = project.link?.external
    ? { target: '_blank', rel: 'noreferrer' }
    : {}

  return (
    <section id="work" className="portfolio-section flagship-section" aria-labelledby="work-title">
      <div className="page-frame flagship-section__grid">
        <div className="flagship-section__copy">
          <SectionHeading
            eyebrow={project.label}
            title={project.title}
            headingId="work-title"
          >
            {project.description}
          </SectionHeading>
          {project.link ? (
            <a className="text-link text-link--arrow" href={project.link.href} {...externalProps}>
              {project.link.label}
            </a>
          ) : null}
        </div>

        {project.previewImage ? (
          <figure className="flagship-preview">
            <img
              src={project.previewImage}
              alt={project.previewAlt}
              width={project.previewWidth}
              height={project.previewHeight}
              style={{ objectPosition: project.previewPosition }}
            />
          </figure>
        ) : null}
      </div>
    </section>
  )
}
