import { useEffect, useRef } from 'react'
import HeroSection from './HeroSection.jsx'
import PlanifySection from './PlanifySection.jsx'

export default function HeroPlanifyStory({ identity, cvPath, project, capabilityGroups }) {
  const controllerRef = useRef(null)

  useEffect(() => {
    const root = controllerRef.current?.closest('.page-content')
    if (!root || !project?.previewImage) return undefined

    root.classList.add('hero-planify-story')
    root.dataset.transitionProgress = '0.0000'
    root.dataset.transitionPhase = 'active-universe'

    let disposed = false
    let destroyTransition
    let anchorFrame = 0
    let restoreAnchorFrame = 0
    let previousAnchorScrollBehavior

    const loadTransition = async () => {
      if (root.dataset.transitionModule === 'loading' || destroyTransition) return
      root.dataset.transitionModule = 'loading'

      try {
        const { createHeroPlanifyTransition } = await import(
          '../transitions/heroPlanifyTransition.ts'
        )
        if (disposed) return
        destroyTransition = createHeroPlanifyTransition(root)

        if (window.location.hash === '#work') {
          anchorFrame = window.requestAnimationFrame(() => {
            const target = root.querySelector('#work')
            const documentElement = document.documentElement
            previousAnchorScrollBehavior = documentElement.style.scrollBehavior
            documentElement.style.scrollBehavior = 'auto'
            target?.scrollIntoView({ block: 'start' })
            restoreAnchorFrame = window.requestAnimationFrame(() => {
              documentElement.style.scrollBehavior = previousAnchorScrollBehavior
              previousAnchorScrollBehavior = undefined
            })
          })
        }
      } catch {
        if (!disposed) root.dataset.transitionModule = 'unavailable'
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        void loadTransition()
      },
      { rootMargin: '45% 0px' },
    )

    observer.observe(root)

    return () => {
      disposed = true
      observer.disconnect()
      window.cancelAnimationFrame(anchorFrame)
      window.cancelAnimationFrame(restoreAnchorFrame)
      if (previousAnchorScrollBehavior !== undefined) {
        document.documentElement.style.scrollBehavior = previousAnchorScrollBehavior
      }
      destroyTransition?.()
      delete root.dataset.transitionModule
      root.classList.remove('hero-planify-story')
    }
  }, [project?.previewImage])

  return (
    <>
      <HeroSection identity={identity} cvPath={cvPath} />

      <div ref={controllerRef} className="hero-planify-controller">
        {project?.previewImage ? (
          <div
            className="planify-handoff-frame"
            data-planify-handoff-frame
            aria-hidden="true"
          >
            <img
              src={project.previewImage}
              alt=""
              width={project.previewWidth}
              height={project.previewHeight}
              decoding="async"
              draggable="false"
            />
            <span className="planify-handoff-frame__sheen" />
          </div>
        ) : null}
      </div>

      <PlanifySection
        project={project}
        capabilityGroups={capabilityGroups}
      />
    </>
  )
}
