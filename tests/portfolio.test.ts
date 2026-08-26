import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { portfolio } from '../shared/portfolio.ts'
import type { PortfolioData } from '../shared/portfolio.types.ts'
import { validatePortfolio } from '../shared/validatePortfolio.ts'

describe('canonical portfolio data', () => {
  it('uses the approved positioning and completed degree status', () => {
    expect(portfolio.identity).toMatchObject({
      name: 'Franci Hoxha',
      title: 'Full-Stack Software Developer',
      heroStatement: 'Building modern software experiences, from idea to production.',
      capabilityLine: 'Web • Mobile • Backend • AI',
    })
    expect(portfolio.availability).toBeNull()
    expect(portfolio.journey.find((entry) => entry.id === 'masters')).toMatchObject({
      period: 'Completed July 2026',
      title: 'Master’s degree',
      verificationStatus: 'confirmed',
    })
  })

  it('keeps the existing CV path canonical and resolvable', () => {
    const cv = portfolio.assets.find((asset) => asset.id === 'cv')
    expect(cv).toMatchObject({
      status: 'available',
      src: '/Franci-Hoxha-CV.pdf',
    })
    expect(existsSync(join(process.cwd(), 'public', cv?.src?.slice(1) ?? ''))).toBe(true)
  })

  it('models the three credentials without local images or fabricated URLs', () => {
    expect(portfolio.credentials).toHaveLength(3)
    for (const credential of portfolio.credentials) {
      expect(credential.verificationUrl).toBeUndefined()
      expect(credential.asset.status).toBe('planned')
      expect(credential.asset.src).toBeUndefined()
      expect(credential.asset.plannedPath).toMatch(/^public\/certificates\//)
    }
  })

  it('rejects stale claims if they enter published data', () => {
    const invalid = structuredClone(portfolio) as PortfolioData
    invalid.projects[0].description = 'Uses Polar for payments.'

    expect(() => validatePortfolio(invalid)).toThrow(/forbidden pattern/i)
  })
})
