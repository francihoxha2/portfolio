const narrativeLayers = [
  {
    id: 'interface',
    label: 'Interface',
    description: 'Responsive interfaces and frontend/backend integration.',
    capabilityIds: ['responsive', 'frontend-backend'],
  },
  {
    id: 'application',
    label: 'Application',
    description: 'APIs, authentication, authorization, and application logic.',
    capabilityIds: ['rest', 'authentication', 'authorization', 'business-logic'],
  },
  {
    id: 'data',
    label: 'Data',
    description: 'Database-backed applications and MongoDB.',
    capabilityIds: ['database-apps', 'mongodb'],
  },
  {
    id: 'delivery',
    label: 'Delivery',
    description: 'Testing, debugging, deployment, and production hardening.',
    capabilityIds: ['testing', 'debugging', 'deployment', 'hardening'],
  },
]

function publishedCapabilityIds(capabilityGroups) {
  return new Set(
    capabilityGroups.flatMap((group) =>
      group.items
        .filter((item) => item.status === 'published')
        .map((item) => item.id),
    ),
  )
}

export default function PlanifySection({ project, capabilityGroups = [] }) {
  if (!project) return null

  const externalProps = project.link?.external
    ? { target: '_blank', rel: 'noreferrer' }
    : {}
  const confirmedCapabilities = publishedCapabilityIds(capabilityGroups)
  const visibleLayers = narrativeLayers.filter((layer) =>
    layer.capabilityIds.every((id) => confirmedCapabilities.has(id)),
  )

  return (
    <section
      id="work"
      className="portfolio-section flagship-section"
      aria-labelledby="work-title"
      data-planify-dom-ownership="ready"
    >
      <div className="page-frame flagship-section__inner">
        <header className="flagship-section__intro">
          <div>
            <p className="eyebrow">{project.label}</p>
            <h2 id="work-title">{project.title}</h2>
          </div>
          <div className="flagship-section__positioning">
            <p className="flagship-section__lede">{project.description}</p>
            <p>
              The Developer Universe resolves into a real product interface—the
              abstract system becomes concrete software.
            </p>
            {project.link ? (
              <a
                className="button button--primary flagship-section__cta"
                href={project.link.href}
                {...externalProps}
              >
                {project.link.label}
                {project.link.external ? (
                  <span className="visually-hidden"> (opens in a new tab)</span>
                ) : null}
              </a>
            ) : null}
          </div>
        </header>

        {project.previewImage ? (
          <div className="flagship-product">
            <figure className="planify-browser" data-planify-browser>
              <div className="planify-browser__bar" aria-hidden="true">
                <span />
                <span />
                <span />
                <p>planify.al</p>
                <strong>Product / 01</strong>
              </div>
              <div
                className="planify-browser__screen"
                data-planify-target-screen
              >
                <img
                  src={project.previewImage}
                  alt={project.previewAlt}
                  width={project.previewWidth}
                  height={project.previewHeight}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  style={{ objectPosition: project.previewPosition }}
                />
                <span className="planify-browser__screen-glow" aria-hidden="true" />
              </div>
              <figcaption>
                <span>Actual product interface</span>
                <span>Approved screenshot · 1200 × 628</span>
              </figcaption>
            </figure>

            <aside className="flagship-product__note" aria-label="Product proof">
              <p className="flagship-product__index">01 / Product proof</p>
              <h3>A real interface, kept readable.</h3>
              <p>
                The same approved Planify image travels from the 3D monitor into
                this semantic browser frame, then settles nearly flat for review.
              </p>
            </aside>
          </div>
        ) : null}

        <div className="flagship-story" aria-label="Planify engineering story">
          <div className="flagship-story__statement">
            <p className="flagship-product__index">02 / Engineering lens</p>
            <h3>One product story, viewed through the complete software path.</h3>
            <p>
              Franci’s confirmed portfolio scope connects interface work,
              application logic, data, and delivery. Planify is the flagship
              proof point in that wider engineering practice.
            </p>
          </div>

          <ol className="flagship-system-path">
            {visibleLayers.map((layer, index) => (
              <li key={layer.id} data-planify-layer={layer.id}>
                <span className="flagship-system-path__node" aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h4>{layer.label}</h4>
                  <p>{layer.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="flagship-outcomes">
          <article>
            <p className="flagship-product__index">Problem</p>
            <h3>Turn an idea into one coherent software experience.</h3>
            <p>
              Treat the visible interface and the system behind it as one product,
              not disconnected implementation layers.
            </p>
          </article>
          <article>
            <p className="flagship-product__index">Role</p>
            <h3>Full-Stack Software Developer</h3>
            <p>
              Product-focused development across the path from interface to
              application, data, and delivery.
            </p>
          </article>
          <article>
            <p className="flagship-product__index">Discipline</p>
            <h3>Build, integrate, test, debug, deploy.</h3>
            <p>
              A production-minded workflow that carries software beyond a visual
              concept and toward a dependable release.
            </p>
          </article>
        </div>
      </div>
    </section>
  )
}
