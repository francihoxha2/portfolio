import { useCallback, useEffect, useRef, useState } from 'react'
import SectionHeading from '../components/common/SectionHeading.jsx'
import { useReducedMotion } from '../hooks/useReducedMotion.ts'

const finePointerQuery = '(hover: hover) and (pointer: fine)'

function useFinePointer() {
  const [hasFinePointer, setHasFinePointer] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(finePointerQuery)
    const updatePointer = () => setHasFinePointer(mediaQuery.matches)

    updatePointer()
    mediaQuery.addEventListener('change', updatePointer)

    return () => mediaQuery.removeEventListener('change', updatePointer)
  }, [])

  return hasFinePointer
}

function useSectionEntrance(sectionRef, prefersReducedMotion) {
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return undefined

    const targets = Array.from(section.querySelectorAll('[data-selected-reveal]'))
    const revealAll = () => {
      targets.forEach((target) => {
        target.dataset.revealed = 'true'
      })
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealAll()
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.dataset.revealed = 'true'
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.16 },
    )

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [prefersReducedMotion, sectionRef])
}

function BarberSpotVisual({ project }) {
  return (
    <div className="selected-project__abstract selected-project__abstract--barberspot">
      <div className="barberspot-surface" aria-hidden="true">
        <div className="barberspot-surface__bar">
          <span />
          <span />
          <span />
          <p>barberspot.al</p>
        </div>
        <div className="barberspot-surface__body">
          <span className="barberspot-surface__monogram">B</span>
          <div className="barberspot-surface__identity">
            <span>Selected work / 02</span>
            <strong>{project.title}</strong>
            <small>{project.category}</small>
          </div>
          <div className="barberspot-surface__lines">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
      <div className="barberspot-surface__signal" aria-hidden="true">
        <span>Project website</span>
        <strong>barberspot.al</strong>
      </div>
    </div>
  )
}

function ChargingStationVisual({ project }) {
  return (
    <div className="selected-project__abstract selected-project__abstract--charging">
      <svg
        className="charging-map__connections"
        viewBox="0 0 760 500"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <path d="M 104 250 C 218 250 216 134 342 134" />
        <path d="M 104 250 C 218 250 216 366 342 366" />
        <path d="M 454 134 C 568 134 552 250 666 250" />
        <path d="M 454 366 C 568 366 552 250 666 250" />
        <circle cx="104" cy="250" r="4" />
        <circle cx="342" cy="134" r="4" />
        <circle cx="342" cy="366" r="4" />
        <circle cx="666" cy="250" r="4" />
      </svg>
      <div className="charging-map__node charging-map__node--source" aria-hidden="true">
        <span>Project</span>
        <strong>Online</strong>
      </div>
      <div className="charging-map__node charging-map__node--station" aria-hidden="true">
        <span>Focus</span>
        <strong>Charging station</strong>
      </div>
      <div className="charging-map__node charging-map__node--management" aria-hidden="true">
        <span>System</span>
        <strong>Management</strong>
      </div>
      <div className="charging-map__node charging-map__node--record" aria-hidden="true">
        <span>Selected work / 03</span>
        <strong>{project.category}</strong>
      </div>
    </div>
  )
}

function AbstractProjectVisual({ project }) {
  return project.id === 'charging-station' ? (
    <ChargingStationVisual project={project} />
  ) : (
    <BarberSpotVisual project={project} />
  )
}

function ProjectVisual({ project }) {
  const [imageFailed, setImageFailed] = useState(false)
  const hasUsableImage = Boolean(project.previewImage && project.previewAlt && !imageFailed)

  return (
    <figure className="selected-project__figure">
      <div className="selected-project__visual-frame">
        {hasUsableImage ? (
          <img
            className="selected-project__image"
            src={project.previewImage}
            alt={project.previewAlt}
            width={project.previewWidth}
            height={project.previewHeight}
            loading="lazy"
            decoding="async"
            style={{ objectPosition: project.previewPosition }}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <AbstractProjectVisual project={project} />
        )}
        <span className="selected-project__light" aria-hidden="true" />
        <div className="selected-project__evidence" aria-label="Published project evidence">
          <p>Evidence view</p>
          <dl>
            <div>
              <dt>Type</dt>
              <dd>{project.category}</dd>
            </div>
            <div>
              <dt>Access</dt>
              <dd>{project.link?.external ? 'External project site' : 'Portfolio contact route'}</dd>
            </div>
            <div>
              <dt>Visual</dt>
              <dd>{hasUsableImage ? 'Project image' : 'Abstract system composition'}</dd>
            </div>
          </dl>
        </div>
      </div>
      <figcaption>
        <span>{hasUsableImage ? 'Project image' : 'Evidence-led project visual'}</span>
        <span>{hasUsableImage ? 'Published asset' : 'Abstract composition - not product UI'}</span>
      </figcaption>
    </figure>
  )
}

