import { describe, expect, it } from 'vitest'
import {
  getArrivalProgress,
  getHeroRecessionProgress,
  getLayerArrivalProgress,
  getSceneLayerTargets,
  normalizePointerCoordinates,
  sampleConnectionPath,
  SceneMotionController,
} from '../src/three/motion/sceneMotion.ts'
import { sceneQualityProfiles } from '../src/three/quality/sceneQuality.ts'

describe('Phase 3B scene motion model', () => {
  it('normalizes only pointers inside the Hero bounds and keeps values bounded', () => {
    const bounds = { left: 100, top: 50, width: 800, height: 400 }

    expect(normalizePointerCoordinates(900, 50, bounds)).toEqual({
      x: 1,
      y: -1,
      active: true,
    })
    expect(normalizePointerCoordinates(40, 220, bounds)).toEqual({
      x: 0,
      y: 0,
      active: false,
    })
  })

  it('gives full-quality depth layers independent bounded responses', () => {
    const targets = getSceneLayerTargets(
      { x: 0.9, y: -0.7, active: true },
      0,
      sceneQualityProfiles.full,
    )
    const layerOffsets = [
      targets.primary.x,
      targets.near.x,
      targets.mid.x,
      targets.far.x,
      targets.data.x,
    ]

    expect(new Set(layerOffsets.map((value) => value.toFixed(4))).size).toBe(5)
    expect(Math.abs(targets.near.x)).toBeGreaterThan(Math.abs(targets.primary.x))
    expect(targets.mid.x).toBeLessThan(0)
    expect(targets.data.x).toBeLessThan(targets.far.x)
    expect(Math.max(...layerOffsets.map(Math.abs))).toBeLessThanOrEqual(0.3)
  })

  it('removes pointer response from the reduced tier while preserving recession', () => {
    const targets = getSceneLayerTargets(
      { x: 1, y: 1, active: true },
      0.75,
      sceneQualityProfiles.reduced,
    )

    expect(targets.primary.x).toBe(0)
    expect(targets.near.rotationY).toBe(0)
    expect(targets.data.rotationX).toBe(0)
    expect(targets.camera.z).toBeLessThan(0)
    expect(targets.near.x).toBeLessThan(0)
    expect(targets.mid.x).toBeGreaterThan(0)
  })

  it('stages assembly before operational idle and advances deterministic ticks', () => {
    expect(getLayerArrivalProgress(0.3, 0, 0.9)).toBeGreaterThan(
      getLayerArrivalProgress(0.3, 0.2, 0.9),
    )
    expect(getArrivalProgress(3, sceneQualityProfiles.full)).toBe(1)

    const controller = new SceneMotionController()
    const before = controller.advance(0.5, false, sceneQualityProfiles.full)
    const after = controller.advance(1.2, true, sceneQualityProfiles.full)
    expect(before.idleTick).toBe(0)
    expect(after.arrivalElapsed).toBeCloseTo(1.2)
    expect(after.operational).toBeGreaterThan(0)
    expect(after.idleTick).toBe(72)
  })

  it('samples meaningful connection routes and bounds initial-scroll recession', () => {
    const route = [
      [0, 0, 0],
      [2, 0, 0],
      [2, 2, 0],
    ] as const

    expect(sampleConnectionPath(route, 0.75)).toEqual([2, 1, 0])
    expect(getHeroRecessionProgress(20, 900, 900)).toBe(0)
    expect(getHeroRecessionProgress(-350, 900, 900)).toBeGreaterThan(0.45)
    expect(getHeroRecessionProgress(-4_000, 900, 900)).toBe(1)
  })
})
