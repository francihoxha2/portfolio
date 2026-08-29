import type { SceneQualityProfile } from '../quality/sceneQuality.ts'

export interface ScenePointerState {
  x: number
  y: number
  active: boolean
}

export interface SceneMotionRuntime {
  readonly pointer: ScenePointerState
  readonly recession: number
  readonly arrivalElapsed: number
  readonly arrival: number
  readonly operational: number
  readonly idleTick: number
}

export interface SceneLayerTargets {
  primary: { x: number; y: number; rotationX: number; rotationY: number }
  near: { x: number; y: number; rotationX: number; rotationY: number }
  mid: { x: number; y: number; rotationX: number; rotationY: number }
  far: { x: number; y: number; rotationX: number; rotationY: number }
  data: { x: number; y: number; rotationX: number; rotationY: number }
  camera: { x: number; y: number; z: number; lookAtX: number; lookAtY: number }
}

export interface SceneMotionDiagnostics {
  pointerActive: boolean
  pointerX: number
  pointerY: number
  arrival: number
  operational: number
  idleTick: number
  recession: number
  primaryX: number
  nearX: number
  midX: number
  farX: number
  dataX: number
}

export interface PointerBounds {
  left: number
  top: number
  width: number
  height: number
}

export const sceneMotionTiming = {
  fullArrivalDuration: 2.05,
  reducedArrivalDuration: 1.05,
  operationalDelay: 0.82,
  operationalRamp: 0.8,
} as const

export const createSceneMotionRuntime = (): SceneMotionRuntime => ({
  pointer: { x: 0, y: 0, active: false },
  recession: 0,
  arrivalElapsed: 0,
  arrival: 0,
  operational: 0,
  idleTick: 0,
})

export class SceneMotionController {
  private runtime: SceneMotionRuntime = createSceneMotionRuntime()

  read(): SceneMotionRuntime {
    return this.runtime
  }

  setPointer(pointer: ScenePointerState) {
    this.runtime = { ...this.runtime, pointer }
  }

  setRecession(recession: number) {
    this.runtime = { ...this.runtime, recession: clampUnit(recession) }
  }

  advance(delta: number, started: boolean, quality: SceneQualityProfile) {
    const arrivalElapsed = this.runtime.arrivalElapsed + (started ? delta : 0)
    this.runtime = {
      ...this.runtime,
      arrivalElapsed,
      arrival: getArrivalProgress(arrivalElapsed, quality),
      operational: getOperationalProgress(arrivalElapsed),
      idleTick: Math.floor(arrivalElapsed * quality.updateRate),
    }
    return this.runtime
  }
}

export function clampUnit(value: number) {
  return Math.max(0, Math.min(1, value))
}

export function smoothstep(value: number) {
  const bounded = clampUnit(value)
  return bounded * bounded * (3 - 2 * bounded)
}

export function normalizePointerCoordinates(
  clientX: number,
  clientY: number,
  bounds: PointerBounds,
): ScenePointerState {
  if (
    bounds.width <= 0 ||
    bounds.height <= 0 ||
    clientX < bounds.left ||
    clientX > bounds.left + bounds.width ||
    clientY < bounds.top ||
    clientY > bounds.top + bounds.height
  ) {
    return { x: 0, y: 0, active: false }
  }

  return {
    x: Math.max(-1, Math.min(1, ((clientX - bounds.left) / bounds.width) * 2 - 1)),
    y: Math.max(-1, Math.min(1, ((clientY - bounds.top) / bounds.height) * 2 - 1)),
    active: true,
  }
}

export function getHeroRecessionProgress(
  heroTop: number,
  heroHeight: number,
  viewportHeight: number,
) {
  if (heroHeight <= 0 || viewportHeight <= 0) return 0
  const travel = Math.max(1, Math.min(heroHeight * 0.72, viewportHeight * 0.78))
  return smoothstep(-heroTop / travel)
}

export function getArrivalProgress(
  elapsed: number,
  quality: SceneQualityProfile,
) {
  const duration = quality.tier === 'full'
    ? sceneMotionTiming.fullArrivalDuration
    : sceneMotionTiming.reducedArrivalDuration
  return smoothstep(elapsed / duration)
}

export function getLayerArrivalProgress(
  arrivalElapsed: number,
  delay: number,
  duration: number,
) {
  return smoothstep((arrivalElapsed - delay) / duration)
}

export function getOperationalProgress(elapsed: number) {
  return smoothstep(
    (elapsed - sceneMotionTiming.operationalDelay) /
      sceneMotionTiming.operationalRamp,
  )
}

function shapePointer(value: number) {
  if (value === 0) return 0
  return Math.sign(value) * Math.pow(Math.abs(value), 1.14)
}

export function getSceneLayerTargets(
  pointer: ScenePointerState,
  recession: number,
  quality: SceneQualityProfile,
): SceneLayerTargets {
  const pointerEnabled = quality.pointerParallax && pointer.active
  const x = pointerEnabled ? shapePointer(pointer.x) : 0
  const y = pointerEnabled ? shapePointer(pointer.y) : 0
  const recede = clampUnit(recession)

  return {
    primary: {
      x: x * 0.075,
      y: -y * 0.045 - recede * 0.06,
      rotationX: -y * 0.012,
      rotationY: x * 0.018,
    },
    near: {
      x: x * 0.26 - recede * 0.34,
      y: -y * 0.13 + recede * 0.08,
      rotationX: -y * 0.04,
      rotationY: x * 0.062,
    },
    mid: {
      x: -x * 0.14 + recede * 0.28,
      y: y * 0.075 + recede * 0.035,
      rotationX: y * 0.022,
      rotationY: -x * 0.034,
    },
    far: {
      x: -x * 0.21 + recede * 0.16,
      y: y * 0.1 + recede * 0.1,
      rotationX: y * 0.012,
      rotationY: -x * 0.022,
    },
    data: {
      x: -x * 0.3 + recede * 0.2,
      y: y * 0.15 + recede * 0.12,
      rotationX: y * 0.018,
      rotationY: -x * 0.028,
    },
    camera: {
      x: x * 0.22,
      y: -y * 0.14,
      z: -recede * 0.38 - Math.abs(x) * 0.035,
      lookAtX: x * 0.12,
      lookAtY: -y * 0.07 - recede * 0.035,
    },
  }
}

export function sampleConnectionPath(
  points: ReadonlyArray<readonly [number, number, number]>,
  progress: number,
): readonly [number, number, number] {
  if (points.length === 0) return [0, 0, 0]
  if (points.length === 1) return points[0]

  const boundedProgress = clampUnit(progress)
  const segmentLengths = points.slice(1).map((point, index) => {
    const previous = points[index]
    return Math.hypot(
      point[0] - previous[0],
      point[1] - previous[1],
      point[2] - previous[2],
    )
  })
  const totalLength = segmentLengths.reduce((total, length) => total + length, 0)
  if (totalLength === 0) return points[0]

  let remaining = boundedProgress * totalLength
  for (let index = 0; index < segmentLengths.length; index += 1) {
    const segmentLength = segmentLengths[index]
    if (remaining <= segmentLength || index === segmentLengths.length - 1) {
      const start = points[index]
      const end = points[index + 1]
      const segmentProgress = segmentLength === 0 ? 0 : remaining / segmentLength
      return [
        start[0] + (end[0] - start[0]) * segmentProgress,
        start[1] + (end[1] - start[1]) * segmentProgress,
        start[2] + (end[2] - start[2]) * segmentProgress,
      ]
    }
    remaining -= segmentLength
  }

  return points[points.length - 1]
}
