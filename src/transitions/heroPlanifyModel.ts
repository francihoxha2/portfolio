export type HeroPlanifyPhase =
  | 'active-universe'
  | 'convergence'
  | 'monitor-focus'
  | 'visual-handoff'
  | 'dom-ownership'

export interface TransitionRect {
  left: number
  top: number
  width: number
  height: number
}

export interface HeroPlanifySignals {
  progress: number
  convergence: number
  monitorFocus: number
  sourceRelease: number
  handoff: number
  domOwnership: number
  sceneYield: number
  contentReveal: number
  phase: HeroPlanifyPhase
}

export function clampTransitionProgress(value: number) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0))
}

export function smoothRange(start: number, end: number, value: number) {
  if (end <= start) return value >= end ? 1 : 0
  const bounded = clampTransitionProgress((value - start) / (end - start))
  return bounded * bounded * (3 - 2 * bounded)
}

export function getHeroPlanifyPhase(progress: number): HeroPlanifyPhase {
  const bounded = clampTransitionProgress(progress)
  if (bounded < 0.12) return 'active-universe'
  if (bounded < 0.36) return 'convergence'
  if (bounded < 0.6) return 'monitor-focus'
  if (bounded < 0.9) return 'visual-handoff'
  return 'dom-ownership'
}

export function getHeroPlanifySignals(progress: number): HeroPlanifySignals {
  const bounded = clampTransitionProgress(progress)

  return {
    progress: bounded,
    convergence: smoothRange(0.08, 0.34, bounded),
    monitorFocus: smoothRange(0.2, 0.5, bounded),
    sourceRelease: smoothRange(0.5, 0.62, bounded),
    handoff: smoothRange(0.6, 0.84, bounded),
    domOwnership: smoothRange(0.82, 0.91, bounded),
    sceneYield: smoothRange(0.22, 0.48, bounded),
    contentReveal: smoothRange(0.9, 0.99, bounded),
    phase: getHeroPlanifyPhase(bounded),
  }
}

export function interpolateTransitionRect(
  origin: TransitionRect,
  target: TransitionRect,
  handoffProgress: number,
  viewportScrollY: number,
  sourceTopLimit = 0,
): TransitionRect {
  const progress = clampTransitionProgress(handoffProgress)
  const sourceTop = Math.max(sourceTopLimit, origin.top - viewportScrollY)
  const targetTop = target.top - viewportScrollY

  return {
    left: origin.left + (target.left - origin.left) * progress,
    top: sourceTop + (targetTop - sourceTop) * progress,
    width: origin.width + (target.width - origin.width) * progress,
    height: origin.height + (target.height - origin.height) * progress,
  }
}
