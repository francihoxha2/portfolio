import { describe, expect, it } from 'vitest'
import {
  clampTransitionProgress,
  getHeroPlanifyPhase,
  getHeroPlanifySignals,
  interpolateTransitionRect,
} from '../src/transitions/heroPlanifyModel.ts'

describe('Phase 4 Hero-to-Planify transition model', () => {
  it('keeps the authoritative progress bounded and phases ordered', () => {
    expect(clampTransitionProgress(-4)).toBe(0)
    expect(clampTransitionProgress(4)).toBe(1)
    expect(clampTransitionProgress(Number.NaN)).toBe(0)

    expect([
      getHeroPlanifyPhase(0),
      getHeroPlanifyPhase(0.2),
      getHeroPlanifyPhase(0.45),
      getHeroPlanifyPhase(0.7),
      getHeroPlanifyPhase(1),
    ]).toEqual([
      'active-universe',
      'convergence',
      'monitor-focus',
      'visual-handoff',
      'dom-ownership',
    ])
  })

  it('derives every coordinated state monotonically from that progress', () => {
    const samples = [0, 0.2, 0.4, 0.6, 0.8, 1].map(getHeroPlanifySignals)
    const signalNames = [
      'convergence',
      'monitorFocus',
      'sourceRelease',
      'handoff',
      'domOwnership',
      'sceneYield',
      'contentReveal',
    ] as const

    signalNames.forEach((signalName) => {
      const values = samples.map((sample) => sample[signalName])
      expect(values.every((value) => value >= 0 && value <= 1)).toBe(true)
      expect(values.every((value, index) => index === 0 || value >= values[index - 1])).toBe(true)
    })

    expect(getHeroPlanifySignals(0.34).convergence).toBe(1)
    expect(getHeroPlanifySignals(0.5).monitorFocus).toBe(1)
    expect(getHeroPlanifySignals(0.58).handoff).toBe(0)
    expect(getHeroPlanifySignals(0.58).sourceRelease).toBeGreaterThan(0.7)
    expect(getHeroPlanifySignals(0.82).domOwnership).toBe(0)
    expect(getHeroPlanifySignals(0.84).handoff).toBe(1)
    expect(getHeroPlanifySignals(0.91).domOwnership).toBe(1)
    expect(getHeroPlanifySignals(0.91).contentReveal).toBeLessThan(0.1)
    expect(samples.at(-1)?.domOwnership).toBe(1)
    expect(samples.at(-1)?.contentReveal).toBe(1)
  })

  it('moves the shared screenshot between measured document rectangles', () => {
    const origin = { left: 820, top: 240, width: 420, height: 220 }
    const target = { left: 120, top: 1_080, width: 920, height: 482 }

    expect(interpolateTransitionRect(origin, target, 0, 0)).toEqual(origin)
    expect(interpolateTransitionRect(origin, target, 1, 900)).toEqual({
      left: 120,
      top: 180,
      width: 920,
      height: 482,
    })

    expect(interpolateTransitionRect(origin, target, 0, 450, 72).top).toBe(72)

    const midpoint = interpolateTransitionRect(origin, target, 0.5, 450, 72)
    expect(midpoint.left).toBeGreaterThan(target.left)
    expect(midpoint.left).toBeLessThan(origin.left)
    expect(midpoint.width).toBeGreaterThan(origin.width)
    expect(midpoint.width).toBeLessThan(target.width)
    expect(midpoint.top).toBe(351)
  })
})
