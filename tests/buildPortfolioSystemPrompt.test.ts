import { describe, expect, it } from 'vitest'
import { buildPortfolioSystemPrompt } from '../api/_lib/buildPortfolioSystemPrompt.ts'

describe('portfolio system prompt', () => {
  it('derives approved facts from canonical data', () => {
    const prompt = buildPortfolioSystemPrompt()

    expect(prompt).toContain('Franci Hoxha')
    expect(prompt).toContain('Full-Stack Software Developer')
    expect(prompt).toContain('Web • Mobile • Backend • AI')
    expect(prompt).toContain('Completed July 2026')
    expect(prompt).toContain('Flagship Software Project')
    expect(prompt).toContain('Complete Software Engineering Course')
  })

  it('excludes stale, unapproved, and unresolved claims', () => {
    const prompt = buildPortfolioSystemPrompt()

    expect(prompt).not.toMatch(/currently pursuing/i)
    expect(prompt).not.toMatch(/2024\s*[-–]\s*present/i)
    expect(prompt).not.toMatch(/junior full-stack/i)
    expect(prompt).not.toMatch(/polar/i)
    expect(prompt).not.toMatch(/online customer payments?/i)
    expect(prompt).not.toMatch(/customer prepayments?/i)
    expect(prompt).not.toContain('Master of Science in Informatics Engineering')
    expect(prompt).not.toContain('European University of Tirana')
    expect(prompt).not.toContain('Usually replies within a day')
  })
})
