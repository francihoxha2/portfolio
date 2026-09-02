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
    expect(portfolio.journey.find((entry) => entry.id === 'business-education')).toMatchObject({
      title: 'Master’s degree in Business Administration',
      description:
        'Completing my Master’s degree in Business Administration gave me a strong understanding of organizations, operations, customers, and the processes that connect them.',
      bridge:
        'That business foundation gave me a practical starting point for understanding how systems support people and organizations.',
      verificationStatus: 'confirmed',
    })
    expect(portfolio.journey.find((entry) => entry.id === 'masters')).toMatchObject({
      period: 'Completed July 2026',
      title: 'Master of Science in Informatics Engineering',
      description:
        'I moved deeper into software engineering through formal study and completed my Master of Science in Informatics Engineering in July 2026.',
      verificationStatus: 'confirmed',
    })
    expect(portfolio.journey.map((entry) => entry.stage)).toEqual([
      'business',
      'systems',
      'engineering',
      'product',
    ])
    expect(JSON.stringify(portfolio.journey)).not.toMatch(
      /Business Administration studies|currently studying|2024\s*[-–]\s*present/i,
    )
  })

  it('keeps the existing CV path canonical and resolvable', () => {
    const cv = portfolio.assets.find((asset) => asset.id === 'cv')
    expect(cv).toMatchObject({
      status: 'available',
      src: '/Franci-Hoxha-CV.pdf',
    })
    expect(existsSync(join(process.cwd(), 'public', cv?.src?.slice(1) ?? ''))).toBe(true)
  })

  it('models exactly the three approved credentials without fabricated URLs', () => {
    expect(portfolio.credentials).toHaveLength(3)
    expect(
      portfolio.credentials.map(({ title, provider, instructors, completedOn }) => ({
        title,
        provider,
        instructors,
        completedOn,
      })),
    ).toEqual([
      {
        title: 'Complete Software Engineering Course: Build Better Software',
        provider: 'Udemy',
        instructors: ['Yogesh Dahake'],
        completedOn: '2026-06-23',
      },
      {
        title: 'AI Coder: Complete Claude Code & Coding Agents Course',
        provider: 'Udemy',
        instructors: ['Ligency', 'Ed Donner'],
        completedOn: '2026-06-21',
      },
      {
        title: 'Succeed in the Age of AI',
        provider: 'Udemy',
        instructors: ['Dr. Angela Yu'],
        completedOn: '2026-05-18',
      },
    ])

    for (const credential of portfolio.credentials) {
      expect(credential.verificationUrl).toBeUndefined()
      expect(credential.asset).toMatchObject({
        status: 'available',
        width: 1600,
        height: 1190,
      })
      expect(credential.asset.src).toMatch(/^\/certificates\/.+\.jpg$/)
      expect(
        existsSync(join(process.cwd(), 'public', credential.asset.src?.slice(1) ?? '')),
      ).toBe(true)
    }
  })

  it('keeps all Journey narrative copy first-person and free of audit language', () => {
    const publicCopy = [
      portfolio.journeyNarrative.title,
      portfolio.journeyNarrative.introduction,
      ...portfolio.journey.flatMap((entry) => [
        entry.stageLabel,
        entry.title,
        entry.period,
        entry.description,
        entry.bridge,
      ]),
      portfolio.credentialsNarrative.title,
      portfolio.credentialsNarrative.introduction,
      portfolio.credentialsNarrative.handoff,
    ]
      .filter(Boolean)
      .join(' ')

    expect(publicCopy).toMatch(/\bI\b|\bmy\b/)
    expect(publicCopy).not.toMatch(/\bFranci\b/)
    expect(publicCopy).not.toMatch(/confirmed|verified|evidence|approved|validation|claim/i)
  })

  it('uses the seven approved capability groups and exact language set', () => {
    expect(portfolio.capabilityGroups.map((group) => group.title)).toEqual([
      'Frontend',
      'Backend / APIs',
      'Data',
      'Mobile',
      'AI',
      'Engineering / Delivery',
      'Languages',
    ])

    const languages = portfolio.capabilityGroups.find((group) => group.id === 'languages')
    expect(languages?.items.map((item) => item.label)).toEqual([
      'JavaScript',
      'TypeScript',
      'Python',
      'Java',
    ])
    expect(JSON.stringify(portfolio.capabilityGroups)).not.toContain(
      'Additional Engineering Language',
    )
  })

  it('keeps Java visible as a primary language without unsupported experience claims', () => {
    const java = portfolio.capabilityGroups
      .flatMap((group) => group.items)
      .find((item) => item.id === 'java')

    expect(java).toMatchObject({
      label: 'Java',
      prominence: 'primary',
      status: 'published',
      verificationStatus: 'confirmed',
    })
    expect(java?.evidence).toBe(
      'I use Java as one of the programming languages in my development toolkit.',
    )
    expect(java?.evidence).not.toMatch(/employment|production project|years|expert/i)
  })

  it('keeps the flagship description in Franci\'s public first-person voice', () => {
    const planify = portfolio.projects.find((project) => project.id === 'planify')

    expect(planify?.description).toBe('Planify is my flagship software project.')
  })

  it('keeps selected work limited to the confirmed project records', () => {
    const selectedProjects = portfolio.projects.filter((project) => !project.featured)

    expect(selectedProjects).toEqual([
      {
        id: 'barberspot',
        title: 'BarberSpot.al',
        category: 'Software Project',
        description: 'BarberSpot.al is part of my selected software work.',
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
        description:
          'One of my selected software projects focuses on charging-station management.',
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
