import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  getHeroPlanifySignals,
  interpolateTransitionRect,
  type TransitionRect,
} from './heroPlanifyModel.ts'

type TransitionMode = 'cinematic' | 'simplified' | 'reduced'

interface Geometry {
  origin: TransitionRect
  target: TransitionRect
  sourceTopLimit: number
}

interface MatchConditions {
  motion?: boolean
  wide?: boolean
  fine?: boolean
  reduced?: boolean
}

const transitionEventName = 'portfolio:hero-planify-progress'
const triggerId = 'hero-planify-handoff'

gsap.registerPlugin(ScrollTrigger)

function documentRect(element: HTMLElement): TransitionRect {
  const bounds = element.getBoundingClientRect()
  return {
    left: bounds.left,
    top: bounds.top + window.scrollY,
    width: bounds.width,
    height: bounds.height,
  }
}

function format(value: number) {
  return value.toFixed(4)
}

function clearTransitionStyles(root: HTMLElement, overlay: HTMLElement) {
  ;[
    '--planify-transition',
    '--planify-convergence',
    '--planify-monitor-focus',
    '--planify-source-release',
    '--planify-handoff',
    '--planify-dom-ownership',
    '--planify-scene-yield',
    '--planify-content-reveal',
  ].forEach((property) => root.style.removeProperty(property))
  overlay.removeAttribute('style')
}

function applyProgress(
  root: HTMLElement,
  overlay: HTMLElement,
  geometry: Geometry | null,
  progress: number,
  mode: TransitionMode,
  previousProgress: number,
) {
  const signals = getHeroPlanifySignals(progress)
  const slot = root.querySelector<HTMLElement>('.hero-scene-slot')

  root.dataset.transitionProgress = format(signals.progress)
  root.dataset.transitionPhase = signals.phase
  root.dataset.transitionDirection = signals.progress >= previousProgress ? 'forward' : 'reverse'
  root.dataset.transitionMode = mode
  root.style.setProperty('--planify-transition', format(signals.progress))
  root.style.setProperty('--planify-convergence', format(signals.convergence))
  root.style.setProperty('--planify-monitor-focus', format(signals.monitorFocus))
  root.style.setProperty('--planify-source-release', format(signals.sourceRelease))
  root.style.setProperty('--planify-handoff', format(signals.handoff))
  root.style.setProperty('--planify-dom-ownership', format(signals.domOwnership))
  root.style.setProperty('--planify-scene-yield', format(signals.sceneYield))
  root.style.setProperty('--planify-content-reveal', format(signals.contentReveal))

  if (slot) {
    slot.dataset.transitionProgress = format(signals.progress)
    slot.dataset.transitionPhase = signals.phase
    slot.dataset.transitionConvergence = format(signals.convergence)
    slot.dataset.transitionMonitorFocus = format(signals.monitorFocus)
    slot.dataset.transitionSourceRelease = format(signals.sourceRelease)
    slot.dataset.transitionHandoff = format(signals.handoff)
    slot.dataset.transitionDomOwnership = format(signals.domOwnership)
    slot.dataset.transitionContentReveal = format(signals.contentReveal)
  }

  if (mode === 'cinematic' && geometry) {
    const frame = interpolateTransitionRect(
      geometry.origin,
      geometry.target,
      signals.handoff,
      window.scrollY,
      geometry.sourceTopLimit,
    )
    overlay.style.setProperty('--handoff-left', `${frame.left.toFixed(2)}px`)
    overlay.style.setProperty('--handoff-top', `${frame.top.toFixed(2)}px`)
    overlay.style.setProperty('--handoff-width', `${frame.width.toFixed(2)}px`)
    overlay.style.setProperty('--handoff-height', `${frame.height.toFixed(2)}px`)
    overlay.style.setProperty('--handoff-rotation', `${((1 - signals.handoff) * -4.5).toFixed(2)}deg`)
  }

  window.dispatchEvent(new CustomEvent(transitionEventName, {
    detail: { ...signals, mode },
  }))
}

