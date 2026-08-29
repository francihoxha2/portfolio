import { describe, expect, it } from 'vitest'
import {
  resolveSceneQuality,
  selectInitialSceneQuality,
} from '../src/hooks/useSceneQuality.ts'
import { sceneQualityProfiles } from '../src/three/quality/sceneQuality.ts'

describe('hero scene adaptive quality', () => {
  it('uses the bounded full profile for capable desktop signals', () => {
    expect(
      selectInitialSceneQuality('full', {
        deviceMemory: 8,
        hardwareConcurrency: 8,
      }),
    ).toEqual({
      profile: sceneQualityProfiles.full,
      reason: 'capability-full',
    })

    expect(sceneQualityProfiles.full.maxDpr).toBe(1.75)
    expect(sceneQualityProfiles.full.particleCount).toBeLessThanOrEqual(150)
    expect(sceneQualityProfiles.full.flowPulseCount).toBeGreaterThan(
      sceneQualityProfiles.reduced.flowPulseCount,
    )
    expect(sceneQualityProfiles.full.updateRate).toBeGreaterThan(
      sceneQualityProfiles.reduced.updateRate,
    )
  })

  it.each([
    [{ deviceMemory: 4, hardwareConcurrency: 8 }, 'device memory'],
    [{ deviceMemory: 8, hardwareConcurrency: 4 }, 'CPU concurrency'],
  ])('starts reduced for a constrained %s signal', (signals) => {
    expect(selectInitialSceneQuality('full', signals).profile.tier).toBe('reduced')
  })

  it('keeps coarse-pointer requests reduced without pointer parallax or shadows', () => {
    const selection = selectInitialSceneQuality('reduced', {
      deviceMemory: 8,
      hardwareConcurrency: 8,
    })

    expect(selection.profile).toMatchObject({
      tier: 'reduced',
      maxDpr: 1.25,
      shadows: false,
      pointerParallax: false,
      motionScale: 0.42,
      updateRate: 24,
    })
  })

  it('downgrades only toward cheaper tiers and reaches static after severe regression', () => {
    const signals = { deviceMemory: 8, hardwareConcurrency: 8 }

    expect(resolveSceneQuality('full', signals, 0).profile.tier).toBe('full')
    expect(resolveSceneQuality('full', signals, 1)).toMatchObject({
      profile: { tier: 'reduced' },
      reason: 'performance-downgrade',
    })
    expect(resolveSceneQuality('full', signals, 2)).toMatchObject({
      profile: { tier: 'static' },
      reason: 'performance-static',
    })
  })
})
