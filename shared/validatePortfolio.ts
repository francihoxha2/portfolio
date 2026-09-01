import type { PortfolioData, PublicationStatus } from './portfolio.types.ts'

const FORBIDDEN_PUBLIC_PATTERNS = [
  /currently pursuing/i,
  /2024\s*[-–]\s*present/i,
  /junior full-stack/i,
  /flagship saas project/i,
  /polar(?: for payments)?/i,
  /online customer payments?/i,
  /customer prepayments?/i,
  /payment status management/i,
]

const EXPECTED_POSITIONING = {
  name: 'Franci Hoxha',
  title: 'Full-Stack Software Developer',
  heroStatement: 'Building modern software experiences, from idea to production.',
  capabilityLine: 'Web • Mobile • Backend • AI',
} as const

const EXPECTED_CAPABILITY_GROUPS = [
  ['frontend', 'Frontend'],
  ['backend', 'Backend / APIs'],
  ['data', 'Data'],
  ['mobile', 'Mobile'],
  ['ai', 'AI'],
  ['engineering', 'Engineering / Delivery'],
  ['languages', 'Languages'],
] as const

const EXPECTED_LANGUAGE_CAPABILITIES = [
  ['javascript', 'JavaScript'],
  ['typescript', 'TypeScript'],
  ['python', 'Python'],
  ['java', 'Java'],
] as const

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`Invalid portfolio data: ${message}`)
}

function assertUniqueIds(items: Array<{ id: string }>, collection: string) {
  const ids = new Set<string>()

  for (const item of items) {
    assert(item.id.trim().length > 0, `${collection} contains an empty id`)
    assert(!ids.has(item.id), `${collection} contains duplicate id "${item.id}"`)
    ids.add(item.id)
  }
}

export function isPublished(status: PublicationStatus) {
  return status === 'published'
}

export function validatePortfolio(data: PortfolioData): PortfolioData {
  assert(data.identity.name === EXPECTED_POSITIONING.name, 'approved name changed')
  assert(data.identity.title === EXPECTED_POSITIONING.title, 'approved title changed')
  assert(
    data.identity.heroStatement === EXPECTED_POSITIONING.heroStatement,
    'approved hero statement changed',
  )
  assert(
    data.identity.capabilityLine === EXPECTED_POSITIONING.capabilityLine,
    'approved capability line changed',
  )
  assert(data.availability === null, 'availability must remain null until confirmed')

  assertUniqueIds(data.navigation, 'navigation')
  assertUniqueIds(data.contact, 'contact')
  assertUniqueIds(data.projects, 'projects')
  assertUniqueIds(data.capabilityGroups, 'capability groups')
  assertUniqueIds(data.journey, 'journey')
  assertUniqueIds(data.credentials, 'credentials')
  assertUniqueIds(data.languages, 'languages')
  assertUniqueIds(data.assets, 'assets')

  for (const group of data.capabilityGroups) {
    assertUniqueIds(group.items, `capability group "${group.id}"`)
    for (const item of group.items) {
      if (isPublished(item.status)) {
        assert(Boolean(item.evidence?.trim()), `capability "${item.id}" requires evidence`)
      }
    }
  }

  assert(
    JSON.stringify(data.capabilityGroups.map(({ id, title }) => [id, title]))
      === JSON.stringify(EXPECTED_CAPABILITY_GROUPS),
    'capability groups must match the approved Phase 6 system groups',
  )

  const languageCapabilities = data.capabilityGroups.find(
    (group) => group.id === 'languages',
  )
  assert(Boolean(languageCapabilities), 'Languages capability group is required')
  assert(
    JSON.stringify(languageCapabilities?.items.map(({ id, label }) => [id, label]))
      === JSON.stringify(EXPECTED_LANGUAGE_CAPABILITIES),
    'Languages must contain exactly JavaScript, TypeScript, Python, and Java',
  )

  const java = languageCapabilities?.items.find((item) => item.id === 'java')
  assert(java?.prominence === 'primary', 'Java must use primary language prominence')

  const assetIds = new Set(data.assets.map((asset) => asset.id))
  for (const project of data.projects) {
    if (project.previewAssetId) {
      assert(
        assetIds.has(project.previewAssetId),
        `project "${project.id}" references an unknown asset`,
      )
    }
  }

  for (const asset of data.assets) {
    if (asset.status === 'available') {
      assert(Boolean(asset.src), `available asset "${asset.id}" requires src`)
      assert(!asset.plannedPath, `available asset "${asset.id}" cannot use plannedPath`)
    } else {
      assert(Boolean(asset.plannedPath), `planned asset "${asset.id}" requires plannedPath`)
      assert(!asset.src, `planned asset "${asset.id}" must not expose a src`)
    }
  }

  for (const credential of data.credentials) {
    assert(
      credential.asset.status === 'planned' && !credential.asset.src,
      `credential "${credential.id}" must not reference a local image before Phase 7`,
    )
    assert(
      credential.verificationUrl === undefined,
      `credential "${credential.id}" must not fabricate a verification URL`,
    )
  }

  const publishedData = {
    identity: data.identity,
    metadata: data.metadata,
    navigation: data.navigation.filter((item) => isPublished(item.status)),
    contact: data.contact.filter((item) => item.public && isPublished(item.status)),
    projects: data.projects.filter((item) => isPublished(item.status)),
    capabilityGroups: data.capabilityGroups
      .filter((group) => isPublished(group.status))
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => isPublished(item.status)),
      })),
    journey: data.journey.filter((item) => isPublished(item.status)),
    credentials: data.credentials.filter((item) => isPublished(item.status)),
    languages: data.languages.filter((item) => isPublished(item.status)),
    availability: data.availability,
    assistant: data.assistant,
  }

  const serialized = JSON.stringify(publishedData)
  for (const pattern of FORBIDDEN_PUBLIC_PATTERNS) {
    assert(!pattern.test(serialized), `published data matches forbidden pattern ${pattern}`)
  }

  return data
}