function SelectedProjectStory({ project, index, prefersReducedMotion }) {
  const articleRef = useRef(null)
  const motionRef = useRef({
    currentX: 0,
    currentY: 0,
    targetX: 0,
    targetY: 0,
    frame: 0,
  })
  const [hovered, setHovered] = useState(false)
  const [evidencePinned, setEvidencePinned] = useState(false)
  const hasFinePointer = useFinePointer()
  const canTrackPointer = hasFinePointer && !prefersReducedMotion
  const evidenceVisible = hovered || evidencePinned
  const evidenceId = `${project.id}-evidence-note`

  const updateMotion = useCallback(function stepMotion() {
    const motion = motionRef.current
    const element = articleRef.current
    if (!element) {
      motion.frame = 0
      return
    }

    motion.currentX += (motion.targetX - motion.currentX) * 0.13
    motion.currentY += (motion.targetY - motion.currentY) * 0.13
    element.style.setProperty('--selected-x', motion.currentX.toFixed(4))
    element.style.setProperty('--selected-y', motion.currentY.toFixed(4))
    element.style.setProperty('--selected-light-x', `${50 + motion.currentX * 24}%`)
    element.style.setProperty('--selected-light-y', `${48 + motion.currentY * 20}%`)

    const stillMoving =
      Math.abs(motion.targetX - motion.currentX) > 0.002 ||
      Math.abs(motion.targetY - motion.currentY) > 0.002

    motion.frame = stillMoving ? window.requestAnimationFrame(stepMotion) : 0
  }, [])

  const scheduleMotion = useCallback(() => {
    if (!motionRef.current.frame) {
      motionRef.current.frame = window.requestAnimationFrame(updateMotion)
    }
  }, [updateMotion])

  const resetMotion = useCallback(() => {
    motionRef.current.targetX = 0
    motionRef.current.targetY = 0
    scheduleMotion()
  }, [scheduleMotion])

  useEffect(() => () => {
    if (motionRef.current.frame) window.cancelAnimationFrame(motionRef.current.frame)
  }, [])

  function handlePointerEnter() {
    if (!canTrackPointer) return
    setHovered(true)
  }

  function handlePointerMove(event) {
    if (!canTrackPointer) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const normalizedX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
    const normalizedY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
    motionRef.current.targetX = Math.max(-1, Math.min(1, normalizedX))
    motionRef.current.targetY = Math.max(-1, Math.min(1, normalizedY))
    scheduleMotion()
  }

  function handlePointerLeave() {
    setHovered(false)
    resetMotion()
  }

  const externalProps = project.link?.external
    ? { target: '_blank', rel: 'noreferrer' }
    : {}

  return (
    <article
      ref={articleRef}
      className={`selected-project selected-project--${project.id}`}
      data-selected-reveal
      data-project-id={project.id}
      data-pointer-mode={prefersReducedMotion ? 'reduced' : hasFinePointer ? 'fine' : 'coarse'}
      data-evidence-state={evidenceVisible ? 'revealed' : 'summary'}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="selected-project__content">
        <header>
          <div className="selected-project__record">
            <span>{String(index + 2).padStart(2, '0')}</span>
            <span>Selected project</span>
          </div>
          <p className="eyebrow">{project.category}</p>
          <h3>{project.title}</h3>
          <p className="selected-project__description">{project.description}</p>
        </header>

        <div className="selected-project__actions">
          <button
            className="selected-project__inspect"
            type="button"
            aria-pressed={evidencePinned}
            aria-describedby={evidenceId}
            onClick={() => setEvidencePinned((current) => !current)}
          >
            <span>{evidencePinned ? 'Evidence view on' : 'Inspect evidence'}</span>
            <span className="selected-project__inspect-icon" aria-hidden="true" />
          </button>

          {project.link ? (
            <a
              className="selected-project__link"
              href={project.link.href}
              {...externalProps}
            >
              {project.link.label}
              <span aria-hidden="true">{project.link.external ? '\u2197' : '\u2198'}</span>
              {project.link.external ? (
                <span className="visually-hidden"> (opens in a new tab)</span>
              ) : null}
            </a>
          ) : null}
        </div>

        <p id={evidenceId} className="selected-project__integrity-note">
          Only confirmed project identity and link information are shown. The visual is
          abstract unless a published project image is available.
        </p>
      </div>

      <div className="selected-project__visual-stage">
        <ProjectVisual project={project} />
      </div>
    </article>
  )
}

export default function SelectedWorkSection({ projects }) {
  const sectionRef = useRef(null)
  const prefersReducedMotion = useReducedMotion()
  useSectionEntrance(sectionRef, prefersReducedMotion)

  return (
    <section
      ref={sectionRef}
      id="selected-work"
      className="portfolio-section selected-work-section"
      aria-labelledby="selected-work-title"
      data-motion-mode={prefersReducedMotion ? 'reduced' : 'standard'}
    >
      <div className="page-frame selected-work-section__inner">
        <div data-selected-reveal>
          <SectionHeading
            eyebrow="Selected Work"
            title="Two quieter project stories"
            headingId="selected-work-title"
          >
            Additional software work, presented with the same evidence discipline and a
            deliberately lighter interaction footprint than the flagship.
          </SectionHeading>
        </div>

        <div className="selected-work-list">
          {projects.map((project, index) => (
            <SelectedProjectStory
              key={project.id}
              project={project}
              index={index}
              prefersReducedMotion={prefersReducedMotion}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
