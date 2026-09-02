import { useEffect, useRef, useState } from 'react'
import SectionHeading from '../components/common/SectionHeading.jsx'
import { useReducedMotion } from '../hooks/useReducedMotion.ts'

function getStageState(index, activeIndex) {
  if (index < activeIndex) return 'passed'
  if (index === activeIndex) return 'active'
  return 'upcoming'
}

export default function JourneySection({ journey, narrative }) {
  const prefersReducedMotion = useReducedMotion()
  const stageRefs = useRef([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [revealedCount, setRevealedCount] = useState(1)

  useEffect(() => {
    if (
      prefersReducedMotion
      || typeof window === 'undefined'
      || !('IntersectionObserver' in window)
    ) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => {
            const readingLine = window.innerHeight * 0.43
            return (
              Math.abs(left.boundingClientRect.top - readingLine)
              - Math.abs(right.boundingClientRect.top - readingLine)
            )
          })

        if (visibleEntries.length === 0) return

        const index = Number(visibleEntries[0].target.getAttribute('data-stage-index'))
        setActiveIndex(index)
        setRevealedCount((current) => Math.max(current, index + 1))
      },
      {
        rootMargin: '-28% 0px -43% 0px',
        threshold: [0, 0.15, 0.45, 0.8],
      },
    )

    stageRefs.current.forEach((stage) => {
      if (stage) observer.observe(stage)
    })

    return () => observer.disconnect()
  }, [journey.length, prefersReducedMotion])

  const usesStaticProgression =
    prefersReducedMotion
    || typeof window === 'undefined'
    || !('IntersectionObserver' in window)
  const renderedActiveIndex = usesStaticProgression
    ? Math.max(0, journey.length - 1)
    : activeIndex
  const renderedRevealedCount = usesStaticProgression ? journey.length : revealedCount
  const progress = journey.length > 1
    ? renderedActiveIndex / (journey.length - 1)
    : 1

  return (
    <section
      id="journey"
      className="portfolio-section journey-section"
      aria-labelledby="journey-title"
      data-active-stage={journey[renderedActiveIndex]?.stage}
      data-motion-mode={prefersReducedMotion ? 'reduced' : 'enhanced'}
      style={{ '--journey-progress': progress }}
    >
      <div className="page-frame journey-section__inner">
        <div className="journey-section__heading">
          <SectionHeading
            eyebrow="Journey"
            title={narrative.title}
            headingId="journey-title"
          >
            {narrative.introduction}
          </SectionHeading>

          <div className="journey-section__route" aria-hidden="true">
            <span>Context</span>
            <span>Systems</span>
            <span>Engineering</span>
            <span>Product</span>
          </div>
        </div>

        <div className="journey-path-frame">
          <span className="journey-path__rail" aria-hidden="true">
            <span className="journey-path__progress" />
          </span>

          <ol className="journey-path" aria-label="Professional progression">
            {journey.map((entry, index) => {
              const stageState = getStageState(index, renderedActiveIndex)
              const isRevealed = index < renderedRevealedCount

              return (
                <li
                  className="journey-stage"
                  data-journey-stage={entry.stage}
                  data-stage-index={index}
                  data-stage-state={stageState}
                  data-revealed={isRevealed ? 'true' : 'false'}
                  key={entry.id}
                  ref={(element) => {
                    stageRefs.current[index] = element
                  }}
                >
                  <div className="journey-stage__marker" aria-hidden="true">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  </div>

                  <article className="journey-stage__content">
                    <header className="journey-stage__header">
                      <p className="eyebrow">{entry.stageLabel}</p>
                      {entry.period ? (
                        <p className="journey-stage__period">{entry.period}</p>
                      ) : null}
                    </header>
                    <h3>{entry.title}</h3>
                    {entry.description ? <p>{entry.description}</p> : null}
                    {entry.bridge ? (
                      <p className="journey-stage__bridge">
                        <span aria-hidden="true">→</span>
                        {entry.bridge}
                      </p>
                    ) : null}
                  </article>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
