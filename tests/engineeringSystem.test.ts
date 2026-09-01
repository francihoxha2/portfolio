import { describe, expect, it } from 'vitest'
import { portfolio } from '../shared/portfolio.ts'
import {
  createEngineeringSystem,
  getEngineeringSystemState,
} from '../src/data/engineeringSystem.ts'

const publishedGroups = portfolio.capabilityGroups
  .filter((group) => group.status === 'published')
  .map((group) => ({
    ...group,
    items: group.items.filter((item) => item.status === 'published'),
  }))

describe('Phase 6 engineering system model', () => {
  it('derives the complete node inventory from canonical portfolio data', () => {
    const system = createEngineeringSystem(publishedGroups)

    expect(system.groups).toHaveLength(7)
    expect(system.capabilities).toHaveLength(
      publishedGroups.flatMap((group) => group.items).length,
    )
    expect(system.capabilities.every((capability) => capability.evidence)).toBe(true)
    expect(new Set(system.paths.map((path) => path.id)).size).toBe(system.paths.length)
  })

  it('propagates React through frontend, the core relationship, backend, and languages', () => {
    const state = getEngineeringSystemState('react', publishedGroups)

    expect(state.activeCapability?.label).toBe('React')
    expect([...state.activeClusterIds]).toEqual(['frontend', 'backend', 'languages'])
    expect([...state.activePathIds]).toEqual([
      'frontend-core',
      'frontend-backend',
      'languages-frontend',
    ])
    expect(state.relatedCapabilityIds).toEqual(
      new Set([
        'javascript',
        'typescript',
        'responsive',
        'frontend-backend',
        'node-api',
        'rest',
        'python',
      ]),
    )
  })

  it('propagates FastAPI through Python, backend, data, and the Full-Stack core', () => {
    const state = getEngineeringSystemState('fastapi', publishedGroups)

    expect([...state.activeClusterIds]).toEqual(['backend', 'data', 'languages'])
    expect(state.activePathIds).toEqual(
      new Set(['backend-core', 'backend-data', 'languages-backend']),
    )
    expect(state.relatedCapabilityIds).toEqual(
      new Set([
        'python',
        'rest',
        'database-apps',
        'node-api',
        'mongodb',
        'javascript',
        'typescript',
      ]),
    )
  })

  it('keeps Java primary within Languages without inventing unrelated system links', () => {
    const state = getEngineeringSystemState('java', publishedGroups)

    expect(state.activeCapability).toMatchObject({
      label: 'Java',
      prominence: 'primary',
    })
    expect([...state.activeClusterIds]).toEqual(['languages'])
    expect([...state.activePathIds]).toEqual(['languages-core'])
    expect(state.activeCapability?.evidence).toBe(
      'I use Java as one of the programming languages in my development toolkit.',
    )
  })

  it('returns the stable system overview for an unknown or cleared capability', () => {
    const state = getEngineeringSystemState(null, publishedGroups)

    expect(state.activeCapability).toBeNull()
    expect(state.activeClusterIds.size).toBe(0)
    expect(state.activePathIds.size).toBe(0)
    expect(state.relationship).toMatch(/interface, services, data, mobile, AI/i)
  })
})
