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

  it('keeps Java visible as a confirmed secondary capability', () => {
    const java = portfolio.capabilityGroups
      .flatMap((group) => group.items)
      .find((item) => item.id === 'java')

    expect(java).toMatchObject({
      label: 'Java',
      prominence: 'secondary',
      status: 'published',
      verificationStatus: 'confirmed',
    })
    expect(java?.evidence).toBeUndefined()
  })

  it('keeps selected work limited to the confirmed project records', () => {
    const selectedProjects = portfolio.projects.filter((project) => !project.featured)

    expect(selectedProjects).toEqual([
      {
        id: 'barberspot',
        title: 'BarberSpot.al',
        category: 'Software Project',
        description: 'BarberSpot.al is included in Franci’s selected software work.',
        featured: false,
        link: {
          label: 'View BarberSpot',
          href: 'https://barberspot.al',
          external: true,
          status: 'published',
          verificationStatus: 'repository-current',
        },
        stack: [],
        highlights: [],
        status: 'published',
        verificationStatus: 'confirmed',
      },
      {
        id: 'charging-station',
        title: 'Online Charging Station Management System',
        category: 'Software Project',
        description: 'A selected software project focused on charging-station management.',
        featured: false,
        link: {
          label: 'Discuss the project',
          href: '#contact',
          external: false,
          status: 'published',
          verificationStatus: 'confirmed',
        },
        stack: [],
        highlights: [],
        status: 'published',
        verificationStatus: 'confirmed',
      },
    ])

    for (const project of selectedProjects) {
      expect(project.previewAssetId).toBeUndefined()
      expect(project.stack).toHaveLength(0)
      expect(project.highlights).toHaveLength(0)
    }
  })

  it('rejects stale claims if they enter published data', () => {
    const invalid = structuredClone(portfolio) as PortfolioData
    invalid.projects[0].description = 'Uses Polar for payments.'

    expect(() => validatePortfolio(invalid)).toThrow(/forbidden pattern/i)
  })
})
