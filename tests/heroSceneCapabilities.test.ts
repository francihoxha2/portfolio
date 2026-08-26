import { describe, expect, it } from 'vitest'
import { getHeroSceneCapability } from '../src/components/media/heroSceneCapabilities.ts'

const capableSignals = {
  reducedMotion: false,
  coarsePointer: false,
  saveData: false,
  webGLAvailable: true,
}

describe('hero scene capability contract', () => {
  it('allows the future full scene only when capability signals allow it', () => {
    expect(getHeroSceneCapability(capableSignals)).toEqual({
      tier: 'full',
      reason: 'scene-ready',
      allowsScene: true,
    })
  })

  it.each([
    ['reduced motion', { reducedMotion: true }, 'reduced-motion'],
    ['save data', { saveData: true }, 'save-data'],
    ['unavailable WebGL', { webGLAvailable: false }, 'webgl-unavailable'],
  ])('selects the static tier for %s', (_, overrides, reason) => {
    expect(
      getHeroSceneCapability({ ...capableSignals, ...overrides }),
    ).toEqual({ tier: 'static', reason, allowsScene: false })
  })

  it('uses a reduced future scene for coarse pointers', () => {
    expect(
      getHeroSceneCapability({ ...capableSignals, coarsePointer: true }),
    ).toEqual({
      tier: 'reduced',
      reason: 'coarse-pointer',
      allowsScene: true,
    })
  })
})