export function createHeroPlanifyTransition(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>('.hero-section')
  const origin = root.querySelector<HTMLElement>('[data-planify-origin-screen]')
  const target = root.querySelector<HTMLElement>('[data-planify-target-screen]')
  const overlay = root.querySelector<HTMLElement>('[data-planify-handoff-frame]')

  if (!hero || !origin || !target || !overlay) {
    throw new Error('The Hero-to-Planify transition landmarks are incomplete.')
  }

  let geometry: Geometry | null = null
  let refreshCount = 0
  let cancelled = false

  const measure = () => {
    const header = document.querySelector<HTMLElement>('.site-header')
    geometry = {
      origin: documentRect(origin),
      target: documentRect(target),
      sourceTopLimit: header?.getBoundingClientRect().bottom ?? 0,
    }
    refreshCount += 1
    root.dataset.transitionRefreshCount = String(refreshCount)
    root.dataset.transitionGeometry = [
      geometry.origin.width,
      geometry.origin.height,
      geometry.target.width,
      geometry.target.height,
    ].map((value) => Math.round(value)).join(':')
  }

  const media = gsap.matchMedia()

  media.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      wide: '(min-width: 56.01rem)',
      fine: '(pointer: fine)',
      reduced: '(prefers-reduced-motion: reduce)',
    },
    (context) => {
      const conditions = (context.conditions ?? {}) as MatchConditions
      const mode: TransitionMode = conditions.reduced
        ? 'reduced'
        : conditions.motion && conditions.wide && conditions.fine
          ? 'cinematic'
          : 'simplified'

      root.dataset.transitionMode = mode

      if (mode === 'reduced') {
        root.dataset.transitionModule = 'ready'
        root.dataset.transitionBypassed = 'true'
        delete root.dataset.transitionEnhanced
        measure()
        applyProgress(root, overlay, geometry, 0, mode, 0)

        return () => {
          clearTransitionStyles(root, overlay)
          delete root.dataset.transitionBypassed
        }
      }

      root.dataset.transitionEnhanced = 'true'
      delete root.dataset.transitionBypassed
      measure()
      let previousProgress = 0
      let trigger: ScrollTrigger | null = null

      const animationContext = gsap.context(() => {
        ScrollTrigger.getById(triggerId)?.kill()
        trigger = ScrollTrigger.create({
          id: triggerId,
          trigger: hero,
          start: () => {
            const header = document.querySelector<HTMLElement>('.site-header')
            return `top top+=${Math.round(header?.getBoundingClientRect().height ?? 0)}`
          },
          end: () => {
            const header = document.querySelector<HTMLElement>('.site-header')
            const headerHeight = header?.getBoundingClientRect().height ?? 0
            const distance = mode === 'cinematic'
              ? Math.min(
                  window.innerHeight * 0.96,
                  Math.max(
                    window.innerHeight * 0.72,
                    hero.getBoundingClientRect().height - headerHeight - 16,
                  ),
                )
              : window.innerHeight * 0.82
            root.dataset.transitionDistance = String(Math.round(distance))
            return `+=${Math.round(distance)}`
          },
          scrub: true,
          invalidateOnRefresh: true,
          onRefreshInit: measure,
          onRefresh: (self) => {
            applyProgress(root, overlay, geometry, self.progress, mode, previousProgress)
            previousProgress = self.progress
          },
          onUpdate: (self) => {
            applyProgress(root, overlay, geometry, self.progress, mode, previousProgress)
            previousProgress = self.progress
          },
        })
      }, root)

      root.dataset.transitionTriggerCount = String(
        ScrollTrigger.getAll().filter((item) => item.vars.id === triggerId).length,
      )
      applyProgress(root, overlay, geometry, trigger?.progress ?? 0, mode, previousProgress)
      root.dataset.transitionModule = 'ready'

      const image = target.querySelector<HTMLImageElement>('img')
      const fontsReady = document.fonts?.ready ?? Promise.resolve()
      const imageReady = image?.decode().catch(() => undefined) ?? Promise.resolve()
      void Promise.all([fontsReady, imageReady]).then(() => {
        if (!cancelled) ScrollTrigger.refresh()
      })

      return () => {
        animationContext.revert()
        clearTransitionStyles(root, overlay)
        delete root.dataset.transitionEnhanced
        delete root.dataset.transitionTriggerCount
        delete root.dataset.transitionDistance
      }
    },
  )

  return () => {
    cancelled = true
    media.revert()
    clearTransitionStyles(root, overlay)
    delete root.dataset.transitionEnhanced
    delete root.dataset.transitionBypassed
    delete root.dataset.transitionTriggerCount
    delete root.dataset.transitionDistance
  }
}
